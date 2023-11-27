import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FilterPipe } from '../_pipes/filter.pipe';
import { CustomDatePipe } from '../_pipes/custom-date.pipe';



@NgModule({
  declarations: [
    SnackbarComponent,
    FilterPipe,
    CustomDatePipe
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    FormsModule,
    MatSnackBarModule], 
  exports:[
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    FormsModule,
    SnackbarComponent,
    CustomDatePipe,
    FilterPipe
  ],
  providers: [
    MatSnackBarModule,
  ],
})
export class SharedModule { }
