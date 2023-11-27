import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {
  transform(value: any): any {
    if (!value) return value;

    const now = Date.now();
    const date = new Date(value).getTime();
    const diffInMilliseconds = Math.abs(now - date);
    const diffInMinutes = Math.floor(diffInMilliseconds / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays >= 1) {
      return `${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInHours >= 1) {
      return `${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}`;
    }
  }
}