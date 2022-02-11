import { Component, Inject, PLATFORM_ID } from "@angular/core";
import { Settings, AppSettings } from "./app.settings";
import { Router, NavigationEnd } from "@angular/router";
import { isPlatformBrowser } from "@angular/common";
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  public settings: Settings;
  constructor(
    public appSettings: AppSettings,
    public router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    public translate: TranslateService,
    private spinner: NgxSpinnerService
  ) {
    this.settings = this.appSettings.settings;
    translate.addLangs(["es", "en"]);
    translate.setDefaultLang("es");
    translate.use("es");
  }
  ngOnInit() {
    /** spinner starts on init */
    this.spinner.show();

    setTimeout(() => {
      /** spinner ends after 5 seconds */
      this.spinner.hide();
    }, 5000);
  }

  ngAfterViewInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          if (isPlatformBrowser(this.platformId)) {
            window.scrollTo(0, 0);
          }
        });
      }
    });
  }
}
