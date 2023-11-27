import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, BehaviorSubject, lastValueFrom, finalize,forkJoin, take } from 'rxjs';
import { environment } from '../../../environments/environment';
import { KotoliFireService } from '../../_services/kotoli-fire.service';
import { NotifService } from '../../_services/notif.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface LanguageDetail {
  nomFr: string;
}

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent {
  formGroup: FormGroup;
  types: any[];
  submitted = false;
  loading = false;
  searchstore ="";
  minDate: Date;
  maxDate: Date;
  subscription: Subscription;
  activities: any[];
  activitiesParticipants: any [];
  activitiesSubscription: Subscription;
  activitiesComplete: any[];
  activitiesFiltered: any[];
  isLoadingSubject = new BehaviorSubject(false);
  loading$ = this.isLoadingSubject.asObservable();
  searchuser = "";
  currentUserSubject = new BehaviorSubject(null);
  currentUser$ = this.currentUserSubject.asObservable();
  id: string;
  defaultPicUrl=environment.baseUrl+"/static/profile_picture.png";
  constructor(
    private kfSer: KotoliFireService,
    private route: ActivatedRoute,
    private notifSer: NotifService,
    private fb: FormBuilder){
  }
  async ngOnInit(){
    const today = new Date();
    const month = today.getMonth();
    const day = today.getDay();
    const year = today.getFullYear();

    this.minDate = new Date(year - 5, 0, 1);
    this.maxDate = today;

    this.createForm();
    let isFirst = true;
    this.types = await Promise.all((await lastValueFrom(this.kfSer.getActivityTypes())).docs.map((elt)=>elt.data()));
    this.subscription = this.kfSer.getActivitiesByDateRange(this.f.start.value, this.f.end.value).pipe(
    finalize(() => null))
    .subscribe({
        next: async actionArray => {
          isFirst = false;
          this.loading = false;
 
         this.activities = await Promise.all(actionArray.docs.map((doc)=>{ 
          return{
             ...doc.data(),
            id: doc.id,
            ref: doc.ref,
            };
         }).map(async (activity)=>{
          let participantsQuery = await lastValueFrom(this.kfSer.getActivityParticipants(activity.ref));
          if(participantsQuery.size > 0){
            activity.participants =await Promise.all(participantsQuery.docs.map(async (item)=>{
            let  itemData = await item.data();
              let participantData =  {...itemData, id: item.id, userData: (await lastValueFrom(this.kfSer.getUserById(itemData.userRef.id).get())).data()}
              return participantData;
            }));
          }else{
            activity.participants = [];
          }
          console.log(activity.participants);
          return activity;
         }));
      },
      error: error =>{
          console.log("this.error")
          console.log(error)
          this.notifSer.openSnackBar('error', error.message, 8)
          this.isLoadingSubject.next(false);
        }
    });
  }
  async setCurrentUser(id){
    const userDoc =  lastValueFrom((await this.kfSer.getUserById(id)).get());
    const userData = {...(await userDoc).data(), id: (await userDoc).id} ;
    this.currentUserSubject.next(userData);
  }

  createForm(){
    this.formGroup = this.fb.group({
      'start': [null],
      'end': [null],
      'validate': ''
    });
  }
  get f() {
    return this.formGroup.controls;
  }
  async onSubmit(data){

    console.log("Données du formulaire soumises:", data);
    if(!this.formGroup.valid) return;
    this.loading = true
    let isFirst = true;
    this.submitted = true;
    this.subscription = this.kfSer.getActivitiesByDateRange(this.f.start.value, this.f.end.value).pipe(
    finalize(() => null))
    .subscribe({
        next: async actionArray => {
          isFirst = false;
          this.loading = false;
 
         this.activities = await Promise.all(actionArray.docs.map((doc)=>{ 
          return{
             ...doc.data(),
            id: doc.id,
            ref: doc.ref,
            };
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
              this.activitiesComplete = [...this.activities];
              this.activitiesFiltered = [...this.activitiesComplete];

      },
      error: error =>{
          console.log("this.error")
          console.log(error)
          this.notifSer.openSnackBar('error', error.message, 8)
          this.isLoadingSubject.next(false);
        }
    });

  }

  onChange(value: any) {
    if (value.target.value === "0" || value.target.value === "") {
        // Si la valeur est celle de l'option de réinitialisation, afficher toutes les activités
        this.activitiesFiltered = [...this.activitiesComplete];
    } else {
        // Sinon, filtrer normalement
        this.activitiesFiltered = this.activitiesComplete.filter((elt) => {
            return elt.typeName === value.target.value;
        });
    }
}

resetSearch() {
  // Réinitialiser le champ de recherche par nom/numéro de série
  this.searchuser = "";

  // Réinitialiser le type d'activité
  let selectElem = document.getElementById('exampleFormControlSelect1') as HTMLSelectElement;
  if (selectElem) {
    selectElem.value = "0";
  }

  // Réinitialiser les champs de date
  this.formGroup.reset({
    start: null,
    end: null
  });

  // Recharger les activités
  this.activitiesFiltered = [];
}

deleteActivity(activityId: string) {
  this.kfSer.deleteActivity(activityId).then(() => {
      // Supprimer l'activité de la liste après la suppression réussie
      this.activitiesComplete = this.activitiesComplete.filter(activity => activity.id !== activityId);
      this.activitiesFiltered = this.activitiesFiltered.filter(activity => activity.id !== activityId);
  }).catch(error => {
      console.error('Error deleting activity:', error);
  });
}

}
