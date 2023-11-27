import { Component, ViewChild } from '@angular/core';
import { KotoliFireService } from '../../_services/kotoli-fire.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../../_services/auth.service';
import { BehaviorSubject, Subscription, finalize } from 'rxjs';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSort } from '@angular/material/sort';
import { User } from '../../_models/user';
import { Router } from '@angular/router';
import { ActiverComponent } from '../dialogs/activer/activer.component';
import { environment } from '../../../environments/environment';
import { BannirComponent } from '../dialogs/bannir/bannir.component';
import { IdentityVerificationComponent } from '../dialogs/identity-verification/identity-verification.component';
import { SupprimerComponent } from '../dialogs/supprimer/supprimer.component';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent {

  isPlanner = false;
  constructor(
    private kfService: KotoliFireService,
    public dialog: MatDialog,
    private router: Router,
    private fireAuth: AngularFireAuth,
    private authService: AuthService
    ){
      /* console.log("this.fireAuth.currentUser")
      this.fireAuth.currentUser.then((user)=>{
          this.kfService.getUserById(user.uid).get().subscribe((data)=>{
            let user = data.data();
            if(user.role == "planner"){
              console.log("So you are a Planner");
              this.isPlanner = true
            }
          })
      }) */
      
    }
  list: any[];
  public dataSource: MatTableDataSource<any>;
  subscription : Subscription;

  @ViewChild(MatTable) myTable: MatTable<any>; 
  @ViewChild("pagin") paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort = {} as MatSort;
  @ViewChild(MatProgressSpinner) spinner!: MatProgressSpinner;
  loadingSubject = new BehaviorSubject<boolean>(false);
  
  loading$ = this.loadingSubject.asObservable();
  displayedColumns = ['photo_url','first_name','last_name','created_time.seconds','role','status','action'];


  isLoadingResults = true;
 
  isOpen = false;

  ngOnInit(){
    this.loadingSubject.next(true);
    let isFirst = true;
    console.log("this.paginator.pageSize");
    this.subscription = this.kfService.getUsers().pipe(
      finalize(() => null))
      .subscribe(async actionArray => {
          isFirst = false;
        
    /*   console.log(this.paginator); */
       
    this.list= actionArray.map(item => {
      return {
        id: item.payload.doc.id,
        ref:item.payload.doc.ref,
        ...item.payload.doc.data() as {}
      } as any;
    }).map((user)=>{
      if(!user.photo_url) user.photo_url = environment.baseUrl+"/static/profile_picture.png"
      return user;
    });
         
    console.log(this.list);
    console.log("this.list");
       
       this.loadingSubject.next(false);
       this.dataSource = new MatTableDataSource(this.list);
      this.dataSource.sort = this.sort;
       
        this.dataSource.sortingDataAccessor = (item, property) => {
          if (property.includes('.')) return property.split('.').reduce((o,i)=>o[i], item)
          return item[property];
        };
       this.dataSource.paginator = this.paginator;
     });
 
  
   }
   searchData(search = ''){
    this.dataSource.filter = search.toLowerCase().trim();
  }

  exportToExcel() {
    const workSheet = XLSX.utils.json_to_sheet(this.dataSource.data, {header:['ID']});
    const workBook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'Liste des Planneurs');
    XLSX.writeFile(workBook, 'GOFLEET_export_planneurs'+ Date.now() +'.xlsx');
  }
  show(data){
    this.router.navigateByUrl('/activity/'+data.id);
  }

  activer(data){
    if(this.isOpen == true) {
      return;
    }
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.panelClass= "dialog-responsive"
  
    dialogConfig.data = [data];
   this.isOpen = true;
   
    const dialogAdd = this.dialog.open(ActiverComponent, dialogConfig);
    
    dialogAdd.afterClosed().subscribe((data) => {
      this.isOpen = false;
      if(data == 1){
        this.refresh();
      }
    });
  }
  bannir(data){
    if(this.isOpen == true) {
      return;
    }
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.panelClass= "dialog-responsive"
  
    dialogConfig.data = [data];
   this.isOpen = true;
   
    const dialogAdd = this.dialog.open(BannirComponent, dialogConfig);
    
    dialogAdd.afterClosed().subscribe((data) => {
      this.isOpen = false;
      if(data == 1){
        this.refresh();
      }
    });
  }


  validateIdentity(data){
    if(this.isOpen == true) {
      return;
    }

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.panelClass= "dialog-responsive-large"

    dialogConfig.data = [data];
    this.isOpen = true;
    const dialogEditPassRef = this.dialog.open(IdentityVerificationComponent, dialogConfig);
      
    dialogEditPassRef.afterClosed().subscribe((data) => {
      this.isOpen = false;
      if(data == 1){
        this.refresh();
      }
    });  

  }

  supprimer(data){
    if(this.isOpen == true) {
      return;
    }

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.panelClass= "dialog-responsive"

    dialogConfig.data = [data];
    this.isOpen = true;
    const dialogEditPassRef = this.dialog.open(SupprimerComponent, dialogConfig);
      
    dialogEditPassRef.afterClosed().subscribe((data) => {
      this.isOpen = false;
      if(data == 1){
        this.refresh();
      }
    });  

  }





  refresh(){
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.loadingSubject.next(true);
    this.subscription = this.kfService.getUsers().pipe(
      finalize(() => null))
      .subscribe(async actionArray => {
    this.list= actionArray.map(item => {
      return {
        id: item.payload.doc.id,
        ref:item.payload.doc.ref,
        ...item.payload.doc.data() as {}
      } as any;
    }).map((user)=>{
      if(!user.photo_url) user.photo_url = environment.baseUrl+"/static/profile_picture.png"
      return user;
    });
       
       this.loadingSubject.next(false);
       this.dataSource.data = this.list;
       if (this.paginator) {
         this.dataSource.paginator = this.paginator;
       }
       if (this.sort) {
         this.dataSource.sort = this.sort;
       }
     });
  
  }
}
