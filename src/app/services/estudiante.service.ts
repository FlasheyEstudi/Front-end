import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom, catchError } from 'rxjs';
import { ErrorService } from './error.service';
import { Router } from '@angular/router';

export interface Estudiante {
  Id: number;
  Nombre: string;
  Apellido: string;
  Edad: number;
  Correo: string;
  EstadoId?: number;
  CarreraId?: number;
  FechaRegistro: string;
  EstadoNombre?: string;
  CarreraNombre?: string;
}

export interface Estado {
  Id: number;
  Nombre: string;
}

export interface Carrera {
  Id: number;
  Nombre: string;
  Programa?: string;
}

export interface CreateEstudianteResponse {
  estudiante: Estudiante;
  credenciales: {
    username: string;
    password: string;
    mensaje: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class EstudianteService {
  private apiUrl = 'http://localhost:3000/api-beca/estudiante';
  private estadoUrl = 'http://localhost:3000/api-beca/estado';
  private carreraUrl = 'http://localhost:3000/api-beca/carrera';
  private mapaUrl = 'http://localhost:3000/api-beca/usuario/mapa-estudiante'; // Endpoint corregido

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private router: Router
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('[EstudianteService] Token no encontrado, redirigiendo a login');
      this.router.navigate(['/login']);
      throw new Error('No se encontró el token de autorización');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError<T>(operation = 'operation') {
    return (err: any) => {
      if (err.status === 401) {
        console.warn(`[${operation}] No autorizado, redirigiendo a login`);
        localStorage.removeItem('access_token');
        localStorage.removeItem('role');
        this.router.navigate(['/login']);
      }
      return this.errorService.handleError(err);
    };
  }

  async createEstudiante(data: any): Promise<CreateEstudianteResponse> {
    return await lastValueFrom(
      this.http.post<CreateEstudianteResponse>(this.apiUrl, data, { headers: this.getHeaders() })
        .pipe(
          catchError(this.handleError<CreateEstudianteResponse>('createEstudiante'))
        )
    );
  }

  async getAllEstudiantes(): Promise<Estudiante[]> {
    return await lastValueFrom(
      this.http.get<Estudiante[]>(this.apiUrl, { headers: this.getHeaders() })
        .pipe(
          catchError(this.handleError<Estudiante[]>('getAllEstudiantes'))
        )
    );
  }

  async getEstudianteById(id: number): Promise<Estudiante> {
    return await lastValueFrom(
      this.http.get<Estudiante>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
        .pipe(
          catchError(this.handleError<Estudiante>('getEstudianteById'))
        )
    );
  }

  async updateEstudiante(id: number, data: any): Promise<Estudiante> {
    return await lastValueFrom(
      this.http.put<Estudiante>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() })
        .pipe(
          catchError(this.handleError<Estudiante>('updateEstudiante'))
        )
    );
  }

  async eliminarEstudiante(id: number): Promise<any> {
    return await lastValueFrom(
      this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
        .pipe(
          catchError(this.handleError<any>('eliminarEstudiante'))
        )
    );
  }

  async getAllEstados(): Promise<Estado[]> {
    return await lastValueFrom(
      this.http.get<Estado[]>(this.estadoUrl, { headers: this.getHeaders() })
        .pipe(
          catchError(this.handleError<Estado[]>('getAllEstados'))
        )
    );
  }

  async getAllCarreras(): Promise<Carrera[]> {
    return await lastValueFrom(
      this.http.get<Carrera[]>(this.carreraUrl, { headers: this.getHeaders() })
        .pipe(
          catchError(this.handleError<Carrera[]>('getAllCarreras'))
        )
    );
  }

  async getEstudianteByEmail(email: string): Promise<Estudiante | undefined> {
    const estudiantes = await this.getAllEstudiantes();
    return estudiantes.find(e => e.Correo?.toLowerCase() === email.toLowerCase());
  }

  async getEstudianteIdByUserId(userId: number): Promise<number> {
    try {
      const response = await lastValueFrom(
        this.http.get<{ estudianteId: number }>(
          this.mapaUrl,
          {
            headers: this.getHeaders(),
            params: { userId: userId.toString() }
          }
        ).pipe(
          catchError(this.handleError<{ estudianteId: number }>('getEstudianteIdByUserId'))
        )
      );
      return response.estudianteId;
    } catch (error) {
      console.error('Error obteniendo mapeo usuario-estudiante:', error);
      throw error;
    }
  }
}