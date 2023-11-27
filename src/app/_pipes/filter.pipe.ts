import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;
  
    return items.filter(item => {
      if(typeof(item) == "string"){
        return String(item).toLowerCase().includes(searchText.toLowerCase());
      }else{
        return Object.keys(item).some(key => {
         /*  console.log(String(item[key])) */
            return String(item[key]).trim().toLowerCase().includes(searchText.trim().toLowerCase());
        }); 
      }
      
    });
   }

}
