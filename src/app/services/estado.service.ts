import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Estado {
  Id?: number;
  Nombre: string;
  Color: string;
  FechaRegistro?: string | null;
  FechaModificacion?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class EstadoService {
  private apiUrl = 'http://localhost:3000/api-beca/estado';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error en la solicitud. Intenta de nuevo.';
    if (error.error?.detalle) {
      errorMessage = error.error.detalle;
    } else if (error.status === 0) {
      errorMessage = 'No se pudo conectar al servidor.';
    }
    return throwError(() => new Error(errorMessage));
  }

  getAllEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  createEstado(data: Estado): Observable<Estado> {
    return this.http.post<Estado>(`${this.apiUrl}/add`, data).pipe(catchError(this.handleError));
  }

  updateEstado(id: number, data: Estado): Observable<Estado> {
    return this.http.put<Estado>(`${this.apiUrl}/${id}`, data).pipe(catchError(this.handleError));
  }

  deleteEstado(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }
}