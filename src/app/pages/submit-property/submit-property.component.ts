/// <reference types="@types/googlemaps" />
import { Component, OnInit, ViewChild, ElementRef, NgZone, ViewEncapsulation, AfterViewInit, OnDestroy } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { catchError, map, Observable, of, startWith, tap, throwError } from 'rxjs';
import {
  City,
  ContractForRentRequest,
  Departament,
  InfoProperty,
  Location,
  Neighborhood,
  Photos,
  PropertyRequest,
  Zone,
} from 'src/app/models/models';
import { MatSelect } from '@angular/material/select';

import { TYPE_CONTRACT, TYPE_STREET } from 'src/app/common/constants';

import { PropertyService } from 'src/app/services/property.service';
import { RequireMatch } from 'src/app/common/validators/require-match';
import { LenghtArrayFiles } from 'src/app/common/validators/length-files';
import { ToastrService } from 'ngx-toastr';
import { ContractService } from 'src/app/services/contract.service';
import { MatAccordion } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MapsAPILoader } from '@agm/core';

@Component({
  selector: 'app-submit-property',
  templateUrl: './submit-property.component.html',
  styleUrls: ['./submit-property.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SubmitPropertyComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('horizontalStepper') horizontalStepper: MatStepper;
  @ViewChild('addressAutocomplete') addressAutocomplete: ElementRef;
  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('singleSelect', { static: true })
  singleSelect: MatSelect;

  public submitForm: FormGroup;
  public idOwner: number = 1;
  public typeContract = [];
  public lengthStepper = 0;
  public features = [];
  public featuresGroup = [];
  public typeProp = 'apartamento';
  public propertyTypes = [];
  public statesProperty = [];
  public propertyStatuses = [];
  public departaments: Departament[] = [];
  public cities: City[] = [];
  public filteredOptionsDepartaments: Observable<Departament[]>;
  public filteredOptionsCities: Observable<City[]>;

  public neighborhoods = [];
  public streets = [];
  public typeStreets = [];
  public lat: number = 4.647736724380013;
  public lng: number = -74.06369097792818;
  public zoom: number = 20;
  public alertPremiumMessage =
    'Recuerde que si marca la opción prémium esto indica forma automática que usted contrata los servicios de innovación inmobiliaria para todo lo referente a la toma fotografías y videos de su propiedad que a su vez van a ser utilizadas en nuestra plataforma.';
  private isValidEmail = /\S+@\S+\.\S+/;
  private isNumber = /^[0-9]+$/;
  private isOnlyLetter = '[a-zA-Z ]{2,254}';
  private validateNumberWithDecimal = /^\s*(?=.*[1-9])\d*(?:[.,]\d{0,5})?\s*$/;

  constructor(
    public appService: AppService,
    public propertyService: PropertyService,
    public contractService: ContractService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.propertyStatuses = this.appService.getPropertyStatuses();
    // this.cities = this.appService.getCities();
    this.neighborhoods = this.appService.getNeighborhoods();
    this.streets = this.appService.getStreets();
    this.typeStreets = TYPE_STREET.sort();
    this.typeContract = TYPE_CONTRACT.sort();
    this.submitForm = this.buildForm();
    this.getTypeProperty();
    this.getDepartament();
    this.getFeatures();
    this.placesAutocomplete();
  }
  ngAfterViewInit() {}

  ngOnDestroy() {}

  getTypeProperty(): any {
    this.propertyService
      .getPropertyTypes()
      .pipe(
        tap((res) => {
          this.propertyTypes = res;
        }),
        catchError((error: HttpErrorResponse): Observable<any> => {
          if (error) {
            this.toastr.error('Error al obtener los tipos de propiedad', 'Error de petición', {
              progressBar: true,
            });
            return of(null);
          }
        })
      )
      .subscribe();
  }

  getStateProperty() {
    this.propertyService
      .getStateProperty()
      .pipe(
        tap((res) => {
          this.statesProperty = res;
        }),
        catchError((error: HttpErrorResponse): Observable<any> => {
          if (error) {
            this.toastr.error('Error al obtener los estados de propiedad.', 'Error de petición', {
              progressBar: true,
            });
            return of(null);
          }
        })
      )
      .subscribe();
  }

  getDepartament() {
    this.propertyService
      .getAllDepartaments()
      .pipe(
        tap((res) => {
          this.departaments = res;
          this.initDepartamentsAutoComplete();
        }),
        catchError((error: HttpErrorResponse): Observable<any> => {
          if (error) {
            this.toastr.error('Error al obtener el listado de departamentos.', 'Error de petición', {
              progressBar: true,
            });
            return of(null);
          }
        })
      )
      .subscribe();
  }

  //Evento para detectar el cambio de step ***************************************************
  onSelectionChange(e: any) {
    e.previouslySelectedStep._editable = false;
    this.lengthStepper = this.horizontalStepper.steps.length;
    // if (e.selectedIndex == 1) {
    // }

    if (e.selectedIndex == 2) {
      this.buildFeaturesFormControl();
      this.getStateProperty();
    }
    if (e.selectedIndex == 3) {
      const features: [] = this.submitForm.value.infoProperty.features;
      const featuresTrue = features.filter((feature) => {
        return feature['selected'] === true;
      });
      this.submitForm.value.infoProperty.features = featuresTrue;
    }
  }

  //Creacion de la caracteristicas de forma dinamica
  getFeatures(): any {
    if (this.features.length === 0) {
      this.propertyService
        .getFeatures()
        .pipe(
          tap((res) => {
            this.features = res;
          }),
          catchError((error: HttpErrorResponse): Observable<any> => {
            if (error) {
              this.toastr.error('Error al obtener el listado de caracteristicas.', 'Error de petición', {
                progressBar: true,
              });
              return of(null);
            }
          })
        )
        .subscribe();
    }
  }
  buildFeaturesFormControl() {
    const featureControl = this.submitForm.controls.infoProperty.get('features') as FormArray;
    featureControl.clear();
    this.featuresGroup = [];
    this.features.forEach((feature) => {
      const control = this.fb.group({
        id: feature.id,
        name: feature.name,
        selected: feature.selected,
        group: feature.group,
      });
      const groupName = feature.group.name;
      const groupExist = this.featuresGroup.find((group) => group === groupName);

      this.typeProp = this.submitForm.value.basic.propertyType.name;
      if (groupName != 'apartamento') {
        if (!groupExist) {
          this.featuresGroup.push(groupName);
        }
      } else if (this.typeProp == 'Apartamento') {
        if (!groupExist) {
          this.featuresGroup.push(groupName);
        }
      }

      featureControl.push(control);
    });
    setTimeout(() => {
      this.accordion.openAll();
    }, 2000);
  }

  buildFeatures() {
    const arr = this.features.map((feature) => {
      return this.fb.group({
        id: feature.id,
        name: feature.name,
        selected: feature.selected,
      });
    });
    return this.fb.array(arr);
  }

  // -------------------- Address ---------------------------

  // -------------------- Additional ---------------------------

  public reset() {
    this.horizontalStepper.reset();
    this.submitForm.reset();
  }

  public submitProperty(pathsPhotos?: string[]) {
    const value = this.submitForm.value;

    const infoProperty: InfoProperty = {
      stratum: value.infoProperty.stratum,
      area: value.infoProperty.area,
      rooms: value.infoProperty.rooms,
      baths: value.infoProperty.baths,
      garages: value.infoProperty.garages,
      interiorFoors: value.infoProperty.interiorFoors,
      stateProperty: value.infoProperty.stateProperty,
      features: value.infoProperty.features,
    };
    const departament: Departament = {
      id: value.location.departament.id,
      name: value.location.departament.name,
    };
    const city: City = {
      id: value.location.city.id,
      name: value.location.city.name,
      departament: departament,
    };
    const zone: Zone = {
      name: value.location.zone,
      city: city,
    };

    const neighborhood: Neighborhood = {
      name: value.location.neighborhood,
      zone: zone,
    };
    const location: Location = {
      zipCode: value.location.zipCode ? value.location.zipCode : null,
      neighborhood: neighborhood,
      address: value.location.address,
      lat: value.location.lat,
      lng: value.location.lng,
    };

    let photos: Photos;

    if (pathsPhotos)
      photos = {
        paths: pathsPhotos,
      };

    const newProperty: PropertyRequest = {
      title: value.basic.title,
      premium: value.basic.premium ? true : false,
      typeProperty: value.basic.propertyType,
      ownerId: this.idOwner,
      infoProperty: infoProperty,
      location: location,
      photos: photos ? photos : null,
    };

    const newContract: ContractForRentRequest = {
      contractValue: value.contract.price,
      description: `Contrato para realizar el proceso de ${
        value.contract.typeContract == 'forrent' ? 'arrendar' : value.contract.typeContract == 'forsale' ? 'vender' : ''
      } la propiedad ${newProperty.title} ubicada en la dirección : ${newProperty.location.address} `,
      holder: this.idOwner,
      property: newProperty,
    };
    console.log(newContract);
    const contract = value.contract.typeContract;
    if (contract && contract == 'forrent') {
      this.contractService
        .newContractForRent(newContract)
        .pipe(
          tap((res) => {
            if (res) {
              this.toastr.success(
                'Su solicitud de servicio queda pendiente para revision por parte de Innovacion inmobiliaria, una vez que se de autorización o solicite algun cambio sera notificado en su correo electronico',
                'Registro exitoso',
                {
                  progressBar: true,
                }
              );
              this.router.navigate(['/']);
              this.reset();
            }
          }),
          catchError((error: HttpErrorResponse): Observable<any> => {
            if (error) {
              this.toastr.error(`${error.error.message}, intentelo nuevamente`, 'Error al realizar el registro', {
                progressBar: true,
                closeButton: true,
                disableTimeOut: true,
              });
              this.horizontalStepper.reset();
              return of(null);
            }
          })
        )
        .subscribe();
    } else if (contract && contract == 'forsale') {
      this.contractService
        .newContractForSale(newContract)
        .pipe(
          tap((res) => {
            if (res) {
              this.toastr.success(
                'Su solicitud de servicio queda pendiente para revision por parte de Innovacion inmobiliaria, una vez que se de autorización o solicite algun cambio sera notificado en su correo electronico',
                'Registro exitoso',
                {
                  progressBar: true,
                }
              );
              this.router.navigate(['/']);
              this.reset();
            }
          }),
          catchError((error: HttpErrorResponse): Observable<any> => {
            if (error) {
              this.toastr.error(`${error.error.message}, intentelo nuevamente`, 'Error al realizar el registro', {
                progressBar: true,
              });
              this.reset();

              return of(null);
            }
          })
        )
        .subscribe();
    }
  }

  uploadImages() {
    const valid = this.submitForm.get('media')['controls']['gallery'].invalid;

    if (valid) return null;

    let formData = new FormData();
    // Optional, if you want to use a DTO on your server to grab this data
    // Append each of the files
    this.submitForm.value.media.gallery.forEach((file) => {
      formData.append('files[]', file.file, file.file.name);
    });
    this.propertyService
      .uploadImages(formData)
      .pipe(
        tap((res) => {
          const arrayNameFiles = res;
          if (arrayNameFiles && arrayNameFiles.length > 0) {
            this.submitProperty(arrayNameFiles);
          }
        }),
        catchError((error: HttpErrorResponse): Observable<any> => {
          if (error) {
            this.toastr.error(`${error.message}, intentelo nuevamente`, 'Error al realizar el registro', {
              progressBar: true,
            });
            return of(null);
          }
        })
      )
      .subscribe();
  }

  // -------------------- Address ---------------------------

  private setCurrentPosition() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });
    }
  }
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

  public getAddress() {
    this.appService.getAddress(this.lat, this.lng).subscribe((response) => {
      if (response['results'].length) {
        let address = response['results'][0].formatted_address;
        let addressMin = String(address).split(',')[0];
        this.submitForm.controls.location.get('address').setValue(addressMin);
        this.setAddresses(response['results'][0]);
      }
    });
  }
  public onMapClick(e: any) {
    this.lat = e.coords.lat;
    this.lng = e.coords.lng;
    console.log(this.lat, this.lng);
    this.getAddress();
  }
  public onMarkerClick(e: any) {
    console.log(e);
  }

  public setAddresses(result) {
    console.log(result);
    this.submitForm.controls.location.get('city').setValue(null);
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
        this.submitForm.controls.location.get('departament').setValue(this.departaments.filter((dep) => dep.name == departament)[0]);
        this.onSelectCity();
      }
    }

    if (cityName) {
      if (this.cities.filter((city) => city.name == cityName)[0]) {
        this.submitForm.controls.location.get('city').setValue(this.cities.filter((city) => city.name == cityName)[0]);
      }
    }

    if (locality) {
      this.submitForm.controls.location.get('zone').setValue(locality);
    }

    if (neighborhood) {
      this.submitForm.controls.location.get('neighborhood').setValue(neighborhood);
    }

    if (zipCode) {
      this.submitForm.controls.location.get('zipCode').setValue(zipCode);
    }
    if (lat) {
      this.submitForm.controls.location.get('lat').setValue(lat);
    }
    if (lng) {
      this.submitForm.controls.location.get('lng').setValue(lng);
    }

    console.log(cityName, departament, locality, neighborhood, zipCode, lat, lng);
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
    const departamet = this.submitForm.controls.location.get('departament') as FormControl;

    this.filteredOptionsDepartaments = departamet.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value ? value.name : null)),
      map((name) => (name ? this._filterDepartament(name) : this.departaments.slice()))
    );
  }

  onSelectCity(event?) {
    this.cities = null;
    const departamet = this.submitForm.controls.location.get('departament') as FormControl;
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
    const city = this.submitForm.controls.location.get('city') as FormControl;

    this.filteredOptionsCities = city.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value ? value.name : null)),
      map((name) => (name ? this._filterCity(name) : this.cities.slice()))
    );
  }

  buildForm() {
    return this.fb.group({
      contract: this.fb.group({
        typeContract: [null, Validators.required],
        price: [null, Validators.required],
      }),

      basic: this.fb.group({
        title: [null, Validators.required],
        propertyType: [null, Validators.required],
        premium: [null, Validators.required],
      }),
      infoProperty: this.fb.group({
        stratum: [null, Validators.required],
        area: [null, Validators.required],
        rooms: [null, Validators.required],
        baths: [null, Validators.required],
        garages: [null, Validators.required],
        interiorFoors: [null, Validators.required],
        stateProperty: [null, Validators.required],
        features: this.buildFeatures(),
      }),
      location: this.fb.group({
        departament: ['null', [Validators.required, RequireMatch]],
        city: [null, [Validators.required, RequireMatch]],
        address: [null, Validators.required],
        zipCode: [null, Validators.required],
        zone: [null, Validators.required],
        neighborhood: [null, Validators.required],
        lat: [null, Validators.required],
        lng: [null, Validators.required],
      }),
      media: this.fb.group({
        gallery: [null, [Validators.required, LenghtArrayFiles]],
      }),
    });
  }
}
