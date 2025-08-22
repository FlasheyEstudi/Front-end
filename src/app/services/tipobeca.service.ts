// src/app/services/tipobeca.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Definición corregida de la interfaz TipoBeca
export interface TipoBeca {
  Id?: number;
  Categoria: string;
  Nombre: string;
  Descripcion?: string;
  Monto: number;
  PorcentajeCobertura: number;
  Prioridad: number;
  ColorHex?: string;
  EstadoId: number;
  Estadonombre?: string;
  Beneficiarios: number;
  FechaLimite?: string;
  RequisitosPrincipales?: string;
  RequisitosAdicionales?: number;
}

export interface EstadoLookup {
  Id: number;
  Nombre: string;
}

@Injectable({
  providedIn: 'root',
})
export class TipoBecaService {
  private apiUrl = 'http://localhost:3000/api-beca/tipobeca';
  private apiUrlEstado = 'http://localhost:3000/api-beca/estado';
  
  constructor(private http: HttpClient) {}

  // Métodos protegidos para administradores (funcionalidad existente)
  getAllTipoBecas(): Observable<TipoBeca[]> {
    return this.http.get<TipoBeca[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getTipoBecaById(id: number): Observable<TipoBeca> {
    return this.http.get<TipoBeca>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createTipoBeca(data: Omit<TipoBeca, 'Id' | 'Estadonombre' | 'Beneficiarios'>): Observable<TipoBeca> {
    return this.http.post<TipoBeca>(`${this.apiUrl}/add`, data, { headers: this.getAuthHeaders() });
  }

  updateTipoBeca(id: number, data: Omit<TipoBeca, 'Id' | 'Estadonombre' | 'Beneficiarios'>): Observable<TipoBeca> {
    return this.http.put<TipoBeca>(`${this.apiUrl}/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteTipoBeca(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  updateEstado(id: number, estadoId: number): Observable<TipoBeca> {
    return this.http.put<TipoBeca>(`${this.apiUrl}/${id}/estado`, { EstadoId: estadoId }, { headers: this.getAuthHeaders() });
  }

  getAllEstadosLookup(): Observable<EstadoLookup[]> {
    return this.http.get<EstadoLookup[]>(this.apiUrlEstado, { headers: this.getAuthHeaders() });
  }

  // ✅ NUEVO: Método público para estudiantes - obtener tipos de beca disponibles
  getTiposBecaDisponibles(): Observable<TipoBeca[]> {
    // No incluir token de autenticación para hacerlo público
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.get<TipoBeca[]>(`${this.apiUrl}/public/disponibles`, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al obtener tipos de beca disponibles:', error);
          return throwError(() => new Error(`Error al obtener tipos de beca: ${error.message}`));
        })
      );
  }

  // Headers con token de autenticación (para administradores)
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No se encontró el token de autorización');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}