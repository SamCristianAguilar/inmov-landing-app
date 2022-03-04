import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Departament, Feature, Photos, PropertyRequest, StateProperty, TypeProperty } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  constructor(public http: HttpClient) {}

  public urlBack = '';

  public uploadImages(gallery: {}): Observable<any> {
    return this.http.post<any>(`${this.urlBack}/photos/`, gallery).pipe(catchError(this.handlerError));
  }

  public getPropertyTypes(): Observable<TypeProperty[]> {
    console.log(this.urlBack);
    const aux = this.http.get<TypeProperty[]>(this.urlBack + '/type-property').pipe(catchError(this.handlerError));
    console.log(aux);
    return aux;
  }

  public getFeatures() {
    return this.http.get<Feature[]>(this.urlBack + '/features').pipe(catchError(this.handlerError));
  }

  public getStateProperty() {
    return this.http.get<StateProperty[]>(this.urlBack + '/state-property').pipe(catchError(this.handlerError));
  }
  public getAllDepartaments() {
    return this.http.get<Departament[]>(this.urlBack + '/departament').pipe(catchError(this.handlerError));
  }

  private handlerError(err: HttpErrorResponse): Observable<never> {
    console.log(err);
    const serverErrorMessage = err.error;

    if (serverErrorMessage) {
      window.alert(err.error.message);
      // Swal.fire({
      //   icon: 'error',
      //   confirmButtonColor: '#2f323a',
      //   title: 'Error al procesar la solicitud',
      //   html: `<h4>${err.error.message}</h4>`,
      //   width: 10000,
      //   padding: '2em',
      //   showConfirmButton: true,
      // });
    }
    return throwError(() => new Error(serverErrorMessage));
  }
}
