import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent {
  constructor(){

  }

  ngOnInit(){

  }

  exportToExcel() {
 /*    const workSheet = XLSX.utils.json_to_sheet(this.dataSource.data, {header:['ID']});
    const workBook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'Liste des Livraisons');
    XLSX.writeFile(workBook, 'GOFLEET_export_livraisons'+ Date.now() +'.xlsx'); */
  }
  searchData(search = ''){
    /* this.dataSource.filter = search.toLowerCase().trim(); */
  }

}
