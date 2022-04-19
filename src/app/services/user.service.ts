import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DocType } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private urlBack = environment.urlBack;

  constructor(public http: HttpClient, public toastr: ToastrService) {}

  public getDocTypes() {
    return this.http.get<DocType[]>(`${this.urlBack}/doctype`);
  }
}
