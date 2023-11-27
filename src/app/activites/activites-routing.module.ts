import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivitesComponent } from './activites.component';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';




const routes: Routes = [
  {
      path: '', component: ActivitesComponent,
       children: [
            {
            path: '',
            redirectTo: 'list',
            pathMatch: 'full'
          } ,
          { path: 'list', component: ListComponent },
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
export class ActivitesRoutingModule { }
