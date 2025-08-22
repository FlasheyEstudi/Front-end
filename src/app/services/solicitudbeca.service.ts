import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interfaz exportada para poder usarla en otros componentes
export interface SolicitudBeca {
  Id?: number;
  EstudianteId: number;
  TipoBecaId: number;
  PeriodoAcademicoId: number;
  EstadoId?: number;
  FechaSolicitud?: string;
  Observaciones?: string;
  Fecha_resultado?: string; // igual que en backend
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
  private apiUrl = 'http://localhost:3000/api-beca/solicitudbeca'; // ✅ CORREGIDO
  private apiUrlPeriodos = 'http://localhost:3000/api-beca/periodoacademico';

  constructor(private http: HttpClient) {}

  // Obtener todos los datos para frontend (estudiantes, tipos de beca, estados, periodos)
  getAllData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/frontend-data`, { headers: this.getHeaders() })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error en getAllData:', error);
          return throwError(() => new Error(`Error al obtener datos: ${error.message}`));
        })
      );
  }

  // Listar todas las solicitudes
  getAll(): Observable<SolicitudBeca[]> {
    return this.http.get<SolicitudBeca[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Obtener una solicitud por ID
  getOne(id: number): Observable<SolicitudBeca> {
    return this.http.get<SolicitudBeca>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Crear nueva solicitud
  createSolicitudBeca(data: SolicitudBeca): Observable<SolicitudBeca> {
    return this.http.post<SolicitudBeca>(`${this.apiUrl}/add`, data, { headers: this.getHeaders() })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error en createSolicitudBeca:', error);
          return throwError(() => new Error(`Error al crear solicitud: ${error.message}`));
        })
      );
  }

  // Actualizar solicitud existente
  updateSolicitudBeca(id: number, data: SolicitudBeca): Observable<SolicitudBeca> {
    return this.http.put<SolicitudBeca>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  // Eliminar solicitud
  deleteSolicitudBeca(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Obtener periodos académicos
  getAllPeriodosAcademicosLookup(): Observable<PeriodoAcademico[]> {
    return this.http.get<PeriodoAcademico[]>(this.apiUrlPeriodos, { headers: this.getHeaders() });
  }

  // Headers con token de autenticación
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }
}