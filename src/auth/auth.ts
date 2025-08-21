// src/app/auth/auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common';

// Interfaz para la respuesta de login del backend
export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    nombre: string;
    role: string;
  };
}

// Interfaz para los datos de registro a enviar al backend
export interface RegisterData {
  Nombre: string;
  Apellidos: string;
  Correo: string;
  Contrasena: string;
  Role: string;
}

// Interfaz para el payload decodificado del token JWT.
export interface DecodedToken {
  sub: number;
  role: string;
  nombre: string;
  iat: number;
  exp: number;
}

// Interfaz para el objeto de usuario que queremos mantener en el frontend
export interface CurrentUser {
  id: number;
  nombre: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<CurrentUser | null>;
  public currentUser$: Observable<CurrentUser | null>;

  private readonly apiUrl = 'http://localhost:3000/api-beca/auth';

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    let initialUser: CurrentUser | null = null;

    if (isPlatformBrowser(this.platformId)) {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        try {
          const decodedToken: DecodedToken = jwtDecode(storedToken);
          if (decodedToken.exp * 1000 > Date.now()) {
            initialUser = {
              id: decodedToken.sub,
              nombre: decodedToken.nombre,
              role: decodedToken.role
            };
          } else {
            localStorage.removeItem('access_token');
          }
        } catch (e) {
          console.error('Error al decodificar el token del localStorage:', e);
          localStorage.removeItem('access_token');
        }
      }
    }

    this.currentUserSubject = new BehaviorSubject<CurrentUser | null>(initialUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  login(identifier: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { identifier, password })
      .pipe(
        tap(response => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('access_token', response.access_token);
          }
          this.currentUserSubject.next(response.user);
          console.log('Login exitoso - Token:', response.access_token, 'User:', response.user);
          this.router.navigate(['/dashboard']);
        }),
        catchError(error => {
          console.error('Error en el login:', error);
          throw error;
        })
      );
  }

  register(userData: RegisterData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const token = localStorage.getItem('access_token');
    return !!token && !this.isTokenExpired(token);
  }

  getRole(): string | null {
    return this.currentUserSubject.value?.role || null;
  }

  getUsername(): string | null {
    return this.currentUserSubject.value?.nombre || null;
  }

  getUserId(): number | null {
    return this.currentUserSubject.value?.id || null;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decodedToken: DecodedToken = jwtDecode(token);
      return decodedToken.exp * 1000 < Date.now();
    } catch (error) {
      console.warn('No se pudo decodificar o verificar la expiración del token:', error);
      return true;
    }
  }
}
