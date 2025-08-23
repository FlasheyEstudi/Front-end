// src/app/services/solicitudbeca.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface SolicitudBecaDetalle {
  Id: number;
  EstudianteId: number;
  TipoBecaId: number;
  EstadoId: number;
  FechaSolicitud: string;
  PeriodoAcademicoId: number;
  Observaciones?: string;
  Fecha_resultado?: string;
  EstudianteNombre: string;
  EstudianteApellido: string;
  TipoBecaNombre: string;
  EstadoNombre: string;
  PeriodoAcademicoNombre: string;
  PeriodoAnioAcademico: string;
}

export interface SolicitudBeca {
  Id?: number;
  EstudianteId: number;
  TipoBecaId: number;
  PeriodoAcademicoId: number;
  EstadoId?: number;
  FechaSolicitud?: string;
  Observaciones?: string;
  Fecha_resultado?: string;
}

export interface PeriodoAcademico {
  Id: number;
  Nombre: string;
  FechaInicio?: string;
  FechaFin?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SolicitudBecaService {
  private apiUrl = 'http://localhost:3000/api-beca/solicitudbeca';
  private apiUrlPeriodos = 'http://localhost:3000/api-beca/periodoacademico';

  constructor(private http: HttpClient) {}

  getAllData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/frontend-data`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getAll(): Observable<SolicitudBeca[]> {
    return this.http.get<SolicitudBeca[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getOne(id: number): Observable<SolicitudBeca> {
    return this.http.get<SolicitudBeca>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getSolicitudesPorEstudiante(estudianteId: number): Observable<SolicitudBecaDetalle[]> {
    console.log(`[SolicitudBecaService] Solicitando datos para estudiante ${estudianteId}`);
    return this.http.get<SolicitudBecaDetalle[]>(
      `${this.apiUrl}/estudiante/${estudianteId}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`[SolicitudBecaService] Error al obtener solicitudes para estudiante ${estudianteId}:`, error);
        if (error.status === 401) {
          console.error('Error de autenticación: Token inválido o ausente');
        } else if (error.status === 404) {
          console.error('Endpoint no encontrado');
        }
        return throwError(() => new Error(`Error al obtener solicitudes: ${error.message}`));
      })
    );
  }

  createSolicitudBeca(data: SolicitudBeca): Observable<SolicitudBeca> {
    return this.http.post<SolicitudBeca>(`${this.apiUrl}/add`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateSolicitudBeca(id: number, data: SolicitudBeca): Observable<SolicitudBeca> {
    return this.http.put<SolicitudBeca>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteSolicitudBeca(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getAllPeriodosAcademicosLookup(): Observable<PeriodoAcademico[]> {
    return this.http.get<PeriodoAcademico[]>(this.apiUrlPeriodos, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('[SolicitudBecaService] No se encontró access_token en localStorage.');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error en la solicitud HTTP:', error);
    return throwError(() => new Error(`Error: ${error.message}`));
  }
}