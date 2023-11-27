import { Component } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { BehaviorSubject, Subscription, lastValueFrom } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { KotoliFireService } from '../_services/kotoli-fire.service';
import { NotifService } from '../_services/notif.service';

@Component({
  selector: 'app-activites',
  templateUrl: './activites.component.html',
  styleUrls: ['./activites.component.scss']
})
export class ActivitesComponent {
 
 
}
