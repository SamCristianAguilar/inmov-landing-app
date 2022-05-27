import { Observable } from 'rxjs';
import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  public exeptions = ['/auth/login', '/uploads', '/departament', '/type-property', '/features', '/state-property'];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    const path = req.url.split('3050')[1];
    if (req.url.includes('https://maps.googleapis.com')) {
      return next.handle(req);
    }
    if (!this.exeptions.find((res) => res === path)) {
      const authToken = this.authService.userTokenValue;
      if (authToken) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${authToken}`,
            'Access-Control-Allow-Origin': '*',
          },
        });
        return next.handle(authReq);
      }
    }
    return next.handle(req);
  }
}
