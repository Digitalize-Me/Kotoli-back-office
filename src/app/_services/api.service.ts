import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private fstore: AngularFirestore, private http: HttpClient) { }

  setStatus(data){
    return this.http.put<any>(`${environment.apiUrl}/admin/users/setStatus`,data);
  }
  confirmIdentity(data){
    return this.http.put<any>(`${environment.apiUrl}/admin/users/confirmIdentity`,data);
  }
  delete(id){
    return this.http.delete<any>(`${environment.apiUrl}/app/deliveryMen/${id}`);
  }

updateUserStatus(userId: string, newStatus: string): Promise<void> {
    return this.fstore.collection('users').doc(userId).update({ status: newStatus });
}

  deleteUser(userId) {
    return this.fstore.collection('users').doc(userId).delete();
  }


}
