import { Component, Inject } from '@angular/core';
import { NotifService } from '../../../_services/notif.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from '../../../_services/api.service';

@Component({
  selector: 'app-activer',
  templateUrl: './activer.component.html',
  styleUrls: ['./activer.component.scss']
})
export class ActiverComponent {
  user: any;
  loading =false;
  constructor( private dialogRef: MatDialogRef<ActiverComponent>,

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
        // Mise à jour du statut de l'utilisateur en 'banni' dans Firebase
        await this.apiService.updateUserStatus(this.user.id, 'actif');
    
        // Affichage d'un message de succès et fermeture de la boîte de dialogue
        this.nf.openSnackBar("success", `Compte Utilisateur ${this.user.first_name} ${this.user.last_name} Débanni avec succés`);
        this.dialogRef.close(1); 
      } catch (error) {
        // Gestion de l'erreur
        let errorMessage = "Une erreur est survenue lors de l'annulation du bannissement de l'utilisateur";
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
