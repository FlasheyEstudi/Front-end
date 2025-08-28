// src/app/auth/auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common';

// Respuesta del login
export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    nombre: string;
    role: string;
    email?: string;
  };
  passwordGenerada?: string;
}

// Registro de usuario
export interface RegisterUser {
  Nombre: string;
  Apellidos: string;
  Correo: string;
  Role: string;
  Edad: number; // ✅ agregado
  Contrasena?: string;
}

// Token decodificado
export interface DecodedToken {
  sub: number;
  role: string;
  nombre: string;
  email?: string;
  iat: number;
  exp: number;
}

// Usuario actual
export interface CurrentUser {
  id: number;
  nombre: string;
  role: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
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
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          if (decoded.exp * 1000 > Date.now()) {
            initialUser = {
              id: decoded.sub,
              nombre: decoded.nombre,
              role: decoded.role,
              email: decoded.email
            };
          } else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('role');
          }
        } catch (e) {
          console.error('❌ Error decodificando token:', e);
          localStorage.removeItem('access_token');
          localStorage.removeItem('role');
        }
      }
    }

    this.currentUserSubject = new BehaviorSubject<CurrentUser | null>(initialUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  // Login
  login(identifier: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { identifier, password }).pipe(
      tap(res => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('access_token', res.access_token);
        }
        this.currentUserSubject.next(res.user);
        this.router.navigate(['/dashboard']);
      }),
      catchError(err => throwError(() => new Error(err.error?.message || 'Error en el login')))
    );
  }

  // Registro
  register(data: RegisterUser): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(() => {
        console.log('Usuario registrado con éxito. Ahora debe iniciar sesión.');
        this.currentUserSubject.next(null);
      }),
      catchError(err => throwError(() => new Error(err.error?.message || 'Error en el registro')))
    );
  }

  // Logout
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('role');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Chequear si está logueado
  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const token = localStorage.getItem('access_token');
    return !!token && !this.isTokenExpired(token);
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  getRole(): string | null {
    return this.currentUserSubject.value?.role || null;
  }

  getUserId(): number | null {
    return this.currentUserSubject.value?.id || null;
  }

  getCurrentUserId(): number | null {
    return this.getUserId();
  }

  getEmail(): string | undefined {
    return this.currentUserSubject.value?.email;
  }

  // Cambiar contraseña
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    if (!this.isLoggedIn()) {
      this.logout();
      return throwError(() => new Error('Sesión expirada. Por favor, inicia sesión nuevamente.'));
    }
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`${this.apiUrl}/change-password`, { currentPassword, newPassword }, { headers }).pipe(
      catchError(err => throwError(() => new Error(err.error?.message || 'Error al cambiar la contraseña')))
    );
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
