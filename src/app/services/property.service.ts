import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Property } from '../app.models';
import { Departament, Feature, Neighborhood, Photos, PropertyRequest, propertyResponse, StateProperty, TypeProperty, Zone } from '../models/models';

export class Data {
  constructor(
    public properties: propertyResponse[],
    public compareList: propertyResponse[],
    public favorites: propertyResponse[],
    public locations: Location[]
  ) {}
}
@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  constructor(
    public http: HttpClient,
    public toastr: ToastrService,
    private bottomSheet: MatBottomSheet,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  public Data = new Data(
    [], // properties
    [], // compareList
    [], // favorites
    [] // locations
  );

  private urlBack = environment.urlBack;

  public uploadImages(gallery: {}): Observable<any> {
    return this.http.post<any>(`${this.urlBack}/photos/`, gallery);
  }
  public getProperties(state?: string): Observable<propertyResponse[]> {
    return this.http.get<propertyResponse[]>(`${this.urlBack}/property${state ? '?state=' + state : ''}`);
  }

  public getpropertyById(id: number): Observable<propertyResponse> {
    return this.http.get<propertyResponse>(`${this.urlBack}/property/${id}`);
  }
  public getPropertyTypes(): Observable<TypeProperty[]> {
    return this.http.get<TypeProperty[]>(`${this.urlBack}/type-property`);
  }

  public getNeighborhoods(): Observable<Neighborhood[]> {
    return this.http.get<Neighborhood[]>(`${this.urlBack}/neighborhood`);
  }

  public getZones(): Observable<Zone[]> {
    return this.http.get<Zone[]>(`${this.urlBack}/zone`);
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

  public addToCompare(property: propertyResponse, component, direction) {
    if (!this.Data.compareList.filter((item) => item.id == property.id)[0]) {
      this.Data.compareList.push(property);
      this.bottomSheet
        .open(component, {
          direction: direction,
        })
        .afterDismissed()
        .subscribe((isRedirect) => {
          if (isRedirect) {
            if (isPlatformBrowser(this.platformId)) {
              window.scrollTo(0, 0);
            }
          }
        });
    }
  }

  public addToFavorites(property: propertyResponse, direction) {
    if (!this.Data.favorites.filter((item) => item.id == property.id)[0]) {
      this.Data.favorites.push(property);
      this.snackBar.open('The property "' + property.title + '" has been added to favorites.', '×', {
        verticalPosition: 'top',
        duration: 3000,
        direction: direction,
      });
    }
  }
}
