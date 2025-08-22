import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth';

@Component({
  selector: 'app-cambiar-contrasena',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cambiar-contrasena.html',
  styleUrls: ['./cambiar-contrasena.css'],
})
export class CambiarContrasenaComponent {
  form: FormGroup;
  loading = false;
  error = '';
  success = '';
  private apiUrl = 'http://localhost:3000/api-beca/auth';

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
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
      this.error = 'Por favor, corrige los errores del formulario.';
      return;
    }

    const { currentPassword, newPassword } = this.form.value;
    this.loading = true;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.success = 'Contraseña cambiada exitosamente.';
        this.form.reset();
        this.loading = false;
        setTimeout(() => this.router.navigate(['/perfil']), 2000);
      },
      error: (err) => {
        console.error('Error cambiando contraseña:', err);
        this.error = err.error?.message || 'Error al cambiar la contraseña.';
        this.loading = false;
        if (err.status === 401 || err.status === 403) {
          setTimeout(() => this.router.navigate(['/login']), 2000);
        }
      }
    });
  }
}
