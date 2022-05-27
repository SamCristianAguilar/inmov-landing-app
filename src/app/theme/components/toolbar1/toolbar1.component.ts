import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-toolbar1',
  templateUrl: './toolbar1.component.html',
})
export class Toolbar1Component implements OnInit {
  @Output() onMenuIconClick: EventEmitter<any> = new EventEmitter<any>();
  constructor(public appService: AppService, public authServ: AuthService) {}

  ngOnInit() {}

  public sidenavToggle() {
    this.onMenuIconClick.emit();
  }
}
