import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivitesComponent } from './activites.component';
import { SharedModule } from '../shared/shared.module';
import { ListComponent } from './list/list.component';
import { ActivitesRoutingModule } from './activites-routing.module';



@NgModule({
  declarations: [
    ActivitesComponent,
    ListComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ActivitesRoutingModule
  ]
})
export class ActivitesModule { }
