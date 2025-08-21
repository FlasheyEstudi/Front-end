// src/app/auth/login/login.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  correo = '';
  password = '';
  error = '';
  loading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  login(loginForm: any) {
    if (!this.correo || !this.password) {
      this.error = 'Por favor, complete todos los campos';
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    const identifier = this.correo;
    
    this.authService.login(identifier, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        // redirección asegurada después del login
        this.router.navigate(['/dashboard']);
      },
      error: (error: any) => {
        console.error('Error de login en componente:', error);
        this.error = error.error?.message || 'Credenciales incorrectas o error de servidor. Inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }
}
