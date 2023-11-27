import { Component } from '@angular/core';

import { navItems } from './_nav';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
})
export class DefaultLayoutComponent {

  public navItems = navItems;

  public perfectScrollbarConfig = {
    suppressScrollX: true,
  };

  constructor(private authService: AuthService) {}
  logout(){
    this.authService.logout();
  }
}
