import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription, BehaviorSubject, lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { FileUpload } from '../../_models/file-upload';
import { FileUploadService } from '../../_services/file-upload.service';
import { KotoliFireService } from '../../_services/kotoli-fire.service';
import { NotifService } from '../../_services/notif.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {

      // Message
  messageSubject: string;
  messageMessage: string;
  messageSubjectLabel: string;
  messageMessageLabel: string;

  isSignalementActivity = true;
  chats: any [];
  subscription: Subscription;
  isLoadingSubject = new BehaviorSubject(false);
  chatSubject = new BehaviorSubject(null);
  chatSubject$ = this.chatSubject.asObservable();
  loading$ = this.isLoadingSubject.asObservable();
  currentChat = null;
  chatConversation: any[] = [];
  adminUser;
  currentUserDetails;
  message = ""
  searchTerm: string = '';
  filteredChats: any[] = [];
  
  isChatListLoading = false;
  
  chatImage;
  chatImageStatic;
  selectedFiles?: FileList;
  currentFileUpload?: FileUpload;
  percentage = 0;
  fileName = "";
  constructor(
    private kf: KotoliFireService,
    private nf: NotifService,
    private sanitized: DomSanitizer,
    private uploadService: FileUploadService
    ){

  }

  async ngOnInit(){
    this.isChatListLoading = true;
    let userDoc = await lastValueFrom(this.kf.getAdminUser().get());
    console.log("userDoc.docs[0].ref.id")
    console.log(userDoc.docs[0].ref.id)
    this.adminUser = userDoc;
    let userId = userDoc.docs[0].ref.id;
    this.subscription = await this.kf.getAdminContactChats(userDoc.docs[0].ref).snapshotChanges()
    .subscribe(
        {next: async (data)=>{
          this.chats = await Promise.all(data.map(item => {
            return {
              id: item.payload.doc.id,
              ref: item.payload.doc.ref,
              ...item.payload.doc.data() as {}
            } as any;
          }).map(async (item)=>{

            if(item.user_a.id == userId){
              console.log("Admin is User A")
              let query = await lastValueFrom(this.kf.getUserById(item.user_b.id).get());
              if(query.exists){
                item.user = { 
                  ...query.data(), 
                  id: query.id,
                  photo_url: query.data().photo_url ? 
                            query.data().photo_url : 
                            environment.baseUrl + "/static/profile_picture.png"};
              }else{
                item.user = null;
              }
              if(item.last_message_seen_by
                .map((elt)=>{return elt.id})
                .includes(item.user_b.id))
              {
                  item.isSeen = true;
              }else{
                item.isSeen = false;
              }
            }else{
              console.log("Admin is User B")
              let query = await lastValueFrom(this.kf.getUserById(item.user_a.id).get());
              console.log(query.data())
              if(query.exists){
                item.user = 
                {
                  ...query.data(), 
                  id: query.id,
                  photo_url: query.data().photo_url ? 
                            query.data().photo_url : 
                            environment.baseUrl + "/static/profile_picture.png"};
              }else{
                item.user = null;
              }

              if(item.last_message_seen_by
                      .map((elt)=>{return elt.id})
                      .includes(item.user_b.id)){
                  item.isSeen = true;
              }else{
                item.isSeen = false;
              }
            }

            return item;
          
          }));
          this.filteredChats = [...this.chats];
          console.log(this.chats);
          if(this.chats.length > 0){
            this.setChatSubject(this.chats[0], false)
           /*  for(let i = 0; i <15;i++){
              this.chats.push(this.chats[0])
            } */
          }
          

       /*    this.chats= []; */
          this.isChatListLoading = false;
          this.isLoadingSubject.next(false);
        },error: error =>{
          this.isChatListLoading = false;
          console.log("this.error")
          console.log(error)
          this.nf.openSnackBar('error', error.message, 8)
          this.isLoadingSubject.next(false);
        }
    });

  }

  async setChatSubject(chat, shouldSeenBeSet){
    this.chatSubject.next(chat);
    if(chat.user_a.id == this.adminUser.docs[0].ref.id){
      console.log("Admin is User A")
      let query = await lastValueFrom(this.kf.getUserById(chat.user_b.id).get());
      if(query.exists){
        chat.user = { 
          ...query.data(), 
          id: query.id,
          photo_url: query.data().photo_url ? 
                    query.data().photo_url : 
                    environment.baseUrl + "/static/profile_picture.png"};
      }else{
        chat.user = null;
      }
    }else{
      console.log("Admin is User B")
      let query = await lastValueFrom(this.kf.getUserById(chat.user_a.id).get());
      console.log(query.data())
      if(query.exists){
        chat.user = 
        {
          ...query.data(), 
          id: query.id,
          photo_url: query.data().photo_url ? 
                    query.data().photo_url : 
                    environment.baseUrl + "/static/profile_picture.png"};
      }else{
        chat.user = null;
      }
    }
    this.currentUserDetails = 
    this.currentChat = chat;
    if(shouldSeenBeSet === true){
      if(this.currentChat.isSeen == false){
        await this.kf.updateSeen(this.currentChat.id, this.adminUser.docs[0].ref)
      }
    }
    
    console.log(chat);
    await this.getChatConversation(chat);
  }
  async getChatConversation(chat){
    await this.kf.getChatMessages(chat.ref).snapshotChanges().subscribe({
      next: async (data)=>{
          this.chatConversation = await Promise.all(data.map(item => {
            return {
              id: item.payload.doc.id,
              ...item.payload.doc.data() as {}
            } as any;
          }).map(item =>{
              if(item.user.id == this.adminUser.docs[0].ref.id){
                console.log("isAdmin message")
                item.isAdminMessage= true;
              }else{
                item.isAdminMessage= false;
              }
              if (item.text && item.text != ""){
                console.log(item.text)
                item.text = this.sanitized.bypassSecurityTrustHtml(item.text)
              /*   item.text.split("\n") */
             /*  item.text = item.text.replace('\\n',''); */
              }
              return item;
          }));
          console.log("Chat messages")
          console.log(this.chatConversation);

              // Extracting message details from first message
          if (this.chatConversation && this.chatConversation.length > 0) {
            const messageRegex = /Sujet : (.*?)Message :(.*?)|Subject : (.*?)Message :(.*?)/;
           
           for (let i = 0; i < this.chatConversation.length; i++) {
             const message = this.chatConversation[i];
             const reportMessage = message.text.changingThisBreaksApplicationSecurity;
             
             if (reportMessage) {
               const messageMatch = messageRegex.exec(reportMessage);

              if (messageMatch) {

                if (messageMatch[1]) {  // French
                 this.messageSubject = messageMatch[1].trim();
                 this.messageMessage = messageMatch[2].trim();
                 this.messageSubjectLabel = "Sujet : ";
                 this.messageMessageLabel = "Message : ";
               } else if (messageMatch[3]) {  // English
                this.messageSubject = messageMatch[3].trim();
                this.messageMessage = messageMatch[4].trim();
                this.messageSubjectLabel = "Subject: ";
                this.messageMessageLabel = "Message: ";
                }
                             message.isReported = true;
              }
              }
              }
            }
    },
      error: error => {
        console.log(error);
      }
    })
  }

   // filter chat conversation
   filterChats() {
    console.log('filterChats called with:', this.searchTerm);
  
    // Assuming this.chats is the array that contains all your chat conversations.
    let chatsToFilter = this.chats; // Replace with the actual variable name you have for all chats
  
    if (this.searchTerm) {
        this.filteredChats = chatsToFilter.filter(chat => 
            chat.user && chat.user.display_name && chat.user.display_name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    } else {
        this.filteredChats = chatsToFilter;
    }
  }





  switchView(){
    this.isSignalementActivity = !this.isSignalementActivity;
  }

  async sendMessage(){
    let message = {
        user: this.adminUser.docs[0].ref,
        chat: this.currentChat.ref,
        timestamp: new Date(),
        text: this.message
    }
/*     await this.kf.sendMessage(message); */
    const newMessage =  (await  this.kf.sendMessage(this.currentChat.id, message)).get();
    const newMessageData = (await newMessage).data();
    const newMessageId = (await newMessage).id;
    if(this.chatImage != null){
      await this.upload(newMessageId);
    }
    if(newMessageId){
      this.message = "";
    
      this.resetFile()
    }
  }

  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      console.log(file.name);
      reader.onload = () => {
 
        this.chatImageStatic = reader.result as string;
        if(file){
          this.fileName = file.name
        }
       /*  this.formGroup.patchValue({
          fileSource: reader.result
        }); */
 
      };
    }
  }

  upload(id): void {
    console.log("Hello from Upload")
    console.log(this.chatImage)
    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);
      this.selectedFiles = undefined;

      if (file) {
        this.currentFileUpload  = new FileUpload(file);
        this.uploadService.pushCategoryPicToStorage(this.currentFileUpload,'admin-chats-uploads',id).then(
          data => {
            console.log("data from push")
            console.log(data);
            this.kf.attachImageToMessage(id, {image: data});
           /*  this.percentage = Math.round(percentage ? percentage : 0); */
          },
          error => {
            console.log(error);
          }
        );
      }
    }
  }
  openFile(){
    document.getElementById('input_file').click();
  }
  resetFile(){
   (document.querySelector('#input_file') as any).value ="";
   this.fileName = "";
   this.selectedFiles = null;
   this.chatImage = null;
    /* document.getElementById('input_file').va = ""; */
  }
}
