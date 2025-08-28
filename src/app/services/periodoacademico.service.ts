import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface PeriodoAcademico {
  Id?: number;
  Codigo: string;
  Nombre: string;
  AnioAcademico: string;
  FechaInicio: string;
  FechaFin: string;
  FechaRegistro?: string | undefined;
  FechaModificacion?: string | undefined;
  EstadoId: number | null;
  Estadonombre?: string | undefined;
}

interface EstadoLookup {
  Id: number;
  Nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class PeriodoAcademicoService {
  private apiUrl = 'http://localhost:3000/api-beca/periodoacademico';
  private apiUrlEstado = 'http://localhost:3000/api-beca/estado';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error en la solicitud. Intenta de nuevo.';
    if (error.error?.detalle) {
      errorMessage = error.error.detalle;
    } else if (error.status === 0) {
      errorMessage = 'No se pudo conectar al servidor. Verifica la conexión.';
    }
    return throwError(() => new Error(errorMessage));
  }

  getAllPeriodoAcademicos(): Observable<PeriodoAcademico[]> {
    return this.http.get<PeriodoAcademico[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  createPeriodoAcademico(data: PeriodoAcademico): Observable<PeriodoAcademico> {
    return this.http.post<PeriodoAcademico>(`${this.apiUrl}/add`, data).pipe(
      catchError(this.handleError)
    );
  }

  updatePeriodoAcademico(id: number, data: PeriodoAcademico): Observable<PeriodoAcademico> {
    return this.http.put<PeriodoAcademico>(`${this.apiUrl}/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  deletePeriodoAcademico(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getAllEstadosLookup(): Observable<EstadoLookup[]> {
    return this.http.get<EstadoLookup[]>(this.apiUrlEstado).pipe(
      catchError(this.handleError)
    );
  }
}