import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  identifier = '';
  password = '';
  error = '';
  loading = false;
  showPassword = false;
  selectedRole = 'estudiante';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  selectRole(role: string) {
    this.selectedRole = role;
  }

  login(loginForm: NgForm) {
    if (loginForm.invalid) {
      this.error = 'Por favor, complete todos los campos correctamente';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.identifier, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        // ❌ ELIMINADO: No establecer el rol manualmente
        // localStorage.setItem('role', this.selectedRole); // Esta línea causaba el problema
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error de login:', err);
        this.error = err.message || 'Credenciales incorrectas o error de servidor. Inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }
}