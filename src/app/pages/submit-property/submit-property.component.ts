/// <reference types="@types/googlemaps" />
import { Component, OnInit, ViewChild, ElementRef, NgZone, ViewEncapsulation, AfterViewInit, OnDestroy } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { map, Observable, startWith, tap } from 'rxjs';
import { City, ContractForRentRequest, Departament, InfoProperty, Location, Photos, PropertyRequest } from 'src/app/models/models';
import { MatSelect } from '@angular/material/select';

import { TYPE_CONTRACT, TYPE_STREET } from 'src/app/common/constants';

import { PropertyService } from 'src/app/services/property.service';
import { RequireMatch } from 'src/app/common/validators/require-match';
import { LenghtArrayFiles } from 'src/app/common/validators/length-files';
import { ToastrService } from 'ngx-toastr';
import { ContractService } from 'src/app/services/contract.service';
import { MatAccordion } from '@angular/material/expansion';

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
  public lat: number = 40.678178;
  public lng: number = -73.944158;
  public zoom: number = 12;
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
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.propertyStatuses = this.appService.getPropertyStatuses();
    this.cities = this.appService.getCities();
    this.neighborhoods = this.appService.getNeighborhoods();
    this.streets = this.appService.getStreets();
    this.typeStreets = TYPE_STREET.sort();
    this.typeContract = TYPE_CONTRACT.sort();
    this.submitForm = this.fb.group({
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
        city: [{ value: null, disabled: false }, [Validators.required, RequireMatch]],
        address: [null, Validators.required],
        zone: [null, Validators.required],
        neighborhood: [null, Validators.required],
      }),
      media: this.fb.group({
        gallery: [null, [Validators.required, LenghtArrayFiles]],
      }),
    });
    this.getTypeProperty();
    this.getDepartament();
  }
  ngAfterViewInit() {}

  ngOnDestroy() {}

  getTypeProperty(): any {
    this.propertyService
      .getPropertyTypes()
      .pipe(
        tap((res) => {
          this.propertyTypes = res;
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
        })
      )
      .subscribe();
  }

  //Evento para detectar el cambio de step
  onSelectionChange(e: any) {
    e.previouslySelectedStep._editable = false;
    this.lengthStepper = this.horizontalStepper.steps.length;
    // if (e.selectedIndex == 1) {
    // }

    if (e.selectedIndex == 2) {
      this.getFeatures();
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
      this.propertyService.getFeatures().subscribe((res) => {
        this.features = res;
        const featureControl = this.submitForm.controls.infoProperty.get('features') as FormArray;
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
          console.log(this.accordion);
          this.accordion.openAll();
        }, 1000);
      });
    }
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

    const location: Location = {
      zone: value.location.zone,
      neighborhood: value.location.neighborhood,
      address: value.location.address,
      city: value.location.city,
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
                'Registro exitoso',
                'Su solicitud de servicio queda pendiente para revision por parte de Innovacion inmobiliaria, una vez que se de autorización o solicite algun cambio sera notificado en su correo electronico',
                {
                  progressBar: true,
                }
              );
            }
          })
        )
        .subscribe();
    } else if (contract && contract == 'forsale') {
      return null;
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
        })
      )
      .subscribe();
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
      map((value) => (typeof value === 'string' ? value : value.name)),
      map((name) => (name ? this._filterDepartament(name) : this.departaments.slice()))
    );
  }

  onSelectCity(event?) {
    this.cities = null;
    const city = this.submitForm.controls.location.get('city') as FormControl;

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
      map((value) => (typeof value === 'string' ? value : value.name)),
      map((name) => (name ? this._filterCity(name) : this.cities.slice()))
    );
  }
}
