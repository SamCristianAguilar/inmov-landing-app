import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomValidators, emailValidator, matchingPasswords } from 'src/app/theme/utils/app-validators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { CEL_NUMBER, ONLY_NUMBER, PASSWORD_PAT } from 'src/app/common/utils/pattern';
import { UserService } from 'src/app/services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { tap, catchError, Observable, of, takeWhile } from 'rxjs';
import { DocType, InfoUserReq, User } from 'src/app/models/models';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  public infoForm: FormGroup;
  public passwordForm: FormGroup;
  public docTypes: DocType[];
  public patternPassword = PASSWORD_PAT;
  public hide = true;
  public idUser: number;
  public user: User;

  constructor(
    public formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    public userService: UserService,
    public toastr: ToastrService,
    public authServ: AuthService
  ) {}

  ngOnInit() {
    this.infoForm = this.formBuilder.group({
      docType: ['', [Validators.required]],
      docNumber: ['', [Validators.required]],
      firstName: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      secondName: ['', Validators.compose([Validators.minLength(3)])],
      firstLastName: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      secondLastName: ['', Validators.compose([Validators.minLength(3)])],
      cellPhone: ['', Validators.compose([Validators.required, Validators.pattern(CEL_NUMBER)])],
      landLinePhone: ['', Validators.compose([Validators.pattern(ONLY_NUMBER), Validators.maxLength(7), Validators.minLength(7)])],
      email: [{ value: '', disabled: true }, Validators.compose([Validators.required, Validators.email])],
      image: null,
    });
    this.passwordForm = new FormGroup(
      {
        currentPassword: new FormControl('', [Validators.required, Validators.pattern(this.patternPassword)]),
        newPassword: new FormControl('', [Validators.required, Validators.pattern(this.patternPassword)]),
        confirmPassword: new FormControl('', [Validators.required]),
      },
      CustomValidators.matchingPasswords('newPassword', 'confirmPassword')
    );

    this.getDocType();
    this.idUser = this.authServ.getId();
    this.getUserData();
  }

  public onInfoFormSubmit(values: Object): void {
    if (this.infoForm.valid) {
      const inFoUser = new InfoUserReq();
      inFoUser.cellPhone = this.infoForm.value.cellPhone;
      inFoUser.landLinePhone = this.infoForm.value.landLinePhone;

      const auxUser = new User();

      auxUser.docType = this.docTypes.find((doc) => doc.id == this.infoForm.value.docType).id;
      auxUser.docNumber = this.infoForm.value.docNumber;
      auxUser.firstName = this.infoForm.value.firstName;
      auxUser.secondName = this.infoForm.value.secondName;
      auxUser.firstLastName = this.infoForm.value.firstLastName;
      auxUser.secondLastName = this.infoForm.value.secondLastName;
      auxUser.infoUser = inFoUser;

      const userUpdate = Object.assign(this.user, auxUser);
      this.userService
        .updateUser(this.idUser, userUpdate)
        .pipe(
          tap((res) => {
            if (res) {
              this.user = res;
              this.toastr.success(`Actualizacion de datos exitosa.`, '', {
                progressBar: true,
              });
            }
          }),
          catchError((error: HttpErrorResponse): Observable<any> => {
            if (error) {
              console.error(error);
              this.toastr.error(`${error.error.message}, intentelo nuevamente`, 'Error al actualizar los datos del usuario.', {
                progressBar: true,
              });
              return of(null);
            }
          })
        )
        .subscribe();
    }
  }

  public onPasswordFormSubmit(values: Object): void {
    if (this.passwordForm.valid) {
      this.snackBar.open('Your password changed successfully!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
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
        }),
        takeWhile((process) => process.completed)
      )
      .subscribe();
  }

  public getUserData(id?: number) {
    this.userService
      .getUser(this.idUser)
      .pipe(
        tap((res) => {
          this.user = res;
          if (this.user != null) {
            this.pathFormData(this.user);
          }
        }),
        catchError((error: HttpErrorResponse): Observable<any> => {
          if (error) {
            console.error(error);
            this.toastr.error(`${error.error.message}, intentelo nuevamente`, 'Error al obtener los datos del usuario.', {
              progressBar: true,
            });
            return of(null);
          }
        }),
        takeWhile((process) => process.completed)
      )
      .subscribe();
  }

  public pathFormData(data: User) {
    this.infoForm.patchValue({
      docType: this.user.docType['id'],
      docNumber: this.user.docNumber,
      firstName: this.user.firstName,
      secondName: this.user.secondName,
      firstLastName: this.user.firstLastName,
      secondLastName: this.user.secondLastName,
      cellPhone: this.user.infoUser.cellPhone,
      landLinePhone: this.user.infoUser.landLinePhone,
      email: this.user.infoUser.email,
    });
  }
}
