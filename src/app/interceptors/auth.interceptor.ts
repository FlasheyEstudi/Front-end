import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtener token de autenticación
    const authToken = localStorage.getItem('access_token');

    // Clonar request y añadir headers de autorización si existe token
    if (authToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }

    // Manejar errores de autenticación
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          // Token expirado o no válido - hacer logout y redirigir
          console.warn('🔐 Error de autenticación, redirigiendo a login');
          this.authService.logout();
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: this.router.url } 
          });
        }
        return throwError(error);
      })
    );
  }
}