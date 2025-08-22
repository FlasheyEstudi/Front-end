import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth';

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
    console.log('🔄 Iniciando componente de perfil...');
    
    // ✅ Verificar autenticación usando el servicio
    if (!this.authService.isLoggedIn()) {
      this.error = '❌ No hay sesión activa.';
      this.router.navigate(['/login']);
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.error = '❌ Token inválido. Inicia sesión nuevamente.';
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    console.log('👤 Usuario autenticado:', currentUser);
    this.mapearEstudianteId(currentUser.id);
    this.cargarEstadosYCarreras();
  }

  private mapearEstudianteId(userId: number): void {
    this.loading = true;
    this.error = '';
    const headers = this.getHeaders();

    console.log(`🔍 Intentando mapear usuario ${userId} a estudiante...`);

    // 1. Primero intentar con el endpoint de mapeo
    this.http.get<{ estudianteId: number }>(
      `${this.baseUrl}/estudiante/mapa-id?userId=${userId}`,
      { headers }
    ).subscribe({
      next: (response) => {
        this.estudianteId = response.estudianteId;
        console.log('✅ EstudianteId asociado via mapa-id:', this.estudianteId);

        if (this.estudianteId && this.estudianteId > 0) {
          this.cargarPerfil();
        } else {
          this.error = '❌ No se encontró un estudiante asociado a tu cuenta.';
          this.loading = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.warn('⚠️ Endpoint mapa-id no disponible, intentando por email...', err.message);
        
        // 2. Si falla el endpoint de mapeo, intentar por email
        this.cargarEstudiantePorEmail();
      }
    });
  }

  private cargarEstudiantePorEmail(): void {
    const userEmail = this.authService.getEmail();
    console.log('📧 Buscando estudiante por email:', userEmail);
    
    if (!userEmail) {
      this.error = '❌ No se puede determinar el correo del usuario.';
      this.loading = false;
      return;
    }

    // Buscar todos los estudiantes y filtrar por email
    this.http.get<Estudiante[]>(
      `${this.baseUrl}/estudiante`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (estudiantes) => {
        if (estudiantes && estudiantes.length > 0) {
          // Filtrar por email (case insensitive)
          const estudianteEncontrado = estudiantes.find(e => 
            e.Correo && e.Correo.toLowerCase() === userEmail.toLowerCase()
          );
          
          if (estudianteEncontrado) {
            this.estudianteId = estudianteEncontrado.Id;
            console.log('✅ Estudiante encontrado por email:', this.estudianteId);
            this.cargarPerfil();
          } else {
            this.error = '❌ No se encontró un estudiante con tu correo electrónico.';
            this.loading = false;
          }
        } else {
          this.error = '❌ No hay estudiantes registrados en el sistema.';
          this.loading = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('❌ Error buscando estudiantes:', err);
        this.error = '❌ Error al buscar tu perfil de estudiante.';
        this.loading = false;
      }
    });
  }

  private cargarPerfil(): void {
    if (!this.estudianteId || this.estudianteId <= 0) {
      this.error = '❌ ID de estudiante no válido.';
      this.loading = false;
      return;
    }

    this.loading = true;
    const url = `${this.baseUrl}/estudiante/${this.estudianteId}`;
    const headers = this.getHeaders();

    console.log(`📋 Cargando perfil del estudiante ${this.estudianteId}...`);

    this.http.get<Estudiante>(url, { headers }).subscribe({
      next: (data) => {
        console.log('✅ Perfil cargado:', data);
        this.estudiante = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('❌ Error al cargar perfil:', err);
        if (err.status === 404) {
          this.error = '❌ Perfil no encontrado.';
        } else if (err.status === 401 || err.status === 403) {
          this.error = '❌ Sesión expirada o no autorizada.';
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          this.error = '❌ Error al cargar el perfil. Inténtalo más tarde.';
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
        next: (data) => {
          this.estadosDisponibles = Array.isArray(data) ? data : [];
          console.log('✅ Estados cargados:', this.estadosDisponibles.length);
        },
        error: (err) => console.error('❌ Error cargando estados:', err)
      });

    this.http.get<Carrera[]>(`${this.baseUrl}/carrera`, { headers })
      .subscribe({
        next: (data) => {
          this.carrerasDisponibles = Array.isArray(data) ? data : [];
          console.log('✅ Carreras cargadas:', this.carrerasDisponibles.length);
        },
        error: (err) => console.error('❌ Error cargando carreras:', err)
      });
  }

  getEstadoNombre(estadoId?: number): string {
    if (!estadoId) return 'Sin estado';
    const estado = this.estadosDisponibles.find(e => e.Id === estadoId);
    return estado?.Nombre || 'Sin estado';
  }

  getCarreraNombre(carreraId?: number): string {
    if (!carreraId) return 'Sin carrera';
    const carrera = this.carrerasDisponibles.find(c => c.Id === carreraId);
    return carrera?.Nombre || 'Sin carrera';
  }

  cambiarContrasena(): void {
    this.passwordError = '';
    this.passwordSuccess = '';
    
    if (this.form.invalid) {
      this.passwordError = '❌ Por favor, completa correctamente todos los campos.';
      return;
    }

    const { currentPassword, newPassword } = this.form.value;
    this.changePasswordLoading = true;

    this.http.post(
      `${this.baseUrl}/auth/change-password`, 
      { currentPassword, newPassword }, 
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.passwordSuccess = '✅ Contraseña actualizada correctamente.';
        this.form.reset();
        this.changePasswordLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.passwordError = err.error?.message || '❌ No se pudo cambiar la contraseña.';
        this.changePasswordLoading = false;
      }
    });
  }
}