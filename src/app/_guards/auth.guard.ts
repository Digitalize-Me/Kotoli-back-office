import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../_services/auth.service';
import { NotifService } from '../_services/notif.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    public authService: AuthService, 
    public router: Router, 
    private notifService: NotifService,
    private afAuth: AngularFireAuth
    ) {}
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {

    console.log("Hello From Guard");

    const user = await this.afAuth.currentUser;
    console.log(user);
    const isLoggedIn = !!user;
    if (!isLoggedIn) {
      console.log('Access Denied, Login is Required to Access This Page!')
      this.notifService.openSnackBar("error", "Connexion expirée veuillez vous connecter")
      //window.alert('Access Denied, Login is Required to Access This Page!');
      if(next.url.length > 0 && next.url[0].path){
        const url = next.url[0].path;
        this.router.navigate(['/auth/login'], { queryParams: { returnUrl : url }});
      }else{
        this.router.navigate(['/auth/login']);
      }
    }
    return isLoggedIn;

   /*  console.log(this.authService.isLoggedIn);
    //console.log(next.url[0].path);
 
    if (this.authService.isLoggedIn !== true) {
      console.log('Access Denied, Login is Required to Access This Page!')
      this.notifService.openSnackBar("error", "Connexion expirée veuillez vous connecter")
      //window.alert('Access Denied, Login is Required to Access This Page!');
      if(next.url.length > 0 && next.url[0].path){
        const url = next.url[0].path;
        this.router.navigate(['/auth/login'], { queryParams: { returnUrl : url }});
      }else{
        this.router.navigate(['/auth/login']);
      }
    }
    return true; */
  }
  
}
