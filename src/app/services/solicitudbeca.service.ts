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
  FechaSolicitud: string | null;
  PeriodoAcademicoId: number;
  Observaciones: string | null;
  Fecha_resultado: string | null;
  EstudianteNombre: string | null;
  EstudianteApellido: string | null;
  TipoBecaNombre: string | null;
  EstadoNombre: string | null;
  PeriodoAcademicoNombre: string | null;
  PeriodoAnioAcademico: string | null;
}

export interface SolicitudBeca {
  Id?: number;
  EstudianteId: number;
  TipoBecaId: number;
  PeriodoAcademicoId: number;
  EstadoId?: number;
  FechaSolicitud?: string;
  Observaciones?: string;
  Fecha_resultado?: string | null;
}

export interface PeriodoAcademico {
  Id: number;
  Nombre: string;
  FechaInicio?: string;
  FechaFin?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitudBecaService {
  private apiUrl = 'http://localhost:3000/api-beca/solicitudbeca';
  private apiUrlPeriodos = 'http://localhost:3000/api-beca/periodoacademico';

  constructor(private http: HttpClient) {}

  getAllData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/frontend-data`, { headers: this.getHeaders() }).pipe(catchError(this.handleError));
  }

  getAll(): Observable<SolicitudBeca[]> {
    return this.http.get<SolicitudBeca[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(catchError(this.handleError));
  }

  getOne(id: number): Observable<SolicitudBeca> {
    return this.http.get<SolicitudBeca>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(catchError(this.handleError));
  }

  getSolicitudesPorEstudiante(estudianteId: number): Observable<SolicitudBecaDetalle[]> {
    return this.http.get<SolicitudBecaDetalle[]>(`${this.apiUrl}/estudiante/${estudianteId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createSolicitudBeca(data: SolicitudBeca): Observable<SolicitudBecaDetalle> {
    return this.http.post<SolicitudBecaDetalle>(`${this.apiUrl}/add`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateSolicitudBeca(id: number, data: SolicitudBeca): Observable<SolicitudBeca> {
    return this.http.put<SolicitudBeca>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() }).pipe(catchError(this.handleError));
  }

  deleteSolicitudBeca(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(catchError(this.handleError));
  }

  getAllPeriodosAcademicosLookup(): Observable<PeriodoAcademico[]> {
    return this.http.get<PeriodoAcademico[]>(this.apiUrlPeriodos, { headers: this.getHeaders() }).pipe(catchError(this.handleError));
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Error desconocido';
    if (error.status === 409) message = 'Ya existe una solicitud para esta beca';
    else if (error.status === 400) message = 'Datos inválidos';
    else if (error.error?.message) message = error.error.message;
    console.error(`[SolicitudBecaService] Error: ${message}`, error);
    return throwError(() => new Error(message));
  }
}