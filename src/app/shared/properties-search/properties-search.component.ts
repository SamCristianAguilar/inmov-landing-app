import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { tap, catchError, Observable, of } from 'rxjs';
import { Feature } from 'src/app/models/models';
import { CommonService } from 'src/app/services/common.service';
import { PropertyService } from 'src/app/services/property.service';
import { AppService } from '../../app.service';

@Component({
  selector: 'app-properties-search',
  templateUrl: './properties-search.component.html',
  styleUrls: ['./properties-search.component.scss'],
})
export class PropertiesSearchComponent implements OnInit {
  @Input() variant: number = 1;
  @Input() vertical: boolean = false;
  @Input() searchOnBtnClick: boolean = false;
  @Input() removedSearchField: string;
  @Output() onSearchChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSearchClick: EventEmitter<any> = new EventEmitter<any>();
  public showMore: boolean = false;
  public form: FormGroup;
  public propertyTypes = [];
  public propertyStatuses = [];
  public cities = [];
  public neighborhoods = [];
  public zones = [];
  public features = [];

  constructor(
    public appService: AppService,
    public fb: FormBuilder,
    public propServ: PropertyService,
    public commonService: CommonService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    if (this.vertical) {
      this.showMore = true;
    }
    this.getFeaturesBack();
    this.getPropertyTypes();
    this.getStateProperties();
    this.getCities();
    this.getNeighborhoods();
    this.getZones();

    this.form = this.buildForm();
  }

  ngOnChanges() {
    if (this.removedSearchField) {
      if (this.removedSearchField.indexOf('.') > -1) {
        let arr = this.removedSearchField.split('.');
        this.form.controls[arr[0]]['controls'][arr[1]].reset();
      } else if (this.removedSearchField.indexOf(',') > -1) {
        let arr = this.removedSearchField.split(',');
        this.form.controls[arr[0]]['controls'][arr[1]]['controls']['selected'].setValue(false);
      } else {
        this.form.controls[this.removedSearchField].reset();
      }
    }
  }

  public getFeaturesBack() {
    this.propServ
      .getFeatures()
      .pipe(
        tap((res) => {
          this.features = this.buildFeaturesBack(res);
          if (this.features.length > 0) {
            const featureControl = this.form.controls.features as FormArray;
            featureControl.clear();

            this.features.forEach((feature) => {
              const control = this.fb.group({
                id: feature.id,
                name: feature.name,
                selected: feature.selected,
              });

              featureControl.push(control);
            });
            this.onSearchChange.emit(this.form);
          }
        }),
        catchError((error: HttpErrorResponse): Observable<any> => {
          if (error) {
            console.error(error);
            this.toastr.error('Error al obtener el listado de catacteristicas.', 'Error de petición', {
              progressBar: true,
            });
            return of(null);
          }
        })
      )
      .subscribe();
  }

  public getPropertyTypes() {
    this.propServ
      .getPropertyTypes()
      .pipe(
        tap((res) => {
          this.propertyTypes = res;
        }),
        catchError((error: HttpErrorResponse): Observable<any> => {
          if (error) {
            console.error(error);
            this.toastr.error('Error al obtener el listado de tipos de propiedades.', 'Error de petición', {
              progressBar: true,
            });
            return of(null);
          }
        })
      )
      .subscribe();
  }

  public getStateProperties() {
    this.propServ
      .getStateProperty()
      .pipe(
        tap((res) => {
          this.propertyStatuses = res;
        }),
        catchError((error: HttpErrorResponse): Observable<any> => {
          if (error) {
            console.error(error);
            this.toastr.error('Error al obtener el listado de estados de propiedad.', 'Error de petición', {
              progressBar: true,
            });
            return of(null);
          }
        })
      )
      .subscribe();
  }

  public getCities() {
    this.commonService
      .getCitiesProperties()
      .pipe(
        tap((res) => {
          this.cities = res;
        }),
        catchError((error: HttpErrorResponse): Observable<any> => {
          if (error) {
            console.error(error);
            this.toastr.error('Error al obtener el listado de ciudades donde hay operacion activa.', 'Error de petición', {
              progressBar: true,
            });
            return of(null);
          }
        })
      )
      .subscribe();
  }

  public getNeighborhoods() {
    this.propServ
      .getNeighborhoods()
      .pipe(
        tap((res) => {
          this.neighborhoods = res;
        }),
        catchError((error: HttpErrorResponse): Observable<any> => {
          if (error) {
            console.error(error);
            this.toastr.error('Error al obtener el listado de barrios.', 'Error de petición', {
              progressBar: true,
            });
            return of(null);
          }
        })
      )
      .subscribe();
  }

  public getZones() {
    this.propServ
      .getZones()
      .pipe(
        tap((res) => {
          this.zones = res;
        }),
        catchError((error: HttpErrorResponse): Observable<any> => {
          if (error) {
            console.error(error);
            this.toastr.error('Error al obtener el listado de zonas.', 'Error de petición', {
              progressBar: true,
            });
            return of(null);
          }
        })
      )
      .subscribe();
  }

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

  public buildFeaturesBack(f?: Feature[]) {
    const arr = f.map((feature) => {
      return {
        id: feature.id,
        name: feature.name,
        selected: false,
      };
    });
    return arr;
  }

  public reset() {
    this.form.reset({
      offer: null,
      propertyType: null,
      propertyStatus: null,
      price: {
        from: null,
        to: null,
      },
      city: null,
      neighborhood: null,
      zone: null,
      rooms: {
        from: null,
        to: null,
      },
      baths: {
        from: null,
        to: null,
      },
      garages: {
        from: null,
        to: null,
      },
      area: {
        from: null,
        to: null,
      },
      yearBuilt: {
        from: null,
        to: null,
      },
      features: this.features,
    });
  }

  public search() {
    this.onSearchClick.emit();
  }

  public onSelectCity() {
    this.form.controls['neighborhood'].setValue(null, { emitEvent: false });
    this.form.controls['zone'].setValue(null, { emitEvent: false });
  }
  public onSelectNeighborhood() {
    this.form.controls['city'].setValue(null, { emitEvent: false });
    this.form.controls['zone'].setValue(null, { emitEvent: false });
  }
  public onSelectZone() {
    this.form.controls['city'].setValue(null, { emitEvent: false });
    this.form.controls['neighborhood'].setValue(null, { emitEvent: false });
  }

  public getAppearance() {
    return this.variant != 3 ? 'outline' : '';
  }
  public getFloatLabel() {
    return this.variant == 1 ? 'always' : '';
  }

  public buildForm() {
    return this.fb.group({
      offer: null,
      propertyType: null,
      propertyStatus: null,
      price: this.fb.group({
        from: null,
        to: null,
      }),
      city: null,
      neighborhood: null,
      zone: null,
      rooms: this.fb.group({
        from: null,
        to: null,
      }),
      baths: this.fb.group({
        from: null,
        to: null,
      }),
      garages: this.fb.group({
        from: null,
        to: null,
      }),
      area: this.fb.group({
        from: null,
        to: null,
      }),
      yearBuilt: this.fb.group({
        from: null,
        to: null,
      }),
      features: this.buildFeatures(),
    });
  }
}
