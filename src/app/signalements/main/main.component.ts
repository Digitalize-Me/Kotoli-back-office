import { Component } from '@angular/core';
import { KotoliFireService } from '../../_services/kotoli-fire.service';
import { BehaviorSubject, Subscription, lastValueFrom, of, switchMap, take, forkJoin } from 'rxjs';
import { NotifService } from '../../_services/notif.service';
import { environment } from '../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { FileUpload } from '../../_models/file-upload';
import { FileUploadService } from '../../_services/file-upload.service';
import { QuerySnapshot } from '@firebase/firestore-types';

interface LanguageDetail {
  nomFr: string;
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
    // Activity
  activityId: string;
  activitySubject: string;
  activityMessage: string;
  activityIdLabel: string;
  activitySubjectLabel: string;
  activityMessageLabel: string;

    // Message
  senderId: string;
  recipientId: string;
  messageSubject: string;
  messageMessage: string;
  senderIdLabel: string;
  recipientIdLabel: string;
  messageSubjectLabel: string;
  messageMessageLabel: string;

  activityDetails: any = null;
  activityChats: any[] = [];
  messageChats: any[] = [];
  currentView: 'activity' | 'message' = 'activity';
  defaultPicUrl=environment.baseUrl+"/static/profile_picture.png";
  isSignalementActivity = true;
  chats: any [];
  subscription: Subscription;
  isLoadingSubject = new BehaviorSubject(false);
  chatSubject = new BehaviorSubject(null);
  chatSubject$ = this.chatSubject.asObservable();
  loading$ = this.isLoadingSubject.asObservable();
  currentChat = null;
  chatConversation: any[] = [];
  signaledChat: any;
  signaledChatMessages: any[] = [];
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
    this.subscription = await this.kf.getAdminSignalementsChats(userDoc.docs[0].ref).snapshotChanges()
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
          this.activityChats = this.chats.filter(chat => chat.report_type === 'activity');
          this.messageChats = this.chats.filter(chat => chat.report_type === 'message');
          this.filteredChats = [...this.chats];
          if (this.currentView === 'activity') {
            this.filteredChats = [...this.activityChats];
            if (this.activityChats && this.activityChats.length > 0) {
        this.setChatSubject(this.activityChats[0], false);
    }
} else if (this.currentView === 'message') {
  this.filteredChats = [...this.messageChats];
  if (this.messageChats && this.messageChats.length > 0) {
        this.setChatSubject(this.messageChats[0], false);
    }
}
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

