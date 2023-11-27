import { Component } from '@angular/core';
import { KotoliFireService } from '../../_services/kotoli-fire.service';
import { BehaviorSubject, Subscription, lastValueFrom,forkJoin, take } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NotifService } from '../../_services/notif.service';

interface LanguageDetail {
  nomFr: string;
}

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent {
  isCreator = true;
  activities: any[];
  activitiesParticipants: any [];
  activitiesSubscription: Subscription;
  isLoadingSubject = new BehaviorSubject(false);
  loading$ = this.isLoadingSubject.asObservable();
  searchuser = "";
  currentUserSubject = new BehaviorSubject(null);
  currentUser$ = this.currentUserSubject.asObservable();
  id: string;
  defaultPicUrl="https://kotoli-api.web.app/static/profile_picture.png";
  constructor(
    private kfSer: KotoliFireService,
    private route: ActivatedRoute,
    private notifSer: NotifService){
    this.id = this.route.snapshot.paramMap.get('id');
    console.log(this.id, "is the id")
  }
  async ngOnInit(){
    this.isLoadingSubject.next(true);
    this.setCurrentUser(this.id);
    let userDoc =(await lastValueFrom(this.kfSer.getUserById(this.id).get()));
    console.log(userDoc.data());
    this.activitiesSubscription = await this.kfSer.getActivitiesCreatedBy(userDoc.ref)
    .subscribe(
        {next: async (data)=>{
         this.activities = await Promise.all(data.docs.map((doc)=>{ 
           return{...doc.data(), id: doc.id, ref: doc.ref};
          }).map(async (activity)=>{
            console.log("Activity Type:", activity.type); // Ajoutez ce log pour vérifier la valeur de activity.type

            // Traitement du type d'activité
            if (activity.type) {
              this.kfSer.getActivityTypeByRef(activity.type).subscribe(typeData => {
                if (typeData) {
                  activity.typeName = typeData.type_fr; // ou typeData.type_en selon la langue
                } else {
                  activity.typeName = '';
                }
              });
            }

          // Traitement des langues
          if (activity.languages && activity.languages.length > 0) {
              const languageNamesRequests = activity.languages.map(langRef => 
                  this.kfSer.getLanguageByRef(langRef).pipe(take(1))
              );
              const languageDetails: LanguageDetail[] = await lastValueFrom(forkJoin(languageNamesRequests)) as LanguageDetail[];
              activity.languageNames = languageDetails.map(lang => lang.nomFr);
          }

          // Traitement des participants
          let participantsQuery = await lastValueFrom(this.kfSer.getActivityParticipants(activity.ref));
          activity.participants = participantsQuery.size > 0
              ? await Promise.all(participantsQuery.docs.map(async (item) => {
                  let itemData = await item.data();
                  return {
                      ...itemData,
                      id: item.id,
                      userData: (await lastValueFrom(this.kfSer.getUserById(itemData.userRef.id).get())).data()
                  };
              }))
              : [];
          return activity;
      }));
      this.isLoadingSubject.next(false);
        },error: error =>{
          console.log("this.error")
          console.log(error)
          this.notifSer.openSnackBar('error', error.message, 8)
          this.isLoadingSubject.next(false);
        }
    });


  this.activitiesParticipants = await Promise.all((await lastValueFrom(this.kfSer.getParticipationsOfUser(userDoc.ref))).docs.map(async (elt)=>{
     let participantData = {...elt.data()} as any;
     console.log(participantData);
      let activitiyDoc = await lastValueFrom(this.kfSer.getActivityById(participantData.activityRef.id).get());
      console.log("activityDocData")
      console.log(activitiyDoc.data())
      participantData = {...participantData, ...activitiyDoc.data(), id: activitiyDoc.id};
      console.log("participantDataFinal", participantData);

        // Traitement du type d'activité
        if (participantData.type) {
          this.kfSer.getActivityTypeByRef(participantData.type).subscribe(typeData => {
            if (typeData) {
              participantData.typeName = typeData.type_fr; // ou typeData.type_en selon la langue
            } else {
              participantData.typeName = '';
            }
          });
        }

        // Traitement des langues
        if (participantData.languages && participantData.languages.length > 0) {
          const languageNamesRequests = participantData.languages.map(langRef => 
            this.kfSer.getLanguageByRef(langRef).pipe(take(1))
          );
          const languageDetails: LanguageDetail[] = await lastValueFrom(forkJoin(languageNamesRequests)) as LanguageDetail[];
          participantData.languageNames = languageDetails.map(lang => lang.nomFr);
        }

      let participantsQuery = await lastValueFrom(this.kfSer.getActivityParticipants(activitiyDoc.ref));
              if(participantsQuery.size > 0){
                participantData.participants =await Promise.all(participantsQuery.docs.map(async (item)=>{
                let  itemData = await item.data();
                  let participantDataAct =  {...itemData, id: item.id, userData: (await lastValueFrom(this.kfSer.getUserById(itemData.userRef.id).get())).data()}
                  return participantDataAct;
                }));
              }else{
                participantData.participants = [];
              }
              console.log(participantData.participants);
     /*  this.activitiesParticipants.push(participantData); */
      return participantData;
    }))
    this.isLoadingSubject.next(false);

    console.log("activityParticipants");
    console.log(this.activitiesParticipants);
  }

  deleteActivity(activityId: string) {
    this.kfSer.deleteActivity(activityId).then(() => {
        // Mettre à jour les listes après la suppression réussie
        this.activities = this.activities.filter(activity => activity.id !== activityId);
        this.activitiesParticipants = this.activitiesParticipants.filter(activity => activity.id !== activityId);
    }).catch(error => {
        console.error('Error deleting activity:', error);
    });
}

  async setCurrentUser(id){
    const userDoc =  lastValueFrom((await this.kfSer.getUserById(id)).get());
    const userData = {...(await userDoc).data(), id: (await userDoc).id} ;

     // Conversion de la date de naissance en âge
  if (userData.Birthdate) {
    const birthdate = userData.Birthdate.toDate(); // Convertir le Timestamp en Date
    const age = this.calculateAge(birthdate);
    userData.age = age;
  }

  this.currentUserSubject.next(userData);
}

calculateAge(birthdate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const monthDiff = today.getMonth() - birthdate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }
  return age;
}

switchViewCreatorParticipant(targetView: string) {
  if (targetView === 'creator' && !this.isCreator) {
    this.isCreator = true;
  } else if (targetView === 'participant' && this.isCreator) {
    this.isCreator = false;
  }
}
}
