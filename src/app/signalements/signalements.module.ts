import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalementsComponent } from './signalements.component';
import { MainComponent } from './main/main.component';
import { SharedModule } from '../shared/shared.module';
import { SignalementsRoutingModule } from './signalements-routing.module';


@NgModule({
  declarations: [
    SignalementsComponent,
    MainComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    SignalementsRoutingModule
  ],
  exports: [
  ]
})
export class SignalementsModule { }
