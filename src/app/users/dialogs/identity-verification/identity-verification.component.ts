import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from '../../../_services/api.service';
import { NotifService } from '../../../_services/notif.service';

@Component({
  selector: 'app-identity-verification',
  templateUrl: './identity-verification.component.html',
  styleUrls: ['./identity-verification.component.scss']
})
export class IdentityVerificationComponent {



  user: any;
  loading =false;
  isPdf = false;

  constructor( private dialogRef: MatDialogRef<IdentityVerificationComponent>,

    private nf: NotifService,
    private apiService: ApiService,
     @Inject(MAT_DIALOG_DATA) data ) {
      this.user= data[0];
      console.log(this.user);
      if(this.user.identity_path && this.user.identity_path != ""){
        if(this.get_url_extension(this.user.identity_path) == 'pdf'){
          console.log(this.get_url_extension(this.user.identity_path))
          this.isPdf = true;
        }
      }
     }

     ngOnInit(){
    
     }
  
  
  
  async save(){
    this.loading = true;
    try {
      // Mise à jour du statut de l'utilisateur en 'actif' dans Firebase
      await this.apiService.updateUserStatus(this.user.id, 'actif');
  
      // Affichage d'un message de succès et fermeture de la boîte de dialogue
      this.nf.openSnackBar("success", `Identité de l'Utilisateur ${this.user.first_name} ${this.user.last_name} vérifiée avec succès`);
      this.dialogRef.close(1); 
    } catch (error) {
      // Gestion de l'erreur
      let errorMessage = "Une erreur est survenue lors de la vérification de l'identité";
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
   get_url_extension( url ) {
    return url.split(/[#?]/)[0].split('.').pop().trim();
  }
}
