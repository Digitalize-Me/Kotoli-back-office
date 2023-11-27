import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { arrayUnion } from 'firebase/firestore';
import { lastValueFrom } from 'rxjs';
import { Observable, combineLatest, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocumentReference } from '@angular/fire/firestore';


// Définition de l'interface juste avant la fonction
interface ActivityDocument {
  participants?: DocumentReference[];
}

@Injectable({
  providedIn: 'root'
})
export class KotoliFireService {
  user = JSON.parse(localStorage.getItem("userData") )
  constructor(
    private fstore: AngularFirestore,
  ) { }

  getUsers(){
    
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() );
    var lastDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    let users = this.fstore.collection<any>('users',  
      x => x
        .orderBy('created_time', 'desc')
      ).snapshotChanges();
    return users;
  }
  getActivities(){
      return this.fstore.collection<any>('activities',  
      x => x.orderBy('created_at', 'desc')
      ).get();
  }

  getActivitiesCreatedBy(ref){
  
      return this.fstore.collection<any>('activities',  
      x => x .where("created_by", "==", ref)
      .orderBy('created_at', 'desc')
      ).get();
  }

 
  getAdminUser(){
    return this.fstore.collection<any>('users',  
    x => x .where("role", "==", "admin")
    ) ;
  }
  
  getActivitiesByDateRange( dateDebut, dateFin){
  
    dateFin.setHours(23, 59, 59, 999);
    let activities = this.fstore.collection<any>('activities',  
       x => x
       .where('date', '>=', dateDebut )
       .where('date', '<=', dateFin )
       ).get();
       return activities
}

  getUserById(id): AngularFirestoreDocument<any>{
    return  this.fstore.collection<any>('users').doc(id);
  }

  getActivityParticipants(ref){
    
    let resp = this.fstore.collection<any>('participants',  
      x => x.where("activityRef","==",ref)
      ).get();
      return resp
 
  }

  getParticipationsOfUser(userRef){
    
    let resp = this.fstore.collection<any>('participants',  
      x => x.where("userRef","==",userRef)
      ).get();
      return resp
 
  }
  getActivityById(id): AngularFirestoreDocument<any>{
    return  this.fstore.collection<any>('activities').doc(id);
  }

  getActivityTypeById(ref): AngularFirestoreDocument<any> {
    return this.fstore.doc<any>(ref.path); // Récupérer le document en utilisant la référence
  }

  getActivityTypeByRef(typeRef): Observable<any> {
    return this.fstore.doc<any>(typeRef.path).valueChanges();
  }

  getLanguageByRef(langRef): Observable<any> {
    return this.fstore.doc<any>(langRef.path).valueChanges();
  }

  getChatMessages(ref){
    return this.fstore.collection<any>('chat_messages',  
    x => x .where("chat", "==", ref)
           .orderBy('timestamp', 'desc')
    );
  }

  getActivityTypes(){
  
    return this.fstore.collection<any>('activity_types',  
    x => x 
    .orderBy('id', 'asc')
    ).get();
}

  getSignaledChat(user1: string, user2: string) {
    // Convertir les chaînes d'identifiant en références de document
    let user1Ref = this.fstore.doc('/users/' + user1).ref;
    let user2Ref = this.fstore.doc('/users/' + user2).ref;

    // Ajoutez les logs ici
    console.log('User1 Reference:', user1Ref);
    console.log('User2 Reference:', user2Ref);

    // First query: user1 in user_a and user2 in user_b
    const query1$ = this.fstore.collection('chats', x => 
        x.where('user_a', '==', user1Ref).where('user_b', '==', user2Ref)
    ).snapshotChanges();

    // Second query: user2 in user_a and user1 in user_b
    const query2$ = this.fstore.collection('chats', x => 
        x.where('user_a', '==', user2Ref).where('user_b', '==', user1Ref)
    ).snapshotChanges();

    return combineLatest([query1$, query2$]).pipe(
      map(([result1, result2]) => {
          let doc1 = result1.length > 0 ? result1[0].payload.doc : null;
          let doc2 = result2.length > 0 ? result2[0].payload.doc : null;
  
          if (doc1) {
              return { id: doc1.id, ref: doc1.ref, ...doc1.data() as object };
          } else if (doc2) {
              return { id: doc2.id, ref: doc2.ref, ...doc2.data() as object };
          } else {
              return null;  // No chat found for the given users
          }
      })
  );
}

getAdminSignalementsChats(ref){
    return this.fstore.collection<any>('chats',  
    x => x .where("users", "array-contains", ref)
            .where("is_signalement","==", true)
          .orderBy("last_message_time","desc")
         
    );
}
getAdminContactChats(ref){
  return this.fstore.collection<any>('chats',  
  x => x .where("users", "array-contains", ref)
          .where("is_signalement","==", false)
        .orderBy("last_message_time","desc")
       
  );
}


async deleteActivity(activityId: string): Promise<void> {
  try {
    // Obtenir la référence de l'activité
    const activityRef = this.fstore.collection('activities').doc(activityId);

     // Récupérer le document de l'activité
     const activityDocSnapshot = await firstValueFrom(activityRef.get());
     const activityData = activityDocSnapshot.data() as ActivityDocument; // Cast avec l'interface
 
     // Vérifier si l'activité a des participants
     if (activityData && activityData.participants) {
       for (const participantRef of activityData.participants) {
         // Obtenir la référence du document du participant
         const participantDocRef = this.fstore.doc(participantRef.path);
 
         // Vérifier si le document du participant existe
         const participantDocSnapshot = await firstValueFrom(participantDocRef.get());
         if (participantDocSnapshot.exists) {
           // Supprimer le document du participant
           await participantDocRef.delete();
         }
       }
     }

    // Supprimer l'activité
    await activityRef.delete();
    console.log(`Activity with ID: ${activityId} has been deleted`);
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error; // Pour permettre la gestion des erreurs dans le composant
  }
}


async sendMessage(chatId:string, messageData: any){
  console.log(chatId)
  await this.fstore.collection("chats").doc(chatId).update({
    last_message_seen_by: [messageData.user],
    last_message_sent_by: messageData.user,
    last_message: messageData.text,
    last_message_time : new Date()

  })
  return await this.fstore.collection<any>('chat_messages').add(messageData);
}
async attachImageToMessage(id, data: any){
  return await this.fstore.collection<any>('chat_messages').doc(id).update(data);
}

async updateSeen(chatId, user){
  return await this.fstore.collection("chats").doc(chatId).update({
    last_message_seen_by: arrayUnion(user),
  })
}
}
