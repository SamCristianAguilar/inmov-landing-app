import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { City } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private urlBack = environment.urlBack;

  constructor(public http: HttpClient) {}

  public getCitiesProperties(): Observable<City[]> {
    return this.http.get<City[]>(`${this.urlBack}/zone/citys`);
  }
}
