import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';

import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UserDataLogin, UserToken } from '../models/models';
import { ToastrService } from 'ngx-toastr';

const helper = new JwtHelperService();

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  private roleUser = new BehaviorSubject<string>(null);
  private userToken = new BehaviorSubject<string>(null);
  private userName = new BehaviorSubject<string>(null);
  private userId = new BehaviorSubject<number>(null);
  public urlApi = environment.urlBack;

  constructor(private http: HttpClient, private router: Router, public toastr: ToastrService) {
    this.checkToken();
    this.decodeToken();
  }

  get isLogged(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  get getRoleUser(): Observable<string> {
    return this.roleUser.asObservable();
  }

  get getIdUser(): Observable<number> {
    return this.userId.asObservable();
  }
  get getNameUser(): Observable<string> {
    return this.userName.asObservable();
  }

  get userTokenValue(): string {
    return this.userToken.getValue();
  }

  login(authData: UserDataLogin): Observable<UserToken | void> {
    return this.http.post<UserToken>(`${this.urlApi}/auth/login`, authData).pipe(
      map((user: UserToken) => {
        this.saveRoken(user.token);
        this.loggedIn.next(true);
        this.roleUser.next('clI');
        this.userId.next(this.getId());
        this.userName.next(this.getName());
        this.userToken.next(user.token);
        return user;
      }),
      catchError((error: HttpErrorResponse): Observable<any> => {
        if (error) {
          console.error(error);
          this.toastr.error(`${error.error.message}, intentelo nuevamente`, 'Error al ingresar al sistema, verifique sus credenciales.', {
            progressBar: true,
            closeButton: true,
            disableTimeOut: true,
          });
          return of(null);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.loggedIn.next(false);
    this.userToken.next(null);
    this.roleUser.next(null);
    this.userId.next(null);
    this.userName.next(null);
    this.router.navigate(['']);
  }

  getRole(): string {
    const data = this.decodeToken();
    const role = data.role;
    return role;
  }
  getName(): string {
    const data = this.decodeToken();
    const name = data.nameComplete;
    return name;
  }
  getId(): number {
    const data = this.decodeToken();
    const id = data.sub;
    return id;
  }

  getData(): any {
    return this.decodeToken();
  }

  private checkToken(): void {
    const userToken = localStorage.getItem('token');
    const isExpired = helper.isTokenExpired(userToken);
    if (isExpired) {
      this.logout();
    } else {
      this.loggedIn.next(true);
      this.userToken.next(userToken);
    }
  }
  private decodeToken(): any {
    const userToken = localStorage.getItem('token');
    const data = helper.decodeToken(userToken);
    return data;
  }
  private saveRoken(token: string): void {
    localStorage.setItem('token', token);
  }
}
