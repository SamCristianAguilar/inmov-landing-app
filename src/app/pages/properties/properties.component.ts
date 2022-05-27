import { Component, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { Observable, of, Subscription, tap } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { Settings, AppSettings } from '../../app.settings';
import { AppService } from '../../app.service';
import { Property, Pagination } from '../../app.models';
import { isPlatformBrowser } from '@angular/common';
import { PropertyService } from 'src/app/services/property.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { PropertyResponse } from 'src/app/models/models';
import { FilterService } from 'src/app/services/filter.service';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss'],
})
export class PropertiesComponent implements OnInit {
  @ViewChild('sidenav') sidenav: any;
  public sidenavOpen: boolean = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public psConfig: PerfectScrollbarConfigInterface = {
    wheelPropagation: true,
  };
  public properties: PropertyResponse[];
  public viewType: string = 'grid';
  public viewCol: number = 33.3;
  public count: number = 12;
  public sort: string;
  public searchFields: any;
  public removedSearchField: string;
  public pagination: Pagination = new Pagination(1, this.count, null, 2, 0, 0);
  public message: string;
  public watcher: Subscription;

  public settings: Settings;
  constructor(
    public appSettings: AppSettings,
    public appService: AppService,
    public filterService: FilterService,
    public mediaObserver: MediaObserver,
    public propServ: PropertyService,
    private toastr: ToastrService,

    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.settings = this.appSettings.settings;
    this.watcher = mediaObserver
      .asObservable()
      .pipe(
        filter((changes: MediaChange[]) => changes.length > 0),
        map((changes: MediaChange[]) => changes[0])
      )
      .subscribe((change: MediaChange) => {
        if (change.mqAlias == 'xs') {
          this.sidenavOpen = false;
          this.viewCol = 100;
        } else if (change.mqAlias == 'sm') {
          this.sidenavOpen = false;
          this.viewCol = 50;
        } else if (change.mqAlias == 'md') {
          this.viewCol = 50;
          this.sidenavOpen = true;
        } else {
          this.viewCol = 33.3;
          this.sidenavOpen = true;
        }
      });
  }

  ngOnInit() {
    this.getProperties();
  }

  ngOnDestroy() {
    this.watcher.unsubscribe();
  }

  public getProperties() {
    this.propServ
      .getProperties('Activo')
      .pipe(
        tap((res) => {
          let result = this.filterData(res);
          if (result.data.length == 0) {
            this.properties.length = 0;
            this.pagination = new Pagination(1, this.count, null, 2, 0, 0);
            this.message = 'No Results Found';
            return false;
          }
          this.properties = result.data;
          this.pagination = result.pagination;
          this.message = null;
        }),
        catchError((error: HttpErrorResponse): Observable<any> => {
          if (error) {
            console.error(error);
            this.toastr.error('Error al obtener las propiedades.', 'Error de petición', {
              progressBar: true,
            });
            return of(null);
          }
        })
      )
      .subscribe();
  }

  public resetPagination() {
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.pagination = new Pagination(1, this.count, null, null, this.pagination.total, this.pagination.totalPages);
  }

  public filterData(data) {
    return this.filterService.filterData(data, this.searchFields, this.sort, this.pagination.page, this.pagination.perPage);
  }

  public searchClicked() {
    this.properties.length = 0;
    this.getProperties();
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }
  }
  public searchChanged(event) {
    event.valueChanges.subscribe(() => {
      this.resetPagination();
      this.searchFields = event.value;
      setTimeout(() => {
        this.removedSearchField = null;
      });
      if (!this.settings.searchOnBtnClick) {
        this.properties.length = 0;
      }
    });
    event.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
      if (!this.settings.searchOnBtnClick) {
        this.getProperties();
      }
    });
  }
  public removeSearchField(field) {
    this.message = null;
    this.removedSearchField = field;
  }

  public changeCount(count) {
    this.count = count;
    this.properties.length = 0;
    this.resetPagination();
    this.getProperties();
  }
  public changeSorting(sort) {
    this.sort = sort;
    this.properties.length = 0;
    this.getProperties();
  }
  public changeViewType(obj) {
    this.viewType = obj.viewType;
    this.viewCol = obj.viewCol;
  }

  public onPageChange(e) {
    this.pagination.page = e.pageIndex + 1;
    this.getProperties();
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }
  }
}
