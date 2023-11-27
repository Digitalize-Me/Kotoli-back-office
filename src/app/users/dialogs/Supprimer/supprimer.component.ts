import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from '../../../_services/api.service';
import { NotifService } from '../../../_services/notif.service';

@Component({
  selector: 'app-supprimer',
  templateUrl: './supprimer.component.html',
  styleUrls: ['./supprimer.component.scss']
})
export class SupprimerComponent {

  user: any;
  loading =false;
  constructor( private dialogRef: MatDialogRef<SupprimerComponent>,

    private nf: NotifService,
    private apiService: ApiService,
     @Inject(MAT_DIALOG_DATA) data ) {
      this.user= data[0];
      console.log(this.user);
     }

     ngOnInit(){
    
     }

  async save(){
    this.loading = true;
    try {
      // Suppression l'utilisateur dans Firebase
      await this.apiService.deleteUser(this.user.id);
  
      // Affichage d'un message de succès et fermeture de la boîte de dialogue
      this.nf.openSnackBar("success", `Compte Utilisateur ${this.user.first_name} ${this.user.last_name} supprimer avec succès`);
      this.dialogRef.close(1); 
    } catch (error) {
      // Gestion de l'erreur
      let errorMessage = "Une erreur est survenue lors de la suppression de l'utilisateur";
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = error.message;
      }
      this.nf.openSnackBar("error", errorMessage);
    } finally {
      this.loading = false;
    }
  }
   
  close() {
    this.dialogRef.close(0);
  }
}
