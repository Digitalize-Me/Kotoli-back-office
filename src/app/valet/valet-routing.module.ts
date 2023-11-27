import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValetComponent } from './valet.component';
import { ListComponent } from './list/list.component';
import { Routes, RouterModule } from '@angular/router';



const routes: Routes = [
  {
      path: '', component: ValetComponent,
       children: [
            {
            path: '',
            redirectTo: 'list',
            pathMatch: 'full'
          } ,
          { path: 'list', component: ListComponent },
     
      ] 
  }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ValetRoutingModule { }
