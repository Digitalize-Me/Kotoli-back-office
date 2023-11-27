import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalementsComponent } from './signalements.component';
import { MainComponent } from './main/main.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
      path: '', component: SignalementsComponent,
       children: [
            {
            path: '',
            redirectTo: 'chat',
            pathMatch: 'full'
          } ,
          { path: 'chat', component: MainComponent },
      ] 
  }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class SignalementsRoutingModule { }
