// src/app/Child/CambiarContrasena/cambiar-contrasena.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth'; // Ajusta la ruta si es necesario
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cambiar-contrasena',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cambiar-contrasena.html',
  styleUrls: ['./cambiar-contrasena.css'],
})
export class CambiarContrasenaComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error = '';
  success = '';
  // Variable para controlar si se debe mostrar un mensaje temporal
  showMessage = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]],
    }, { validators: this.passwordsMatch });
  }

  ngOnInit(): void {
    console.log('CambiarContrasenaComponent: Inicializando');
    if (!this.authService.isLoggedIn()) {
      console.warn('CambiarContrasenaComponent: Usuario no autenticado, redirigiendo a login');
      this.error = 'Debes iniciar sesión para cambiar tu contraseña';
      this.showMessage = true;
      setTimeout(() => this.router.navigate(['/login']), 3000); // 3 segundos para ver el mensaje
    }
  }

  // Validator debe ser una función estática o una función flecha asignada
  passwordsMatch = (group: FormGroup) => {
    const newPassword = group.get('newPassword')?.value;
    const confirmNewPassword = group.get('confirmNewPassword')?.value;
    return newPassword === confirmNewPassword ? null : { notMatching: true };
  }

  submit() {
    console.log('CambiarContrasenaComponent: Submit iniciado');
    this.error = '';
    this.success = '';
    this.showMessage = true; // Activar la visualización de mensajes

    if (this.form.invalid) {
      if (this.form.hasError('notMatching')) {
        this.error = 'Las nuevas contraseñas no coinciden';
      } else {
        this.error = 'Por favor, corrige los errores del formulario';
      }
      console.log('CambiarContrasenaComponent: Formulario inválido', this.form.errors, this.form.get('newPassword')?.errors, this.form.get('confirmNewPassword')?.errors);
      return;
    }

    this.loading = true;
    const { currentPassword, newPassword } = this.form.value;
    console.log('CambiarContrasenaComponent: Llamando a authService.changePassword');

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: (response) => {
        console.log('CambiarContrasenaComponent: Contraseña cambiada exitosamente', response);
        this.success = response?.message || 'Contraseña cambiada exitosamente';
        this.loading = false;
        this.form.reset();
        // No redirigir automáticamente, permitir al usuario ver el mensaje
        // Opcional: redirigir después de un tiempo más largo
        // setTimeout(() => this.router.navigate(['/perfil']), 5000);
      },
      error: (err) => {
        console.error('CambiarContrasenaComponent: Error al cambiar contraseña:', err);
        this.loading = false;
        if (err.status === 401) {
          this.error = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          setTimeout(() => {
            this.authService.logout(); // Asegurarse de limpiar el estado
            this.router.navigate(['/login']);
          }, 3000);
        } else if (err.status === 403) {
          this.error = 'No tienes permiso para realizar esta acción.';
        } else if (err.status === 400) {
          // Errores de validación del backend
          this.error = err.error?.message || err.message || 'Datos de entrada inválidos.';
        } else if (err.status === 404) {
          this.error = 'Usuario no encontrado.';
        } else {
          // Error genérico
          this.error = err.error?.message || err.message || 'Error al cambiar la contraseña. Inténtalo de nuevo más tarde.';
        }
        // No redirigir automáticamente por error, salvo 401
      }
    });
  }

  // Método para cerrar mensajes manualmente si se desea
  closeMessage() {
    this.showMessage = false;
    this.error = '';
    this.success = '';
  }

  // Método para ir al perfil manualmente
  goToProfile() {
    this.router.navigate(['/perfil']);
  }
}