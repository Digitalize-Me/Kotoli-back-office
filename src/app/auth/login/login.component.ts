import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
/* import { LoginModel } from 'app/_models/login.model';
import { UcCharPipe } from 'app/_pipes/uc-char.pipe';
import { NotificationService } from 'app/_services/notification.service'; */
import { AuthService } from '../../_services/auth.service';
import { first } from 'rxjs/operators';
import { NotifService } from '../../_services/notif.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

/*   user: LoginModel = new LoginModel(); */

  errorMessage = '';
  public errorForms = [];

  loginForm: FormGroup;
  loading = false;
  submitted = false;
  fieldTextType: boolean = false;
  hide=true;
  controls=['username','email','password'];

  constructor(
      private formBuilder: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private authService: AuthService,
      private notificationService: NotifService
   /*    private ucChar: UcCharPipe,
      private snack : NotificationService, */
  ) { }

  ngOnInit() {
    let emailregex: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      this.loginForm = this.formBuilder.group({
          email: ['', [Validators.required]],//Validators.pattern(emailregex)
          password:  ['', [Validators.required, Validators.minLength(6)]],
      });
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  async onSubmit() {
      this.submitted = true;

      // reset alerts on submit
      //this.alertService.clear();

      // stop here if form is invalid
      if (this.loginForm.invalid) {
          return;
      }

     this.loading = true;
     await this.authService.login(this.f.email.value, this.f.password.value);
     this.loading = false;
    /*   this.usersService.login(this.f.email.value, this.f.password.value)
          .pipe(first())
          .subscribe({
              next: (data) => {
                  this.loading = false;
                  // get return url from query parameters or default to home page
                  this.snack.openSnackBar("success", "Connexion réussie. Bienvenue " +this.ucChar.transform(data["first_name"])+' '+data["second_name"].toUpperCase(),10);
                  const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                  this.router.navigateByUrl(returnUrl);
              },
              
              error:(error) => {
                  
                  const validationErrors = error;
                  let erroris422  = 0;
                  this.errorForms = error; 
          

                  this.controls.forEach((el)=>{
                    if (Object.keys(validationErrors).includes(el)){
                      erroris422 = 1;
                      //console.log("422 Error");
                    }
                  });
                  if (erroris422 == 1){
                    Object.keys(validationErrors).forEach(prop => {
                      const formControl = this.loginForm.get(prop);
                      if (formControl) {
                        formControl.setErrors({
                          serverError: validationErrors[prop]
                        });
                      }
                      if(prop.includes("username")){
                        const emailControl = this.loginForm.get("email");
                        emailControl.setErrors({
                          serverError: validationErrors[prop]
                        });
                      }
                    });

                    this.errorMessage = `Identifiants invalides !` ;
                  }else {
                    this.errorMessage = error  ;
                  }
                  this.loading = false;
                 
                  if(error["code"] !== 'ERR_CONN_REFUSED'){
                    this.snack.openSnackBar("error", this.errorMessage,10);
                  }
                
        
                }, 
           
          }); */
  }
  googleOAuth(){
    /* this.usersService.googleOAuth()
          .pipe(first())
          .subscribe({
              next: (data) => {
                  this.loading = false;
                  // get return url from query parameters or default to home page
                  //this.snack.openSnackBar("success", "Connexion réussie. Bienvenue " +this.ucChar.transform(data["first_name"])+' '+data["second_name"].toUpperCase(),10);
                  //const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                  //this.router.navigateByUrl(returnUrl);
              },
              error:(error) => {
                console.log(error);
              }
          }); */

  }
  toggleFieldTextType() {
      this.fieldTextType = !this.fieldTextType;
  }
}