  async setChatSubject(chat,shouldSeenBeSet){
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

    // Extracting activity signalement or message signalement details from signalement first message (report)
    if (this.chatConversation && this.chatConversation.length > 0) {
       const activityRegex = /Numéro de série de l'activité signalée :(.*?)Sujet :(.*?)Message :(.*)|Serial number of reported activity:(.*?)Subject:(.*?)Message:(.*)/;
       const messageRegex = /Identifiant de l'expéditeur :(.*?)Identifiant du destinataire :(.*?)Sujet :(.*?)Message :(.*)|Sender identifier:(.*?)Recipient Identifier:(.*?)Subject:(.*?)Message:(.*)/;
      
      for (let i = 0; i < this.chatConversation.length; i++) {
        const message = this.chatConversation[i];
        const reportMessage = message.text.changingThisBreaksApplicationSecurity;
        
        if (reportMessage) {
          const activityMatch = activityRegex.exec(reportMessage);
          const messageMatch = messageRegex.exec(reportMessage);
          this.isSignalementActivity = activityRegex.test(reportMessage);

         if (activityMatch) {

               if (activityMatch[1]) {  // French
                this.activityId = activityMatch[1].trim();
                this.activitySubject = activityMatch[2].trim();
                this.activityMessage = activityMatch[3].trim();
                this.activityIdLabel = "Numéro de série de l'activité signalée :";
                this.activitySubjectLabel = "Sujet :";
                this.activityMessageLabel = "Message :";
              } else if (activityMatch[4]) {  // English
               this.activityId = activityMatch[4].trim();
               this.activitySubject = activityMatch[5].trim();
               this.activityMessage = activityMatch[6].trim();
               this.activityIdLabel = "Serial number of reported activity:";
               this.activitySubjectLabel = "Subject:";
               this.activityMessageLabel = "Message:";
               }
                            message.isReported = true;

                // Retrieve activity ID to create activity card
                if (this.activityId) {
                  this.kf.getActivityById(this.activityId)
                      .snapshotChanges()  // Utilisez snapshotChanges() au lieu de valueChanges()
                      .pipe(
                        switchMap(snapshot => {
                          console.log("Snapshot:", snapshot); // Log the snapshot for debugging
                          if (snapshot.payload.exists) {
                              const data = snapshot.payload.data();
                              const ref = snapshot.payload.ref;
                              console.log("Activity Details:", data); // Log the details for debugging
                              // ... Any additional processing...
                              this.activityDetails = {
                                  ...data,
                                  id: this.activityId,
                                  ref: ref  // Add the reference here
                              };
                                // Retrieve activity type details
                                if (this.activityDetails.type) {
                                  this.kf.getActivityTypeByRef(this.activityDetails.type)
                                      .subscribe(typeData => {
                                          console.log("Type data received in component:", typeData);
                                          if (typeData) {
                                              this.activityDetails.typeName = typeData.type_fr; // or typeData.type_en based on language
                                              console.log("Activity type name set:", this.activityDetails.typeName);
                                          }
                                      });
                                }

                                                                // Après avoir récupéré les détails de l'activité...
                                if (this.activityDetails.languages && this.activityDetails.languages.length > 0) {
                                  const languageNamesRequests = this.activityDetails.languages.map(langRef => 
                                      this.kf.getLanguageByRef(langRef).pipe(take(1))
                                  );

                                  forkJoin(languageNamesRequests).subscribe((languageDetails: LanguageDetail[]) => {
                                    this.activityDetails.languageNames = languageDetails.map(lang => lang.nomFr);
                                    console.log("Noms de langues:", this.activityDetails.languageNames);
                                });
                                }

                            return this.kf.getActivityParticipants(ref);
                        } else {
                            console.log(`No activity found for ID: ${this.activityId}`);
                            return of(null); // Return null if the activity doesn't exist
                        }
                    })
                )
                      .subscribe(async (participantsQuery: QuerySnapshot<any> | null) => {
                        // Si participantsQuery est null, n'effectuez aucune opération et retournez
                        if (!participantsQuery) {
                          console.log('Aucun participant trouvé ou activité supprimée.');
                          // Vous pouvez également définir ici activityDetails à null ou à un objet avec des valeurs par défaut
                          this.activityDetails = null;
                          return; // Sortie anticipée de la fonction
                        }

                        if (participantsQuery.size > 0) {
                            this.activityDetails.participants = await Promise.all(participantsQuery.docs.map(async item => {
                                let itemData = await item.data();
                                let participantData = {
                                    ...itemData,
                                    id: item.id,
                                    userData: (await lastValueFrom(this.kf.getUserById(itemData.userRef.id).get())).data()
                                };
                                return participantData;
                            }));
                        } else {
                            this.activityDetails.participants = [];
                        }
                        console.log("Participants details:", this.activityDetails.participants);
                    });
              }
              

            } else if (messageMatch) {

         if (messageMatch[1]) {  // C'est la version française
          this.senderId = messageMatch[1].trim();
          this.recipientId = messageMatch[2].trim();
          this.messageSubject = messageMatch[3].trim();
          this.messageMessage = messageMatch[4].trim();
          this.senderIdLabel = "Identifiant de l'expéditeur :";
          this.recipientIdLabel = "Identifiant du destinataire :";
          this.messageSubjectLabel = "Sujet :";
          this.messageMessageLabel = "Message :";
           console.log("SenderId:", this.senderId);
          console.log("RecipientId:", this.recipientId);
          } else if (messageMatch[5]) {  // C'est la version anglaise
          this.senderId = messageMatch[5].trim();
          this.recipientId = messageMatch[6].trim();
          this.messageSubject = messageMatch[7].trim();
          this.messageMessage = messageMatch[8].trim();
          this.senderIdLabel = "Sender identifier:";
          this.recipientIdLabel = "Recipient Identifier:";
          this.messageSubjectLabel = "Subject:";
          this.messageMessageLabel = "Message:";
         }
                        message.isReported = true;

          // Retrieve chat to create report chat
          this.kf.getSignaledChat(this.senderId, this.recipientId).subscribe(signaledChat => {
           if (signaledChat) {
          this.signaledChat = signaledChat;
           console.log("Received signaledChat:", this.signaledChat);

           // Retrieve chat message to create report chat
          this.kf.getChatMessages(this.signaledChat.ref).snapshotChanges().subscribe({
          next: async (chatData) => {
              this.signaledChatMessages = await Promise.all(chatData.map(item => {
                  return {
                      id: item.payload.doc.id,
                      ...item.payload.doc.data() as {}
                  } as any;
                }).map(item => {
                    if (item.user.id === this.senderId) {
                        item.isFromSender = true;
                    } else if (item.user.id === this.recipientId) {
                        item.isFromSender = false;
                    }
        
                    if (item.text && item.text !== "") {
                        item.text = this.sanitized.bypassSecurityTrustHtml(item.text);
                    }
                    
                    return item;
                }));
              console.log("Received chat messages for signaled chat:", this.signaledChatMessages);
          },
          error: chatError => {
              console.log(chatError);
          }
      });

  } else {
      console.log('No chat found for the given user IDs.');
  }
});
                        
            console.log("Message marked as reported:", message);
            break; // Exit the loop as we found the reported message
            } else {
            console.log("Regex did not match the report message:", reportMessage);
            }
        } else {
          console.log("Chat message text is undefined for message index:", i);
        }
      }
    } else {
      console.log("No chat conversation available.");
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
    let chatsToFilter = [];
    
    if (this.currentView === 'activity') {
        chatsToFilter = this.activityChats;
    } else if (this.currentView === 'message') {
        chatsToFilter = this.messageChats;
    }
    
    if (this.searchTerm) {
        this.filteredChats = chatsToFilter.filter(chat => 
            chat.user && chat.user.display_name && chat.user.display_name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    } else {
        this.filteredChats = chatsToFilter;
    }
}

// switch tab for activités / messages
switchView(viewType: 'activity' | 'message') {
  this.currentView = viewType;
  if (this.currentView === 'activity' && this.activityChats) {
    this.filteredChats = [...this.activityChats];
    if (this.activityChats.length > 0) {
      this.setChatSubject(this.activityChats[0], false);
    }
} else if (this.currentView === 'message' && this.messageChats) {
    this.filteredChats = [...this.messageChats];
    if (this.messageChats.length > 0) {
      this.setChatSubject(this.messageChats[0], false);
    }
}
this.filterChats();
}

// delete an activity
deleteActivity(activityId: string) {
  this.kf.deleteActivity(activityId).then(() => {
  }).catch(error => {
    console.error('Error deleting activity:', error);
  });
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
