import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Property } from 'src/app/app.models';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PropertyService } from 'src/app/services/property.service';
import { catchError, Observable, of, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-properties',
  templateUrl: './my-properties.component.html',
  styleUrls: ['./my-properties.component.scss'],
})
export class MyPropertiesComponent implements OnInit {
  displayedColumns: string[] = ['id', 'image', 'title', 'published', 'actions'];
  dataSource: MatTableDataSource<Property>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  private idUser: number;
  private urlBack = environment.urlBack;
  constructor(public appService: AppService, public propertySv: PropertyService, public toastr: ToastrService, public authServ: AuthService) {}

  ngOnInit() {
    this.idUser = this.authServ.getId();
    this.getProperties();
  }

  public getProperties() {
    this.propertySv
      .getPropertiesByOwner(this.idUser)
      .pipe(
        tap((res) => {
          if (res) {
            this.initDataSource(res);
          }
        }),
        catchError((error: HttpErrorResponse): Observable<any> => {
          if (error) {
            console.error(error);
            this.toastr.error(`${error.error.message}, intentelo nuevamente`, 'Error al listar las propiedades.', {
              progressBar: true,
            });
            return of(null);
          }
        })
      )
      .subscribe();
  }

  public initDataSource(data: any) {
    this.dataSource = new MatTableDataSource<Property>(data);
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
