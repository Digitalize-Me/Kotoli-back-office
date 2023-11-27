import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import {SnackbarComponent} from '../../app/shared/snackbar/snackbar.component'

@Injectable({
  providedIn: 'root'
})
export class NotifService {

  constructor(private _snackBar: MatSnackBar) { }

  openSnackBar(action :string, message: string, duration?:number,) {
    //let student = JSON.parse('"'+data+'"');
    let dur = 50;
    if(duration) dur = duration;
    if(action === "success"){
      this._snackBar.openFromComponent(SnackbarComponent, {
        data: [action, message],
        duration: dur * 1000,
        verticalPosition: 'top',
        panelClass: ['success-snackbar', 'mt-5'],
      });
    }else{
     
      this._snackBar.openFromComponent(SnackbarComponent, {
        data: [action, message],
        duration: dur * 1000,
        verticalPosition: 'top',
        panelClass: ['fail-snackbar', 'mt-5'],
      });
    }
  }

  close(){
    this._snackBar.dismiss();
  }
}
