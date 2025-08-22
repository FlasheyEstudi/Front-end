import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common';

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    nombre: string;
    role: string;
    email?: string;
  };
}

export interface RegisterUser {
  Nombre: string;
  Apellidos: string;
  Correo: string;
  Contrasena: string;
  Role: string;
}

export interface DecodedToken {
  sub: number;
  role: string;
  nombre: string;
  email?: string;
  iat: number;
  exp: number;
}

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
          }
        } catch (e) {
          console.error('❌ Error decodificando token:', e);
          localStorage.removeItem('access_token');
        }
      }
    }

    this.currentUserSubject = new BehaviorSubject<CurrentUser | null>(initialUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  // 🔑 Login
  login(identifier: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { identifier, password }).pipe(
      tap(res => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('access_token', res.access_token);
        }

        const userEmail = identifier.includes('@') ? identifier : undefined;

        this.currentUserSubject.next({
          ...res.user,
          email: userEmail
        });

        this.router.navigate(['/dashboard']);
      }),
      catchError(err => { throw err; })
    );
  }

  // ✅ Registro
  register(data: RegisterUser): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // 🔐 Logout
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ✅ Estado de sesión
  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const token = localStorage.getItem('access_token');
    return !!token && !this.isTokenExpired(token);
  }

  // ✅ Obtener usuario actual
  getCurrentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  getRole(): string | null {
    return this.currentUserSubject.value?.role || null;
  }

  getUserId(): number | null {
    return this.currentUserSubject.value?.id || null;
  }

  // 🔹 Alias claro
  getCurrentUserId(): number | null {
    return this.getUserId();
  }

  getEmail(): string | undefined {
    return this.currentUserSubject.value?.email;
  }

  // 🔐 Cambio de contraseña (envía token JWT automáticamente)
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Usuario no autenticado');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/change-password`, { currentPassword, newPassword }, { headers });
  }

  // ✅ Token expirado
  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
