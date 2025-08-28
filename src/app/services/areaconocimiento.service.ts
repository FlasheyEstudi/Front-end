import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface AreaConocimiento {
  Id: number;
  nombre: string;
  descripcion?: string;
  fechaCreacion: string; // Fecha como string
  fechaModificacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class AreaConocimientoService {
  private readonly apiUrl = 'http://localhost:3000/api-beca/area-conocimiento'; // Backend

  constructor(private http: HttpClient) { }

  // Obtener todas las áreas
  findAll(): Observable<AreaConocimiento[]> {
    return this.http.get<AreaConocimiento[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener una sola área
  findOne(id: number): Observable<AreaConocimiento> {
    return this.http.get<AreaConocimiento>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Crear área (¡corrigiendo la URL /add!)
  create(area: Omit<AreaConocimiento, 'Id' | 'fechaCreacion' | 'fechaModificacion'>): Observable<AreaConocimiento> {
    return this.http.post<AreaConocimiento>(`${this.apiUrl}/add`, area).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar área
  update(id: number, area: Partial<Omit<AreaConocimiento, 'Id' | 'fechaCreacion' | 'fechaModificacion'>>): Observable<AreaConocimiento> {
    return this.http.put<AreaConocimiento>(`${this.apiUrl}/${id}`, area).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar área
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
      if (error.error?.detalle) {
        errorMessage += `\nDetalle: ${error.error.detalle}`;
      }
    }
    console.error('AreaConocimientoService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
