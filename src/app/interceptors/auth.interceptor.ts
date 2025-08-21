import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtén el token de donde lo almacenas (localStorage, sessionStorage, un servicio de auth, etc.)
    const authToken = localStorage.getItem('access_token'); // O 'jwt_token', o como lo hayas guardado

    // Si hay un token, clona la solicitud y añade el encabezado Authorization
    if (authToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}` // ¡Importante el prefijo "Bearer "!
        }
      });
    }

    // Pasa la solicitud (modificada o no) al siguiente manejador
    return next.handle(request);
  }
}