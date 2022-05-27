import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, of, tap } from 'rxjs';
import { Property } from 'src/app/app.models';
import { AppService } from 'src/app/app.service';
import { ForRentContractsRes, ForSaleContractsRes } from 'src/app/models/models';
import { AuthService } from 'src/app/services/auth.service';
import { ContractService } from 'src/app/services/contract.service';
import { PropertyService } from 'src/app/services/property.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-contracts',
  templateUrl: './my-contracts.component.html',
  styleUrls: ['./my-contracts.component.scss'],
})
export class MyContractsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'value', 'createAt', 'state', 'type', 'actions'];
  dataSource: MatTableDataSource<ForRentContractsRes | ForSaleContractsRes>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  private idUser: number;
  private urlBack = environment.urlBack;
  constructor(
    public appService: AppService,
    public propertySv: PropertyService,
    public toastr: ToastrService,
    public authServ: AuthService,
    public contractSv: ContractService
  ) {}
  ngOnInit(): void {
    this.idUser = this.authServ.getId();
    this.getContracts();
  }

  public getContracts() {
    this.contractSv
      .getAllByHolder(this.idUser)
      .pipe(
        tap((res) => {
          if (res) {
            this.initDataSource(res);
          }
        }),
        catchError((error: HttpErrorResponse): Observable<any> => {
          if (error) {
            console.error(error);
            this.toastr.error(`${error.error.message}, intentelo nuevamente`, 'Error al listar las contratos.', {
              progressBar: true,
            });
            return of(null);
          }
        })
      )
      .subscribe();
  }

  public initDataSource(data: any) {
    this.dataSource = new MatTableDataSource<ForRentContractsRes | ForSaleContractsRes>(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
