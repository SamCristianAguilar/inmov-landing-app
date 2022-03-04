import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ContractForRentRequest } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  constructor(public http: HttpClient, private toastr: ToastrService) {}

  public urlBack = 'back.innovacion-inmobiliaria.com';

  public newContractForRent(contract: ContractForRentRequest): Observable<any> {
    return this.http.post(`${this.urlBack}/contract/for-rent/`, contract).pipe(catchError(this.handlerError));
  }

  private handlerError(err: HttpErrorResponse): Observable<never> {
    console.log(err);
    const serverErrorMessage = err.error;

    if (serverErrorMessage) {
      this.toastr.error('Error al completar la función', err.error.message ? err.error.message : 'Error subtitle', {
        progressBar: true,
      });
    }
    return throwError(() => new Error(serverErrorMessage));
  }
}
