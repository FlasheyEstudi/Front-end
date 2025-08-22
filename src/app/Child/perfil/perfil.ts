import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth'; // Asegúrate del path correcto

interface Estudiante {
  Id: number;
  Nombre: string;
  Apellido: string;
  Edad: number;
  Correo: string;
  EstadoId: number;
  CarreraId: number;
  FechaRegistro?: string;
  estadoNombre?: string;
  carreraNombre?: string;
}

interface Estado { Id: number; Nombre: string; }
interface Carrera { Id: number; Nombre: string; }

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilComponent implements OnInit {
  estudiante: Estudiante | null = null;
  loading = false;
  error = '';
  estadosDisponibles: Estado[] = [];
  carrerasDisponibles: Carrera[] = [];
  form: FormGroup;
  changePasswordLoading = false;
  passwordError = '';
  passwordSuccess = '';

  private estudianteId: number | null = null;
  private baseUrl = 'http://localhost:3000/api-beca';

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatch });
  }

  passwordsMatch(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmNewPassword = group.get('confirmNewPassword')?.value;
    return newPassword === confirmNewPassword ? null : { notMatching: true };
  }

  ngOnInit(): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.error = 'No hay sesión activa.';
      this.router.navigate(['/login']);
      return;
    }

    // ✅ Decodificar el token para obtener userId y rol
    const decodedToken = this.decodeToken(token);
    const userId = decodedToken?.userId;
    const role = decodedToken?.role;

    if (!userId || !role) {
      this.error = 'Token inválido. Inicia sesión nuevamente.';
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    if (role !== 'estudiante') {
      this.error = 'Acceso denegado. Rol no autorizado.';
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    console.log('Token válido. Usuario ID:', userId, 'Rol:', role);
    this.mapearEstudianteId(userId);
    this.cargarEstadosYCarreras();
  }

  // ✅ Decodificar el JWT (sin librerías externas)
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      console.error('Error decodificando token:', e);
      return null;
    }
  }

  private mapearEstudianteId(userId: number): void {
    this.loading = true;
    const headers = this.getHeaders();

    this.http.get<{ estudianteId: number }>(
      `${this.baseUrl}/estudiante/mapa-id?userId=${userId}`,
      { headers }
    ).subscribe({
      next: (response) => {
        this.estudianteId = response.estudianteId;
        console.log('EstudianteId asociado:', this.estudianteId);

        if (this.estudianteId && this.estudianteId > 0) {
          this.cargarPerfil();
        } else {
          this.error = 'No se encontró un estudiante asociado a tu cuenta.';
          this.loading = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error en /mapa-id:', err);
        if (err.status === 404) {
          this.error = 'No se encontró relación entre usuario y estudiante.';
        } else if (err.status === 401 || err.status === 403) {
          this.error = 'Acceso no autorizado. Sesión inválida.';
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          this.error = 'Error de conexión con el servidor.';
        }
        this.loading = false;
      }
    });
  }

  private cargarPerfil(): void {
    if (!this.estudianteId || this.estudianteId <= 0) {
      this.error = 'ID de estudiante no válido.';
      this.loading = false;
      return;
    }

    this.loading = true;
    const url = `${this.baseUrl}/estudiante/${this.estudianteId}`;
    const headers = this.getHeaders();

    this.http.get<Estudiante>(url, { headers }).subscribe({
      next: (data) => {
        console.log('Perfil cargado:', data);
        this.estudiante = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar perfil:', err);
        if (err.status === 404) {
          this.error = 'Perfil no encontrado.';
        } else if (err.status === 401 || err.status === 403) {
          this.error = 'Sesión expirada o no autorizada.';
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          this.error = 'Error al cargar el perfil. Inténtalo más tarde.';
        }
        this.loading = false;
      }
    });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('❌ No hay token en localStorage');
      this.authService.logout();
      this.router.navigate(['/login']);
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  cargarEstadosYCarreras(): void {
    const headers = this.getHeaders();

    this.http.get<Estado[]>(`${this.baseUrl}/estado`, { headers })
      .subscribe({
        next: (data) => this.estadosDisponibles = Array.isArray(data) ? data : [],
        error: (err) => console.error('Error cargando estados:', err)
      });

    this.http.get<Carrera[]>(`${this.baseUrl}/carrera`, { headers })
      .subscribe({
        next: (data) => this.carrerasDisponibles = Array.isArray(data) ? data : [],
        error: (err) => console.error('Error cargando carreras:', err)
      });
  }

  getEstadoNombre(estadoId?: number): string {
    const estado = this.estadosDisponibles.find(e => e.Id === estadoId);
    return estado?.Nombre || 'Sin estado';
  }

  getCarreraNombre(carreraId?: number): string {
    const carrera = this.carrerasDisponibles.find(c => c.Id === carreraId);
    return carrera?.Nombre || 'Sin carrera';
  }

  cambiarContrasena(): void {
    this.passwordError = '';
    this.passwordSuccess = '';
    if (this.form.invalid) {
      this.passwordError = 'Por favor, completa correctamente todos los campos.';
      return;
    }

    const { currentPassword, newPassword } = this.form.value;
    this.changePasswordLoading = true;

    this.http.post(`${this.baseUrl}/auth/change-password`, { currentPassword, newPassword }, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.passwordSuccess = '✅ Contraseña actualizada correctamente.';
          this.form.reset();
          this.changePasswordLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.passwordError = err.error?.message || 'No se pudo cambiar la contraseña.';
          this.changePasswordLoading = false;
        }
      });
  }
}