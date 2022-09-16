import { Component, OnInit } from "@angular/core";
import { Settings, AppSettings } from "../../app.settings";
import { AppService } from "../../app.service";
import { Property, Pagination, Location } from "../../app.models";
import { filter, map } from "rxjs/operators";
import { Subscription } from "rxjs";
import { MediaChange, MediaObserver } from "@angular/flex-layout";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { PropertyService } from "src/app/services/property.service";
import { FilterService } from "src/app/services/filter.service";
import { PropertyResponse } from "src/app/models/models";
import { StateContractEnum } from "src/app/common/enums/state-contract.enum";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  watcher: Subscription;
  activeMediaQuery = "";

  public slides = [];
  public properties: PropertyResponse[];
  public viewType: string = "grid";
  public viewCol: number = 25;
  public count: number = 8;
  public sort: string;
  public searchFields: any;
  public removedSearchField: string;
  public pagination: Pagination = new Pagination(1, 8, null, 2, 0, 0);
  public message: string;
  public featuredProperties: Property[];
  public locations: Location[];

  public settings: Settings;
  constructor(
    public appSettings: AppSettings,
    public appService: AppService,
    public filterService: FilterService,
    public propertyService: PropertyService,
    public mediaObserver: MediaObserver
  ) {
    this.settings = this.appSettings.settings;

    this.watcher = mediaObserver
      .asObservable()
      .pipe(
        filter((changes: MediaChange[]) => changes.length > 0),
        map((changes: MediaChange[]) => changes[0])
      )
      .subscribe((change: MediaChange) => {
        // console.log(change)
        if (change.mqAlias == "xs") {
          this.viewCol = 100;
        } else if (change.mqAlias == "sm") {
          this.viewCol = 50;
        } else if (change.mqAlias == "md") {
          this.viewCol = 33.3;
        } else {
          this.viewCol = 25;
        }
      });
  }

  ngOnInit() {
    this.getSlides();
    this.getProperties();
  }

  ngDoCheck() {
    if (this.settings.loadMore.load) {
      this.settings.loadMore.load = false;
      this.getProperties();
    }
  }

  ngOnDestroy() {
    this.resetLoadMore();
    this.watcher.unsubscribe();
  }

  public getSlides() {
    this.appService.getHomeCarouselSlides().subscribe((res) => {
      this.slides = res;
    });
  }

  public getProperties() {
    this.propertyService.getProperties(StateContractEnum.EnPublicacion).subscribe((data) => {
      if (this.properties && this.properties.length > 0) {
        this.settings.loadMore.page++;
        this.pagination.page = this.settings.loadMore.page;
      }
      console.log(data);
      let result = this.filterData(data.filter((aux) => aux.photos.length > 0));
      if (result.data.length == 0) {
        this.properties.length = 0;
        this.pagination = new Pagination(1, this.count, null, 2, 0, 0);
        this.message = "No se han encontrado resultados";
        return false;
      }
      if (this.properties && this.properties.length > 0) {
        this.properties = this.properties.concat(result.data);
      } else {
        this.properties = result.data;
      }
      this.pagination = result.pagination;
      this.message = null;

      if (this.properties.length == this.pagination.total) {
        this.settings.loadMore.complete = true;
        this.settings.loadMore.result = this.properties.length;
      } else {
        this.settings.loadMore.complete = false;
      }
    });
  }

  public resetLoadMore() {
    this.settings.loadMore.complete = false;
    this.settings.loadMore.start = false;
    this.settings.loadMore.page = 1;
    this.pagination = new Pagination(1, this.count, null, null, this.pagination.total, this.pagination.totalPages);
  }

  public filterData(data) {
    return this.filterService.filterData(data, this.searchFields, this.sort, this.pagination.page, this.pagination.perPage);
  }

  public searchClicked() {
    this.properties.length = 0;
    this.getProperties();
  }
  public searchChanged(event) {
    event.valueChanges.subscribe(() => {
      this.resetLoadMore();
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
    this.resetLoadMore();
    this.properties.length = 0;
    this.getProperties();
  }
  public changeSorting(sort) {
    this.sort = sort;
    this.resetLoadMore();
    this.properties.length = 0;
    this.getProperties();
  }
  public changeViewType(obj) {
    this.viewType = obj.viewType;
    this.viewCol = obj.viewCol;
  }
}
