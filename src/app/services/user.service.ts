import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DocType, User } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private urlBack = environment.urlBack;

  constructor(public http: HttpClient, public toastr: ToastrService) {}

  public getDocTypes() {
    return this.http.get<DocType[]>(`${this.urlBack}/doctype`);
  }

  public registerUser(user: User): Observable<any> {
    return this.http.post<User>(`${this.urlBack}/user`, user);
  }

  public getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.urlBack}/user/${id}`);
  }

  public updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.urlBack}/user/${id}`, user);
  }
}
