import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessagesComponent } from './messages.component';
import { MainComponent } from './main/main.component';
import { SharedModule } from '../shared/shared.module';
import { MessagesRoutingModule } from './messages-routing.module';



@NgModule({
  declarations: [
    MessagesComponent,
    MainComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MessagesRoutingModule
  ]
})
export class MessagesModule { }
