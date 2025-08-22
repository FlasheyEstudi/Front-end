// src/app/Child/MisSolicitudes/mis-solicitudes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth';

interface Solicitud {
  Id: number;
  BecaNombre: string;
  EstadoNombre: string;
  FechaSolicitud: string;
  Monto?: number;
}

interface Estudiante {
  Id: number;
  Nombre: string;
  Apellido: string;
  Correo: string;
}

@Component({
  selector: 'app-mis-solicitudes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-solicitudes.html',
  styleUrls: ['./mis-solicitudes.css']
})
export class MisSolicitudesComponent implements OnInit {
  estudiante: Estudiante | null = null;
  estudianteId: number | null = null;
  solicitudes: Solicitud[] = [];
  loading = false;
  error = '';
  private baseUrl = 'http://localhost:3000/api-beca';

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.error = '❌ No hay sesión activa.';
      this.router.navigate(['/login']);
      return;
    }
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = '❌ Token inválido. Inicia sesión nuevamente.';
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }
    
    this.mapearEstudianteId(currentUser.id);
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return new HttpHeaders();
    }
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  private mapearEstudianteId(userId: number): void {
    this.loading = true;
    this.error = '';
    
    // Primero intentamos con el endpoint protegido
    this.http.get<{ estudianteId: number }>(`${this.baseUrl}/estudiante/mapa-id?userId=${userId}`, { headers: this.getHeaders() })
      .subscribe({
        next: res => {
          this.estudianteId = res.estudianteId;
          if (this.estudianteId && this.estudianteId > 0) {
            this.cargarSolicitudes();
          } else {
            this.error = '❌ No se encontró un estudiante asociado a tu cuenta.';
            this.loading = false;
          }
        },
        error: (err) => {
          // Si falla por token, intentamos con un enfoque alternativo
          console.warn('Falló el mapeo con token, intentando solución alternativa:', err);
          this.cargarSolicitudesAlternativo(userId);
        }
      });
  }

  private cargarSolicitudesAlternativo(userId: number): void {
    // Intentar obtener el estudiante por correo si tenemos el email
    const email = this.authService.getEmail();
    if (!email) {
      this.error = '❌ No se pudo obtener información del usuario.';
      this.loading = false;
      return;
    }
    
    // Buscar estudiante por correo
    this.http.get<Estudiante[]>(`${this.baseUrl}/estudiante`, { headers: this.getHeaders() })
      .subscribe({
        next: estudiantes => {
          const encontrado = estudiantes.find(e => e.Correo?.toLowerCase() === email.toLowerCase());
          if (encontrado) {
            this.estudianteId = encontrado.Id;
            this.cargarSolicitudes();
          } else {
            this.error = '❌ No se encontró un estudiante con tu correo.';
            this.loading = false;
          }
        },
        error: () => {
          this.error = '❌ Error buscando estudiante.';
          this.loading = false;
        }
      });
  }

  private cargarSolicitudes(): void {
    if (!this.estudianteId) return;
    
    this.http.get<Solicitud[]>(`${this.baseUrl}/solicitudbeca/estudiante/${this.estudianteId}`, { headers: this.getHeaders() })
      .subscribe({
        next: data => {
          this.solicitudes = data;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error cargando solicitudes', err);
          this.error = '❌ Error al cargar tus solicitudes.';
          this.loading = false;
        }
      });
  }
}