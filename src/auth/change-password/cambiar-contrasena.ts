import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth';
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]],
    }, { validator: this.passwordsMatch });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.error = 'Debes iniciar sesión para cambiar tu contraseña';
      setTimeout(() => this.router.navigate(['/login']), 2000);
    }
  }

  passwordsMatch(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmNewPassword = group.get('confirmNewPassword')?.value;
    return newPassword === confirmNewPassword ? null : { notMatching: true };
  }

  submit() {
    this.error = '';
    this.success = '';

    if (this.form.invalid) {
      this.error = this.form.hasError('notMatching')
        ? 'Las contraseñas no coinciden'
        : 'Por favor, corrige los errores del formulario';
      return;
    }

    this.loading = true;
    const { currentPassword, newPassword } = this.form.value;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.success = 'Contraseña cambiada exitosamente';
        this.loading = false;
        this.form.reset();
        setTimeout(() => this.router.navigate(['/perfil']), 2000);
      },
      error: (err) => {
        console.error('Error al cambiar contraseña:', err);
        this.error = err.message || 'Error al cambiar la contraseña. Verifica tus credenciales.';
        this.loading = false;
        if (err.status === 401 || err.status === 403) {
          setTimeout(() => this.router.navigate(['/login']), 2000);
        }
      }
    });
  }
}