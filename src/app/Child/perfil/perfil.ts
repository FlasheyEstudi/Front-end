import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth';

interface Beca {
  Id: number;
  Nombre: string;
  FechaInicio: string;
  FechaFin: string;
  Activa: boolean;
}

interface Estudiante {
  Id: number;
  Nombre: string;
  Apellido: string;
  Edad: number;
  Correo: string;
  EstadoId?: number;
  CarreraId?: number;
  FechaRegistro: string;
  EstadoNombre?: string;
  CarreraNombre?: string;
  becas?: Beca[];
  Carnet?: string;
  Telefono?: string;
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

  editMode = false;
  editForm: FormGroup;
  editLoading = false;
  editError = '';
  editSuccess = '';

  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

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

    this.editForm = this.fb.group({
      Nombre: ['', [Validators.required]],
      Apellido: ['', [Validators.required]],
      Edad: ['', [Validators.required, Validators.min(1)]],
      Correo: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      EstadoId: [null, [Validators.required]],
      CarreraId: [null, [Validators.required]],
      Carnet: [''],
      Telefono: ['']
    });
  }

  passwordsMatch(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmNewPassword = group.get('confirmNewPassword')?.value;
    return newPassword === confirmNewPassword ? null : { notMatching: true };
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    this.mapearEstudianteId(currentUser.id);
    this.cargarEstadosYCarreras();
  }

  trackByBecaId(index: number, beca: Beca): number {
    return beca?.Id ?? index;
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
        if (this.estudianteId && this.estudianteId > 0) {
          this.cargarPerfil();
        } else {
          this.loading = false;
          this.error = 'No se encontró el ID del estudiante.';
        }
      },
      error: (err) => {
        console.error('Error mapeando estudiante ID:', err);
        this.cargarEstudiantePorEmail();
      }
    });
  }

  private cargarEstudiantePorEmail(): void {
    const userEmail = this.authService.getEmail();
    if (!userEmail) {
      this.loading = false;
      this.error = 'No se pudo obtener el email del usuario.';
      return;
    }

    this.http.get<Estudiante[]>(
      `${this.baseUrl}/estudiante`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (estudiantes) => {
        const estudianteEncontrado = estudiantes.find(e => 
          e.Correo && e.Correo.toLowerCase() === userEmail.toLowerCase()
        );
        if (estudianteEncontrado) {
          this.estudianteId = estudianteEncontrado.Id;
          this.cargarPerfil();
        } else {
          this.loading = false;
          this.error = 'No se encontró el perfil del estudiante.';
        }
      },
      error: (err) => {
        console.error('Error cargando estudiante por email:', err);
        this.loading = false;
        this.error = 'Error al cargar el perfil del estudiante.';
      }
    });
  }

  private cargarPerfil(): void {
    if (!this.estudianteId || this.estudianteId <= 0) {
      this.loading = false;
      this.error = 'ID de estudiante inválido.';
      return;
    }

    this.loading = true;
    const url = `${this.baseUrl}/estudiante/${this.estudianteId}`;

    this.http.get<Estudiante>(url, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.estudiante = {
          Id: data.Id,
          Nombre: data.Nombre,
          Apellido: data.Apellido,
          Edad: data.Edad,
          Correo: data.Correo,
          EstadoId: data.EstadoId,
          CarreraId: data.CarreraId,
          FechaRegistro: data.FechaRegistro,
          EstadoNombre: data.EstadoNombre,
          CarreraNombre: data.CarreraNombre,
          becas: data.becas || [],
          Carnet: data.Carnet,
          Telefono: data.Telefono
        };
        this.loading = false;
        this.editForm.patchValue({
          Nombre: this.estudiante.Nombre,
          Apellido: this.estudiante.Apellido,
          Edad: this.estudiante.Edad,
          Correo: this.estudiante.Correo,
          EstadoId: this.estudiante.EstadoId ?? null,
          CarreraId: this.estudiante.CarreraId ?? null,
          Carnet: this.estudiante.Carnet ?? '',
          Telefono: this.estudiante.Telefono ?? ''
        });
      },
      error: (err) => {
        console.error('Error cargando perfil:', err);
        this.loading = false;
        this.error = 'Error al cargar el perfil.';
      }
    });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    });
  }

  cargarEstadosYCarreras(): void {
    const headers = this.getHeaders();

    this.http.get<Estado[]>(`${this.baseUrl}/estado`, { headers })
      .subscribe({ 
        next: (data) => this.estadosDisponibles = data || [],
        error: (err) => console.error('Error cargando estados:', err)
      });

    this.http.get<Carrera[]>(`${this.baseUrl}/carrera`, { headers })
      .subscribe({ 
        next: (data) => this.carrerasDisponibles = data || [],
        error: (err) => console.error('Error cargando carreras:', err)
      });
  }

  getEstadoNombre(estadoId?: number): string {
    if (!estadoId) return this.estudiante?.EstadoNombre || 'No asignado';
    const estado = this.estadosDisponibles.find(e => e.Id === estadoId);
    return estado?.Nombre || this.estudiante?.EstadoNombre || 'No asignado';
  }

  getCarreraNombre(carreraId?: number): string {
    if (!carreraId) return this.estudiante?.CarreraNombre || 'No asignada';
    const carrera = this.carrerasDisponibles.find(c => c.Id === carreraId);
    return carrera?.Nombre || this.estudiante?.CarreraNombre || 'No asignada';
  }

  cambiarContrasena(): void {
    this.passwordError = '';
    this.passwordSuccess = '';
    
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.hasError('notMatching')) {
        this.passwordError = 'Las nuevas contraseñas no coinciden';
      } else {
        this.passwordError = 'Por favor, corrige los errores del formulario';
      }
      this.showToastMessage(this.passwordError, 'error');
      return;
    }

    const { currentPassword, newPassword } = this.form.value;
    this.changePasswordLoading = true;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: (response) => {
        this.passwordSuccess = response?.message || 'Contraseña cambiada exitosamente';
        this.form.reset();
        this.changePasswordLoading = false;
        this.showToastMessage(this.passwordSuccess, 'success');
      },
      error: (err) => {
        this.changePasswordLoading = false;
        let errorMessage = 'Error al cambiar la contraseña. Inténtalo de nuevo más tarde.';
        if (err.status === 401) {
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        } else if (err.status === 403) {
          errorMessage = 'No tienes permiso para realizar esta acción.';
        } else if (err.status === 400) {
          errorMessage = err.error?.message || err.message || 'Datos de entrada inválidos.';
        } else if (err.status === 404) {
          errorMessage = 'Usuario no encontrado.';
        } else {
          errorMessage = err.error?.message || err.message || errorMessage;
        }
        this.passwordError = errorMessage;
        this.showToastMessage(this.passwordError, 'error');
      }
    });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (this.editMode && this.estudiante) {
      this.editForm.patchValue({
        Nombre: this.estudiante.Nombre,
        Apellido: this.estudiante.Apellido,
        Edad: this.estudiante.Edad,
        Correo: this.estudiante.Correo,
        EstadoId: this.estudiante.EstadoId ?? null,
        CarreraId: this.estudiante.CarreraId ?? null,
        Carnet: this.estudiante.Carnet ?? '',
        Telefono: this.estudiante.Telefono ?? ''
      });
    } else if (this.estudiante) {
      this.editForm.reset({
        Nombre: this.estudiante.Nombre,
        Apellido: this.estudiante.Apellido,
        Edad: this.estudiante.Edad,
        Correo: this.estudiante.Correo,
        EstadoId: this.estudiante.EstadoId ?? null,
        CarreraId: this.estudiante.CarreraId ?? null,
        Carnet: this.estudiante.Carnet ?? '',
        Telefono: this.estudiante.Telefono ?? ''
      });
    }
    this.editError = '';
    this.editSuccess = '';
  }

  cancelarEdicion(): void {
    this.editMode = false;
    if (this.estudiante) {
      this.editForm.reset({
        Nombre: this.estudiante.Nombre,
        Apellido: this.estudiante.Apellido,
        Edad: this.estudiante.Edad,
        Correo: this.estudiante.Correo,
        EstadoId: this.estudiante.EstadoId ?? null,
        CarreraId: this.estudiante.CarreraId ?? null,
        Carnet: this.estudiante.Carnet ?? '',
        Telefono: this.estudiante.Telefono ?? ''
      });
    }
    this.editError = '';
    this.editSuccess = '';
  }

  guardarCambios(): void {
    if (this.editForm.invalid || !this.estudianteId) {
      this.editError = 'Por favor, corrige los errores del formulario.';
      this.showToastMessage(this.editError, 'error');
      return;
    }

    this.editLoading = true;
    this.editError = '';
    this.editSuccess = '';
    
    const updatedEstudiante: Partial<Estudiante> = this.editForm.value;
    const { Nombre, Apellido, Edad, EstadoId, CarreraId, Carnet, Telefono } = updatedEstudiante;
    
    if (!Nombre || !Apellido || Edad === null || Edad === undefined || EstadoId === null || CarreraId === null) {
      this.editError = 'Todos los campos obligatorios deben estar completos.';
      this.editLoading = false;
      this.showToastMessage(this.editError, 'error');
      return;
    }
    
    this.http.put(
      `${this.baseUrl}/estudiante/${this.estudianteId}`, 
      { Nombre, Apellido, Edad, EstadoId, CarreraId, Carnet, Telefono }, 
      { headers: this.getHeaders() }
    ).subscribe({
      next: (response: any) => {
        this.editLoading = false;
        this.editMode = false;
        this.editSuccess = 'Perfil actualizado correctamente.';
        this.showToastMessage(this.editSuccess, 'success');
        this.cargarPerfil();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error guardando cambios:', err);
        this.editLoading = false;
        this.editError = err.error?.message || err.message || 'Error al actualizar el perfil.';
        this.showToastMessage(this.editError, 'error');
      }
    });
  }

  showToastMessage(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 5000);
  }

  closeToast() {
    this.showToast = false;
  }
}