import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomValidators, matchingPasswords, emailValidator } from 'src/app/theme/utils/app-validators';
import { UserService } from 'src/app/services/user.service';
import { DocType } from 'src/app/models/models';
import { catchError, Observable, of, tap } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  public registerForm: FormGroup;
  public hide = true;
  public docTypes: DocType[];
  public patternPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
  public userTypes = [
    { id: 1, name: 'Agent' },
    { id: 2, name: 'Agency' },
    { id: 3, name: 'Buyer' },
  ];
  constructor(
    public fb: FormBuilder,
    public router: Router,
    public snackBar: MatSnackBar,
    public userService: UserService,
    public toastr: ToastrService
  ) {}

  ngOnInit() {
    this.registerForm = new FormGroup(
      {
        firstName: new FormControl('', [Validators.required]),
        secondName: new FormControl('', []),
        firstLastName: new FormControl('', [Validators.required]),
        secondLastName: new FormControl('', [Validators.required]),
        docType: new FormControl('', [Validators.required]),
        docNumber: new FormControl('', [Validators.required]),
        email: new FormControl('', Validators.compose([Validators.required, emailValidator])),
        password: new FormControl('', [Validators.required, Validators.pattern(this.patternPassword)]),
        confirmPassword: new FormControl('', [Validators.required]),
      },
      CustomValidators.matchingPasswords('password', 'confirmPassword')
    );
    this.getDocType();
  }

  public onRegisterFormSubmit(values: Object): void {
    if (this.registerForm.valid) {
      console.log(values);
      this.snackBar.open('You registered successfully!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
    }
  }

  public getDocType() {
    this.userService
      .getDocTypes()
      .pipe(
        tap((data) => {
          this.docTypes = data;
        }),
        catchError((error: HttpErrorResponse): Observable<any> => {
          if (error) {
            console.error(error);
            this.toastr.error('Error al obtener el listado de tipo de documentos.', 'Error de petición', {
              progressBar: true,
            });
            return of(null);
          }
        })
      )
      .subscribe();
  }
}
