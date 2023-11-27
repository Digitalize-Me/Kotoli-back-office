import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users.component';
import { UsersRoutingModule } from './users-routing.module';
import { SharedModule } from '../shared/shared.module';
import { TableComponent } from './table/table.component';
import { ActivityComponent } from './activity/activity.component';
import { IdentityVerificationComponent } from './dialogs/identity-verification/identity-verification.component';
import { SetStatusComponent } from './dialogs/set-status/set-status.component';
import { ActiverComponent } from './dialogs/activer/activer.component';
import { BannirComponent } from './dialogs/bannir/bannir.component';
import { SupprimerComponent } from './dialogs/supprimer/supprimer.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';



@NgModule({
  declarations: [
    UsersComponent,
    TableComponent,
    ActivityComponent,
    IdentityVerificationComponent,
    SetStatusComponent,
    ActiverComponent,
    BannirComponent,
    SupprimerComponent
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    SharedModule,
    PdfViewerModule
  ]
})
export class UsersModule { }
