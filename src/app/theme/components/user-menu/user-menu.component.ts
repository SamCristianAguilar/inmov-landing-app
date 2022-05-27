import { Component, OnInit } from '@angular/core';
import { takeWhile, tap } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
})
export class UserMenuComponent implements OnInit {
  public nameUser: string;

  constructor(public appService: AppService, public authServ: AuthService) {}

  ngOnInit() {
    this.nameUser = this.authServ.getName();
    this.authServ.getNameUser.pipe(
      tap((res) => {
        this.nameUser = res;
      })
    );
  }

  public onLogout() {
    this.authServ.logout();
  }
}
