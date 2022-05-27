import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, of, Subscription, tap } from 'rxjs';
import { User } from 'src/app/models/models';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit, OnDestroy {
  public psConfig: PerfectScrollbarConfigInterface = {
    wheelPropagation: true,
  };
  @ViewChild('sidenav') sidenav: any;
  public sidenavOpen: boolean = true;
  public links = [
    { name: 'Mis Datos', href: 'profile', icon: 'person' },
    { name: 'Datos de ubicación', href: 'location', icon: 'person_pin_circle' },
    { name: 'Mis Propiedades', href: 'my-properties', icon: 'view_list' },
    { name: 'Mis Contratos', href: 'my-contracts', icon: 'list_alt' },
    { name: 'Favoritos', href: 'favorites', icon: 'favorite' },
  ];

  public nameUser: string;
  public idUser: number;
  public user: User;

  constructor(public router: Router, public authServ: AuthService, public userService: UserService, public toastr: ToastrService) {}

  ngOnInit() {
    if (window.innerWidth < 960) {
      this.sidenavOpen = false;
    }
    this.nameUser = this.authServ.getName();
    this.idUser = this.authServ.getId();
  }

  ngOnDestroy(): void {}

  @HostListener('window:resize')
  public onWindowResize(): void {
    window.innerWidth < 960 ? (this.sidenavOpen = false) : (this.sidenavOpen = true);
  }

  ngAfterViewInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (window.innerWidth < 960) {
          this.sidenav.close();
        }
      }
    });
  }
}
