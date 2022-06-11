/// <reference types="@types/googlemaps" />
import { MapsAPILoader } from '@agm/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { catchError, map, Observable, of, startWith, Subscription, tap } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { ONLY_NUMBER } from 'src/app/common/utils/pattern';
import { RequireMatch } from 'src/app/common/validators/require-match';
import { Departament, City, User, Location } from 'src/app/models/models';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common.service';
import { UserService } from 'src/app/services/user.service';
import { emailValidator } from 'src/app/theme/utils/app-validators';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
})
export class LocationComponent implements OnInit, OnDestroy {
  @ViewChild('addressAutocomplete') addressAutocomplete: ElementRef;
  public locationForm: FormGroup;
  public departaments: Departament[] = [];
  public cities: City[] = [];
  public filteredOptionsDepartaments: Observable<Departament[]>;
  public filteredOptionsCities: Observable<City[]>;
  public neighborhoods = [];
  public lat: number = 4.647736724380013;
  public lng: number = -74.06369097792818;
  public zoom: number = 16;
  private readonly subscriptions = new Subscription();
  public nameUser: string;
  public idUser: number;
  public user: User;
  public userLocation: Location;

  constructor(
    public formBuilder: FormBuilder,
    public appService: AppService,
    public commonService: CommonService,
    private toastr: ToastrService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    public userService: UserService,
    public authServ: AuthService
  ) {}

