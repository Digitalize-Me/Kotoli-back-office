import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users.component';
import { TableComponent } from './table/table.component';
import { ActivityComponent } from './activity/activity.component';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
      path: '', component: UsersComponent,
       children: [
            {
            path: '',
            redirectTo: 'list',
            pathMatch: 'full'
          } ,
          { path: 'list', component: TableComponent },
          { path: 'activity/:id', component: ActivityComponent },
     
      ] 
  }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
