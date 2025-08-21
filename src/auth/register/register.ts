import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, RegisterData } from '../auth';
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
  Correo = ''; // Changed from Email to Correo
  Contrasena = '';
  Role = 'estudiante';
  error = '';
  loading = false;
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    // Validación básica
    if (!this.Nombre.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }
    
    if (!this.Correo.trim()) {
      this.error = 'El correo electrónico es requerido';
      return;
    }
    
    if (!this.Contrasena.trim() || this.Contrasena.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.loading = true;
    this.error = '';

    const user: RegisterData = {
      Nombre: this.Nombre,
      Apellidos: this.Apellidos,
      Correo: this.Correo, // Changed from Email to Correo
      Contrasena: this.Contrasena,
      Role: this.Role
    };

    this.authService.register(user).subscribe({
      next: () => {
        this.loading = false;
        alert('Registro exitoso. Por favor inicie sesión.');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al registrar usuario';
        this.loading = false;
      }
    });
  }
}