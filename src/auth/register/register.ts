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
  Edad: number | null = null;
  Role = 'estudiante';
  error = '';
  loading = false;

  showModal = false;
  credentials = {
    username: '',
    password: '',
    email: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(event?: Event) {
    if (event) event.preventDefault();
    this.error = '';

    if (!this.Nombre.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }
    if (!this.Apellidos.trim()) {
      this.error = 'Los apellidos son requeridos';
      return;
    }
    if (!this.Correo.trim()) {
      this.error = 'El correo electrónico es requerido';
      return;
    }
    if (this.Edad === null || this.Edad <= 0 || !Number.isInteger(this.Edad)) {
      this.error = 'La edad es requerida y debe ser un número entero positivo';
      return;
    }

    this.loading = true;

    const user: RegisterUser = {
      Nombre: this.Nombre,
      Apellidos: this.Apellidos,
      Correo: this.Correo,
      Edad: this.Edad,
      Role: this.Role
    };

    this.authService.register(user).subscribe({
      next: (response) => {
        this.loading = false;
        this.showCredentialsModal(response);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error en registro:', err);
        this.error = err.message || 'Error al registrar usuario. Intenta de nuevo.';
      }
    });
  }

  showCredentialsModal(response: any) {
    this.credentials = {
      username: response.user?.nombre || this.Nombre,
      password: response.passwordGenerada || 'Contraseña no disponible',
      email: response.user?.email || this.Correo
    };
    this.showModal = true;
  }

  closeCredentialsModal() {
    this.showModal = false;
    this.router.navigate(['/login']);
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert('¡Copiado al portapapeles!');
    }).catch(err => {
      console.error('Error al copiar: ', err);
      alert('Error al copiar al portapapeles.');
    });
  }
}
