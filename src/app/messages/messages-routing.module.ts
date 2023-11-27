import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessagesComponent } from './messages.component';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';

const routes: Routes = [
  {
      path: '', component: MessagesComponent,
       children: [
            {
            path: '',
            redirectTo: 'messages',
            pathMatch: 'full'
          } ,
          { path: 'messages', component: MainComponent },
       /*    { path: 'activity/:id', component: ActivityComponent }, */
     
      ] 
  }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class MessagesRoutingModule { }
