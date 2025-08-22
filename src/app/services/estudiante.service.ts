// src/app/services/estudiante.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom, catchError } from 'rxjs';
import { ErrorService } from './error.service';
import { Router } from '@angular/router';

// Interfaces para tipado fuerte
export interface Estudiante {
  Id: number;
  Nombre: string;
  Apellido: string;
  Edad: number;
  Correo: string;
  EstadoId?: number;  // Hacer opcional
  CarreraId?: number; // Hacer opcional
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

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private router: Router
  ) {}

  /**
   * Obtiene las cabeceras con el token de autorización
   */
  private getHeaders(includeAuth: boolean = true): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (includeAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    
    return headers;
  }

  /**
   * Manejo genérico de errores con redirección en caso de 401
   */
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

  /**
   * Crea un nuevo estudiante
   */
  async createEstudiante(data: any): Promise<CreateEstudianteResponse> {
    const headers = this.getHeaders();
    // Verificar si hay token antes de enviar
    if (!headers.has('Authorization')) {
      throw new Error('No se encontró el token de autorización');
    }
    
    return await lastValueFrom(
      this.http.post<CreateEstudianteResponse>(this.apiUrl, data, { headers })
        .pipe(
          catchError(this.handleError<CreateEstudianteResponse>('createEstudiante'))
        )
    );
  }

  /**
   * Obtiene todos los estudiantes
   */
  async getAllEstudiantes(): Promise<Estudiante[]> {
    const headers = this.getHeaders();
    return await lastValueFrom(
      this.http.get<Estudiante[]>(this.apiUrl, { headers })
        .pipe(
          catchError(this.handleError<Estudiante[]>('getAllEstudiantes'))
        )
    );
  }

  /**
   * Obtiene un estudiante por ID
   */
  async getEstudianteById(id: number): Promise<Estudiante> {
    const headers = this.getHeaders();
    return await lastValueFrom(
      this.http.get<Estudiante>(`${this.apiUrl}/${id}`, { headers })
        .pipe(
          catchError(this.handleError<Estudiante>('getEstudianteById'))
        )
    );
  }

  /**
   * Actualiza un estudiante
   */
  async updateEstudiante(id: number, data: any): Promise<Estudiante> {
    const headers = this.getHeaders();
    // Verificar si hay token antes de enviar
    if (!headers.has('Authorization')) {
      throw new Error('No se encontró el token de autorización');
    }
    
    return await lastValueFrom(
      this.http.put<Estudiante>(`${this.apiUrl}/${id}`, data, { headers })
        .pipe(
          catchError(this.handleError<Estudiante>('updateEstudiante'))
        )
    );
  }

  /**
   * Elimina un estudiante
   */
  async eliminarEstudiante(id: number): Promise<any> {
    const headers = this.getHeaders();
    // Verificar si hay token antes de enviar
    if (!headers.has('Authorization')) {
      throw new Error('No se encontró el token de autorización');
    }
    
    return await lastValueFrom(
      this.http.delete<any>(`${this.apiUrl}/${id}`, { headers })
        .pipe(
          catchError(this.handleError<any>('eliminarEstudiante'))
        )
    );
  }

  /**
   * Obtiene todos los estados
   */
  async getAllEstados(): Promise<Estado[]> {
    const headers = this.getHeaders();
    return await lastValueFrom(
      this.http.get<Estado[]>(this.estadoUrl, { headers })
        .pipe(
          catchError(this.handleError<Estado[]>('getAllEstados'))
        )
    );
  }

  /**
   * Obtiene todas las carreras
   */
  async getAllCarreras(): Promise<Carrera[]> {
    const headers = this.getHeaders();
    return await lastValueFrom(
      this.http.get<Carrera[]>(this.carreraUrl, { headers })
        .pipe(
          catchError(this.handleError<Carrera[]>('getAllCarreras'))
        )
    );
  }

  /**
   * Busca un estudiante por correo
   */
  async getEstudianteByEmail(email: string): Promise<Estudiante | undefined> {
    const estudiantes = await this.getAllEstudiantes();
    return estudiantes.find(e => e.Correo?.toLowerCase() === email.toLowerCase());
  }

  /**
   * Mapea un usuario (por userId) a un estudiante (por estudianteId)
   */
  async getEstudianteIdByUserId(userId: number): Promise<number> {
    try {
      const headers = this.getHeaders(false); // No requerir auth para este endpoint
      const response = await lastValueFrom(
        this.http.get<{ estudianteId: number }>(
          `${this.apiUrl}/mapa-id`,
          {
            headers,
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