/// <reference types="@types/googlemaps" />
import { Component, OnInit, ViewChild, ElementRef, NgZone, ViewEncapsulation } from "@angular/core";
import { MatStepper } from "@angular/material/stepper";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { AppService } from "src/app/app.service";
import { MapsAPILoader } from "@agm/core";
import { tap } from "rxjs";

@Component({
  selector: "app-submit-property",
  templateUrl: "./submit-property.component.html",
  styleUrls: ["./submit-property.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class SubmitPropertyComponent implements OnInit {
  @ViewChild("horizontalStepper") horizontalStepper: MatStepper;
  @ViewChild("addressAutocomplete") addressAutocomplete: ElementRef;
  public submitForm: FormGroup;
  public features = [];
  public featuresGroup = [];
  public typeProp = "apartamento";
  public propertyTypes = [];
  public statesProperty = [];
  public propertyStatuses = [];
  public cities = [];
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
        title: [null, Validators.required],
        desc: [null, Validators.required],
        propertyType: [null, Validators.required],
        premium: [null, Validators.required],
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

  // -------------------- Address ---------------------------
  public onSelectCity() {
    this.submitForm.controls.address.get("neighborhood").setValue(null, { emitEvent: false });
    this.submitForm.controls.address.get("street").setValue(null, { emitEvent: false });
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
