// src/auth/register/register.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, RegisterUser } from '../auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  Nombre = '';
  Apellidos = '';
  Correo = '';
  Contrasena = '';
  ConfirmarContrasena = '';
  Role = 'estudiante';
  error = '';
  loading = false;
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.Nombre.trim()) { this.error = 'El nombre es requerido'; return; }
    if (!this.Apellidos.trim()) { this.error = 'Los apellidos son requeridos'; return; }
    if (!this.Correo.trim()) { this.error = 'El correo electrónico es requerido'; return; }
    if (!this.Contrasena.trim() || this.Contrasena.length < 6) { this.error = 'La contraseña debe tener al menos 6 caracteres'; return; }
    if (this.Contrasena !== this.ConfirmarContrasena) { this.error = 'Las contraseñas no coinciden'; return; }

    this.loading = true;
    this.error = '';

    const user: RegisterUser = { Nombre: this.Nombre, Apellidos: this.Apellidos, Correo: this.Correo, Contrasena: this.Contrasena, Role: this.Role };

    this.authService.register(user).subscribe({
      next: () => { this.loading = false; alert('Registro exitoso. Por favor inicia sesión.'); this.router.navigate(['/login']); },
      error: err => { this.error = err.error?.message || 'Error al registrar usuario'; this.loading = false; }
    });
  }
}
