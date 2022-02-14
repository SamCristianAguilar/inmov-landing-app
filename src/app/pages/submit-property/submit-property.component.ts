/// <reference types="@types/googlemaps" />
import { Component, OnInit, ViewChild, ElementRef, NgZone, ViewEncapsulation, AfterViewInit, OnDestroy } from "@angular/core";
import { MatStepper } from "@angular/material/stepper";
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from "@angular/forms";
import { AppService } from "src/app/app.service";
import { MapsAPILoader } from "@agm/core";
import { ReplaySubject, Subject, take, takeUntil, tap } from "rxjs";
import { City, Departament } from "src/app/models/models";
import { MatSelect } from "@angular/material/select";

@Component({
  selector: "app-submit-property",
  templateUrl: "./submit-property.component.html",
  styleUrls: ["./submit-property.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class SubmitPropertyComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("horizontalStepper") horizontalStepper: MatStepper;
  @ViewChild("addressAutocomplete") addressAutocomplete: ElementRef;
  public submitForm: FormGroup;
  public idOwner: number = 1;
  public features = [];
  public featuresGroup = [];
  public typeProp = "apartamento";
  public propertyTypes = [];
  public statesProperty = [];
  public propertyStatuses = [];
  public departaments: Departament[] = [];
  public cities: City[] = [];
  public filteredDepartaments: ReplaySubject<Departament[]> = new ReplaySubject<Departament[]>(1);
  public filteredCities: ReplaySubject<City[]> = new ReplaySubject<City[]>(1);
  @ViewChild("singleSelect", { static: true }) singleSelect: MatSelect;
  protected _onDestroy = new Subject<void>();



  public neighborhoods = [];
  public streets = [];
  public lat: number = 40.678178;
  public lng: number = -73.944158;
  public zoom: number = 12;
  public alertPremiumMessage =
    "Recuerde que si marca la opción prémium esto indica forma automática que usted contrata los servicios de innovación inmobiliaria para todo lo referente a la toma fotografías y videos de su propiedad que a su vez van a ser utilizadas en nuestra plataforma.";
  private isValidEmail = /\S+@\S+\.\S+/;
  private isNumber = /^[0-9]+$/;
  private isOnlyLetter = "[a-zA-Z ]{2,254}";
  private validateNumberWithDecimal = /^\s*(?=.*[1-9])\d*(?:[.,]\d{0,5})?\s*$/;

  constructor(public appService: AppService, private fb: FormBuilder, private mapsAPILoader: MapsAPILoader, private ngZone: NgZone) {}

  ngOnInit() {
    this.propertyStatuses = this.appService.getPropertyStatuses();
    this.cities = this.appService.getCities();
    this.neighborhoods = this.appService.getNeighborhoods();
    this.streets = this.appService.getStreets();

    this.submitForm = this.fb.group({
      basic: this.fb.group({
        owner: [null, Validators.required],
        title: [null, Validators.required],
        desc: [null, Validators.required],
        propertyType: [null, Validators.required],
        premium: [null],
      }),
      infoProperty: this.fb.group({
        price: [null, Validators.required],
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
        departament: [""],
        departamentFilter: [""],
        city: [""],
        cityFilter: [""],
        location: [""],
        zipCode: "",
        neighborhood: "",
        street: "",
      }),
      address: this.fb.group({
        location: [""],
        city: [""],
        zipCode: "",
        neighborhood: "",
        street: "",
      }),
      additional: this.fb.group({
        bedrooms: "",
        bathrooms: "",
        garages: "",
        area: "",
        yearBuilt: "",
      }),
      media: this.fb.group({
        videos: this.fb.array([this.createVideo()]),
        plans: this.fb.array([this.createPlan()]),
        additionalFeatures: this.fb.array([this.createFeature()]),
        featured: false,
      }),
    });
    this.setCurrentPosition();
    this.getTypeProperty();
    this.getDepartament();
  }
  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  public getTypeProperty(): any {
    this.appService
      .getPropertyTypes()
      .pipe(
        tap((res) => {
          this.propertyTypes = res;
        })
      )
      .subscribe();
  }

  public getStateProperty() {
    this.appService
      .getStateProperty()
      .pipe(
        tap((res) => {
          this.statesProperty = res;
        })
      )
      .subscribe();
  }

  public getDepartament() {
    this.appService
      .getAllDepartaments()
      .pipe(
        tap((res) => {
          this.departaments = res;
          this.initSelectDepartament();
        })
      )
      .subscribe();
  }

  public initSelectDepartament() {
    const departamet = this.submitForm.controls.location.get("departament") as FormControl;
    departamet.setValue(this.departaments)

    // load the initial bank list
    this.filteredDepartaments.next(this.departaments.slice());

    // listen for search field value changes
    const departamentFilter = this.submitForm.controls.location.get("departamentFilter") as FormControl;
    departamentFilter.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterDepartaments();
      });
    this.setInitialValueDepartaments();

  }

  protected setInitialValueDepartaments() {
    this.filteredDepartaments
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredBanks are loaded initially
        // and after the mat-option elements are available
        this.singleSelect.compareWith = (a: Departament, b: Departament) => a && b && a.id === b.id;
      });
  }

  protected filterDepartaments() {
    if (!this.departaments) {
      return;
    }
    // get the search keyword
    const departamentFilter = this.submitForm.controls.location.get("departamentFilter") as FormControl;

    let search = departamentFilter.value;
    if (!search) {
      this.filteredDepartaments.next(this.departaments.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredDepartaments.next(
      this.departaments.filter(departament => departament.name.toLowerCase().indexOf(search) > -1)
    );
  }

  public getFeatures(): any {
    this.appService.getFeatures().subscribe((res) => {
      this.features = res;
      const featureControl = this.submitForm.controls.infoProperty.get("features") as FormArray;
      this.features.forEach((feature) => {
        const control = this.fb.group({
          id: feature.id,
          name: feature.name,
          selected: feature.selected,
          group: feature.group.name,
        });
        const groupName = feature.group.name;
        const groupExist = this.featuresGroup.find((group) => group === groupName);

        this.typeProp = this.submitForm.value.basic.propertyType.name;

        if (!(this.typeProp != "Apartamento" && groupName == "apartamento")) {
          if (!groupExist) {
            this.featuresGroup.push(groupName);
          }
        }

        featureControl.push(control);
      });
      const features: [] = this.submitForm.value.infoProperty.features;
      const featuresTrue = features.filter((feature) => {
        return feature["selected"] === true;
      });
      this.submitForm.value.infoProperty.features = featuresTrue;
    });
  }

  //select change del mat-stepper
  public onSelectionChange(e: any) {
    this.horizontalStepper._steps.forEach((step) => {
      step.editable = false;
      if (step.stepControl == this.submitForm.get("infoProperty")) {
        this.getFeatures();
        this.getStateProperty();
      }
    });

    if (e.selectedIndex > 0) {
      // this.horizontalStepper._steps.forEach((step) => (step.editable = false));

      console.log(this.submitForm.value);
    }
  }


  protected setInitialValueCities() {
    this.filteredCities
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredBanks are loaded initially
        // and after the mat-option elements are available
        this.singleSelect.compareWith = (a: City, b: City) => a && b && a.id === b.id;
      });
  }
  protected filterCities() {
    const city = this.submitForm.controls.location.get("city") as FormControl;
    if (!city.value) {
      return;
    }
    // get the search keyword
    const cityFilter = this.submitForm.controls.location.get("cityFilter") as FormControl;

    let search = cityFilter.value;
    if (!search) {
      this.filteredCities.next(city.value.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredCities.next(
      city.value.filter(city => city.name.toLowerCase().indexOf(search) > -1)
    );
  }

  public initSelectCity() {
    const city = this.submitForm.controls.location.get("city") as FormControl;
    const departamet = this.submitForm.controls.location.get("departament") as FormControl;

    const cities = departamet.value.citys

    console.log(city);
    console.log(cities);
    city.setValue(cities)

    // load the initial bank list
    this.filteredCities.next(cities.slice());

    // listen for search field value changes
    const cityFilter = this.submitForm.controls.location.get("cityFilter") as FormControl;
    cityFilter.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterCities();
      });
    this.setInitialValueCities();

  }
  // -------------------- Address ---------------------------
  public onSelectCity() {

    this.submitForm.controls.location.get("city").setValue(null, { emitEvent: false });
    this.initSelectCity();

  }
  public onSelectNeighborhood() {
    this.submitForm.controls.address.get("street").setValue(null, { emitEvent: false });
  }

  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });
    }
  }

  // -------------------- Additional ---------------------------
  public buildFeatures() {
    const arr = this.features.map((feature) => {
      return this.fb.group({
        id: feature.id,
        name: feature.name,
        selected: feature.selected,
      });
    });
    return this.fb.array(arr);
  }


  public reset() {
    console.log("hola stepper");
    console.log(this.submitForm.value);
    this.horizontalStepper.reset();

    const videos = <FormArray>this.submitForm.controls.media.get("videos");
    while (videos.length > 1) {
      videos.removeAt(0);
    }
    const plans = <FormArray>this.submitForm.controls.media.get("plans");
    while (plans.length > 1) {
      plans.removeAt(0);
    }
    const additionalFeatures = <FormArray>this.submitForm.controls.media.get("additionalFeatures");
    while (additionalFeatures.length > 1) {
      additionalFeatures.removeAt(0);
    }

    this.submitForm.reset({
      additional: {
        features: this.features,
      },
      media: {
        featured: false,
      },
    });
  }
  // -------------------- Media ---------------------------
  public createVideo(): FormGroup {
    return this.fb.group({
      id: null,
      name: null,
      link: null,
    });
  }
  public addVideo(): void {
    const videos = this.submitForm.controls.media.get("videos") as FormArray;
    videos.push(this.createVideo());
  }
  public deleteVideo(index) {
    const videos = this.submitForm.controls.media.get("videos") as FormArray;
    videos.removeAt(index);
  }

  public createPlan(): FormGroup {
    return this.fb.group({
      id: null,
      name: null,
      desc: null,
      area: null,
      rooms: null,
      baths: null,
      image: null,
    });
  }

  public createFeature(): FormGroup {
    return this.fb.group({
      id: null,
      name: null,
      value: null,
    });
  }
  public addFeature(): void {
    const features = this.submitForm.controls.media.get("additionalFeatures") as FormArray;
    features.push(this.createFeature());
  }
  public deleteFeature(index) {
    const features = this.submitForm.controls.media.get("additionalFeatures") as FormArray;
    features.removeAt(index);
  }
}
