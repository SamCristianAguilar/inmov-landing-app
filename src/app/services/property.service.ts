import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Departament, Feature, Photos, PropertyRequest, propertyResponse, StateProperty, TypeProperty } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  constructor(public http: HttpClient, public toastr: ToastrService) {}

  private urlBack = environment.urlBack;

  public uploadImages(gallery: {}): Observable<any> {
    return this.http.post<any>(`${this.urlBack}/photos/`, gallery);
  }
  public getProperties(state?: string): Observable<propertyResponse[]> {
    return this.http.get<propertyResponse[]>(`${this.urlBack}/property${state ? '?state=' + state : ''}`);
  }

  public getPropertyTypes(): Observable<TypeProperty[]> {
    return this.http.get<TypeProperty[]>(`${this.urlBack}/type-property`);
  }

  public getFeatures() {
    return this.http.get<Feature[]>(this.urlBack + '/features');
  }

  public getStateProperty() {
    return this.http.get<StateProperty[]>(this.urlBack + '/state-property');
  }
  public getAllDepartaments() {
    return this.http.get<Departament[]>(this.urlBack + '/departament');
  }

  private handlerError(err: HttpErrorResponse): Observable<never> {
    console.log(err);
    const serverErrorMessage = err.error.message ? err.error.message : err.message ? err.message : 'Error de petición Http';
    console.log('mesaage erro', serverErrorMessage);
    if (serverErrorMessage) {
      this.toastr.success(serverErrorMessage, 'Error al completar la petición', {
        progressBar: true,
      });
    }
    return throwError(() => new Error(serverErrorMessage));
  }
}
