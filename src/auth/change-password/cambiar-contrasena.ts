// src/app/estudiantes/cambiar-contrasena/cambiar-contrasena.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]],
    }, { validator: this.passwordsMatch });
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

    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    this.http.post(`${this.apiUrl}/change-password`, { currentPassword, newPassword }, { headers })
      .subscribe({
        next: () => {
          this.success = 'Contraseña cambiada exitosamente.';
          this.form.reset();
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al cambiar la contraseña.';
          this.loading = false;
        }
      });
  }
}