import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomValidators, matchingPasswords, emailValidator } from 'src/app/theme/utils/app-validators';
import { UserService } from 'src/app/services/user.service';
import { DocType, User, UserRole } from 'src/app/models/models';
import { catchError, Observable, of, tap } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CEL_NUMBER, ONLY_NUMBER, PASSWORD_PAT } from 'src/app/common/utils/pattern';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  public registerForm: FormGroup;
  public hide = true;
  public docTypes: DocType[];
  public newUser: User;
  public patternPassword = PASSWORD_PAT;
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
        secondLastName: new FormControl('', []),
        docType: new FormControl('', [Validators.required]),
        docNumber: new FormControl('', [Validators.required]),
        email: new FormControl('', Validators.compose([Validators.required, emailValidator])),
        password: new FormControl('', [Validators.required, Validators.pattern(this.patternPassword)]),
        confirmPassword: new FormControl('', [Validators.required]),
        landLinePhone: new FormControl('', Validators.compose([Validators.pattern(ONLY_NUMBER), Validators.maxLength(7), Validators.minLength(7)])),
        cellPhone: new FormControl('', Validators.compose([Validators.required, Validators.pattern(CEL_NUMBER)])),
      },
      CustomValidators.matchingPasswords('password', 'confirmPassword')
    );
    this.getDocType();
  }

  public onRegisterFormSubmit(values: Object): void {
    if (this.registerForm.valid) {
      const value = this.registerForm.value;

      const newUser: User = {
        accessData: { email: value.email, password: value.password, role: UserRole.Cliente },
        docType: value.docType,
        docNumber: value.docNumber,
        firstName: value.firstName,
        secondName: value.secondName,
        firstLastName: value.firstLastName,
        secondLastName: value.secondLastName,
        infoUser: {
          cellPhone: value.cellPhone,
          landLinePhone: value.landLinePhone,
          email: value.email,
        },
      };
      this.userService
        .registerUser(newUser)
        .pipe(
          tap((res) => {
            if (res) {
              this.toastr.success('', 'Registro exitoso', {
                progressBar: true,
              });
              this.router.navigate(['/']);
              this.registerForm.reset();
            }
          }),
          catchError((error: HttpErrorResponse): Observable<any> => {
            if (error) {
              console.error(error);
              this.toastr.error(`${error.error.message}, intentelo nuevamente`, 'Error al realizar el registro', {
                progressBar: true,
                closeButton: true,
                disableTimeOut: true,
              });
              return of(null);
            }
          })
        )
        .subscribe();
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