  ngOnInit() {
    this.locationForm = this.buildForm();
    this.idUser = this.authServ.getId();
    this.getUserData();
    this.getDepartament();
    this.placesAutocomplete();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public onlocationFormSubmit(values: Object): void {
    if (this.locationForm.valid) {
      if (this.locationForm.value.details == null) {
        this.locationForm.value.details = 'No proporcionado';
      }

      const loc: Location = {
        address: this.locationForm.value.address,
        formattedAddress: `${
          this.locationForm.value.address +
          ', ' +
          this.locationForm.value.neighborhood +
          ', ' +
          this.locationForm.value.zone +
          ', ' +
          this.locationForm.value.zipCode +
          ', ' +
          this.locationForm.value.city.name +
          ', ' +
          this.locationForm.value.departament.name
        }`,
        lat: this.locationForm.value.lat,
        lng: this.locationForm.value.lng,
        neighborhood: {
          name: this.locationForm.value.neighborhood,
          zone: {
            name: this.locationForm.value.zone,
            city: {
              id: this.locationForm.value.city.id,
              name: this.locationForm.value.city.name,
              departament: this.locationForm.value.departament,
            },
          },
        },
        zipCode: this.locationForm.value.zipCode,
        details: this.locationForm.value.details,
      };
      if (this.user.location) {
        if (this.user.location.id) {
          loc.id = this.user.location.id;
        }
      }
      const userUp = new User();

      userUp.location = loc;

      this.userService
        .updateUser(this.idUser, userUp)
        .pipe(
          tap((res) => {
            if (res) {
              this.user = res;
              this.toastr.success(`Actualizacion de datos exitosa.`, '', {
                progressBar: true,
              });
            }
          }),
          catchError((error: HttpErrorResponse): Observable<any> => {
            if (error) {
              console.error(error);
              this.toastr.error(`${error.error.message}, intentelo nuevamente`, 'Error al actualizar los datos del usuario.', {
                progressBar: true,
              });
              return of(null);
            }
          })
        )
        .subscribe();
    }
  }

  public getUserData(id?: number) {
    this.userService
      .getUser(this.idUser)
      .pipe(
        tap((res) => {
          this.user = res;
          const infoLocation = this.user.location;

          if (infoLocation) {
            this.userLocation = infoLocation;
            if (this.userLocation) {
              this.pathFormData(this.userLocation);
            }
          }
        }),
        catchError((error: HttpErrorResponse): Observable<any> => {
          if (error) {
            console.error(error);
            this.toastr.error(`${error.error.message}, intentelo nuevamente`, 'Error al obtener los datos del usuario.', {
              progressBar: true,
            });
            return of(null);
          }
        })
      )
      .subscribe();
  }

  public pathFormData(data: Location) {
    this.locationForm.patchValue({
      zipCode: data.zipCode,
      address: data.address,
      details: data.details,
      lat: data.lat,
      lng: data.lng,
      neighborhood: data.neighborhood.name,
      departament: data.neighborhood.zone.city.departament,
      city: data.neighborhood.zone.city,
      zone: data.neighborhood.zone.name,
    });
  }

  public getDepartament() {
    this.subscriptions.add(
      this.commonService
        .getAllDepartaments()
        .pipe(
          tap((res) => {
            this.departaments = res;
            this.initDepartamentsAutoComplete();
          }),
          catchError((error: HttpErrorResponse): Observable<any> => {
            if (error) {
              console.error(error);
              this.toastr.error('Error al obtener el listado de departamentos.', 'Error de petición', {
                progressBar: true,
              });
              return of(null);
            }
          })
        )
        .subscribe()
    );
  }

  public getAddress() {
    this.subscriptions.add(
      this.appService
        .getAddress(this.lat, this.lng)
        .pipe(
          tap((response) => {
            if (response['results'].length) {
              let address = response['results'][0].formatted_address;
              let addressMin = String(address).split(',')[0];
              this.locationForm.controls.address?.setValue(addressMin);
              this.setAddresses(response['results'][0]);
            }
          })
        )
        .subscribe()
    );
  }

  public onMapClick(e: any) {
    this.lat = e.coords.lat;
    this.lng = e.coords.lng;
    this.getAddress();
  }
  public onMarkerClick(e: any) {}

  private placesAutocomplete() {
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.addressAutocomplete.nativeElement, {
        types: ['address'],
        componentRestrictions: { country: 'co' },
      });
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          this.lat = place.geometry.location.lat();
          this.lng = place.geometry.location.lng();
          this.getAddress();
        });
      });
    });
  }

  public setAddresses(result) {
    this.locationForm.controls.city.setValue(null);
    let cityName, departament, locality, neighborhood, zipCode, lat, lng;

    const data = result.address_components;
    lat = result.geometry.location.lat;
    lng = result.geometry.location.lng;

    data.forEach((item) => {
      if (item.types.indexOf('administrative_area_level_1') > -1) {
        departament = item.long_name;
      }
      if (item.types.indexOf('locality') > -1) {
        cityName = item.long_name;
      }
      if (item.types.indexOf('sublocality_level_1') > -1) {
        locality = item.long_name;
      }
      if (item.types.indexOf('neighborhood') > -1) {
        neighborhood = item.long_name;
      }
      if (item.types.indexOf('postal_code') > -1) {
        zipCode = item.long_name;
      }
    });

    if (departament) {
      if (this.departaments.filter((dep) => dep.name == departament)[0]) {
        this.locationForm.controls.departament?.setValue(this.departaments.filter((dep) => dep.name == departament)[0]);
        this.onSelectCity();
      }
    }

    if (cityName) {
      if (this.cities.filter((city) => city.name == cityName)[0]) {
        this.locationForm.controls.city?.setValue(this.cities.filter((city) => city.name == cityName)[0]);
      }
    }

    if (locality) {
      this.locationForm.controls.zone?.setValue(locality);
    }

    if (neighborhood) {
      this.locationForm.controls.neighborhood?.setValue(neighborhood);
    }

    if (zipCode) {
      this.locationForm.controls.zipCode?.setValue(zipCode);
    }
    if (lat) {
      this.locationForm.controls.lat?.setValue(lat);
    }
    if (lng) {
      this.locationForm.controls.lng?.setValue(lng);
    }
  }

  // mat autocomplete select cities

  displayFnDepartament(departament: Departament): string {
    return departament && departament.name ? departament.name : '';
  }

  _filterDepartament(name: string): Departament[] {
    const filterValue = name.toLowerCase();

    return this.departaments.filter((option) => option.name.toLowerCase().includes(filterValue));
  }

  initDepartamentsAutoComplete() {
    const departamet = this.locationForm.controls.departament as FormControl;

    this.filteredOptionsDepartaments = departamet.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value ? value.name : null)),
      map((name) => (name ? this._filterDepartament(name) : this.departaments.slice()))
    );
  }

  onSelectCity(event?) {
    this.cities = null;
    const departamet = this.locationForm.controls.departament as FormControl;
    this.cities = departamet.value.citys;
    this.initCityAutoComplete();
  }

  // mat autocomplete select cities
  displayFnCity(city: City): string {
    return city && city.name ? city.name : '';
  }

  _filterCity(name: string): City[] {
    const filterValue = name.toLowerCase();
    return this.cities.filter((option) => option.name.toLowerCase().includes(filterValue));
  }

  initCityAutoComplete() {
    const city = this.locationForm.controls.city as FormControl;

    this.filteredOptionsCities = city.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value ? value.name : null)),
      map((name) => (name ? this._filterCity(name) : this.cities.slice()))
    );
  }

  public buildForm() {
    return this.formBuilder.group({
      zipCode: ['', Validators.pattern(ONLY_NUMBER)],
      address: ['', Validators.required],
      details: [null],
      lat: ['', Validators.required],
      lng: ['', Validators.required],
      neighborhood: ['', Validators.required],
      departament: ['null', [Validators.required, RequireMatch]],
      city: [null, [Validators.required, RequireMatch]],
      zone: [null, Validators.required],
    });
  }
}
function takeWhile(arg0: (process: any) => any): import('rxjs').OperatorFunction<User, unknown> {
  throw new Error('Function not implemented.');
}
