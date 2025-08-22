// src/auth/auth.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode'; // ✅ Import nombrado
import { isPlatformBrowser } from '@angular/common';

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    nombre: string;
    role: string;
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
  iat: number;
  exp: number;
}

export interface CurrentUser {
  id: number;
  nombre: string;
  role: string;
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
          const decoded = jwtDecode(token) as DecodedToken; // ✅ Cast a DecodedToken
          if (decoded.exp * 1000 > Date.now()) {
            initialUser = { id: decoded.sub, nombre: decoded.nombre, role: decoded.role };
          } else {
            localStorage.removeItem('access_token');
          }
        } catch (e) {
          console.error('Error decodificando token:', e);
          localStorage.removeItem('access_token');
        }
      }
    }

    this.currentUserSubject = new BehaviorSubject<CurrentUser | null>(initialUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  login(identifier: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { identifier, password }).pipe(
      tap(res => {
        if (isPlatformBrowser(this.platformId)) localStorage.setItem('access_token', res.access_token);
        this.currentUserSubject.next(res.user);
        this.router.navigate(['/dashboard']);
      }),
      catchError(err => { throw err; })
    );
  }

  register(data: RegisterUser): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) localStorage.removeItem('access_token');
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

  getUserId(): number | null {
    return this.currentUserSubject.value?.id || null;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode(token) as DecodedToken;
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
