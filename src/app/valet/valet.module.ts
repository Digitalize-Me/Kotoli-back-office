import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValetComponent } from './valet.component';
import { ListComponent } from './list/list.component';
import { SharedModule } from '../shared/shared.module';
import { GoogleMapsModule } from '@angular/google-maps';
import { ValetRoutingModule } from './valet-routing.module';



@NgModule({
  declarations: [
    ValetComponent,
    ListComponent
  ],
  imports: [
    CommonModule,
    ValetRoutingModule,
    SharedModule,
    GoogleMapsModule
  ]
})
export class ValetModule { }
