import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { User } from '../_models/user';
import { NotifService } from './notif.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  loggedIn = new BehaviorSubject<boolean>(false);
  loggedIn$ = this.loggedIn.asObservable();
/*   const idTokenSubject = new Subject<string>(); */
  userData: any;
  constructor(
    private fireAuth: AngularFireAuth,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotifService,
    private afs : AngularFirestore) {
      this.fireAuth.onAuthStateChanged((user) => {
        if (user) {
          this.loggedIn.next(true);
        } else {
          // not logged in
          this.loggedIn.next(false);
        } 
      });
     this.updateToken();
     }

    get isLoggedIn(): boolean {
      const user = JSON.parse(localStorage.getItem('user')!);
      console.log(user);
      console.log("null");
      console.log(user !== null);
      return user !== null ? true : false;
    }

    get userRole(): string {
      return this.userData.role;
    }
    
    public isLogedIn(): boolean {
      return !!this.fireAuth.currentUser;
    }
    async login (email:string, password: string){
      await this.fireAuth.signInWithEmailAndPassword(email, password).then(
        (data)=>{
          console.log("SignIn with Email and Password Response");
          console.log(data);
          
          let user =  this.afs.collection('/users').doc(data.user.uid).get().subscribe((data)=>{
           this.userData = data.data() as User;
              if( ["admin","back-office"].includes(this.userData.role)){
                    this.notificationService.openSnackBar("success", "Bienvenue "+ this.userData.display_name);
                   this.router.navigate(["/users"]);
                   /* console.log(route); */
               /*     let params =   this.route.params.subscribe(params => {
                    console.log("from inside",params);
                    return params;
                   }); */
                 /*   console.log("from outside",params); */

              }else{
                   this.notificationService.openSnackBar("error", "Vous n'êtes pas autorisé à accéder au panneau de Gestion");
                   this.logout()
              }
          });
        }).catch((err)=>{
          this.notificationService.openSnackBar("error",err.code +" : "+ err.message);
      })
      this.updateToken();
    }

    getIdToken(){
      return localStorage.getItem('token');
    }
    getUser(){
      return JSON.parse(localStorage.getItem('user'));
    }
    logout(){
      this.fireAuth.signOut().then(
        ()=>{
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
          localStorage.removeItem('userData');
          this.router.navigate(['/auth/login'])
          return true;

        }, (err)=>{
          console.log(err);
          return err;
      })
    }

    updateToken(){
      
      this.fireAuth.authState.subscribe((user)=>{
        if (user) {

          this.userData = user;
          this.afs.collection<User>('users').doc(user.uid).get().subscribe((data)=>{
            localStorage.setItem('role', data.data().role)
            localStorage.setItem('userData', JSON.stringify(data.data()))
            console.log("this.userData")
            console.log(this.userData)
            localStorage.setItem('user', JSON.stringify(this.userData));
            JSON.parse(localStorage.getItem('user')!);

            user.getIdToken().then((token)=>{
              localStorage.setItem('token',token);
              //  this.router.navigate(['/dashboard']);
            }).catch(
              (err)=>{
                console.log("Not connected")
                console.log(err.message)
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('userData');

              //  this.router.navigate(['/auth/login']);
              }
            )
          })
         
          
         
        } else {
          localStorage.setItem('user', 'null');
          JSON.parse(localStorage.getItem('user')!);
        }
      })
    }
}
