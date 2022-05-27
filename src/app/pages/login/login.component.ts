import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { UserDataLogin } from 'src/app/models/models';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public hide = true;
  constructor(public fb: FormBuilder, public router: Router, public authServ: AuthService) {}

  ngOnInit() {
    this.loginForm = new FormGroup({
      username: new FormControl(null, Validators.compose([Validators.required])),
      password: new FormControl(null, Validators.compose([Validators.required])),
    });
  }

  public onLoginFormSubmit(values: Object): void {
    if (this.loginForm.valid) {
      const value = this.loginForm.value;
      const dataLogin: UserDataLogin = {
        username: value.username,
        password: value.password,
      };
      this.authServ.login(dataLogin).subscribe();
      this.router.navigate(['/']);
    }
  }
}
