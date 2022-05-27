import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ContractForRentRequest, ContractForSaleRequest } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  constructor(public http: HttpClient, public toastr: ToastrService) {}

  private urlBack = environment.urlBack;

  public newContractForRent(contract: ContractForRentRequest): Observable<any> {
    return this.http.post(`${this.urlBack}/contract/for-rent/`, contract);
  }
  public newContractForSale(contract: ContractForSaleRequest): Observable<any> {
    return this.http.post(`${this.urlBack}/contract/for-sale/`, contract);
  }

  public getAllByHolder(id: number): Observable<any> {
    return this.http.get(`${this.urlBack}/contract/by-holder/${id}`);
  }
}
