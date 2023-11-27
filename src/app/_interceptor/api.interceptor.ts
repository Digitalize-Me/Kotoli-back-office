import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../_services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { environment } from '../../environments/environment.development';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService,
    private fireAuth: AngularFireAuth,) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      // add auth header with jwt if user is logged in and request is to the api url

      const user = this.authService.getUser();
      const token = this.authService.getIdToken();
     const isLoggedIn = this.authService.isLoggedIn;
      
      const isApiUrl = request.url.startsWith(environment.apiUrl);

      if (isLoggedIn && isApiUrl) {
          request = request.clone({
              setHeaders: {
                  Authorization: `Bearer ${token}`
              }
          });
      }

      return next.handle(request);
  }
}

export const AuthInterceptorProvider = [
  { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true }
];
