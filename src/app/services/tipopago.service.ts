// src/app/services/tipopago.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz para TipoPago
export interface TipoPago {
  Id?: number;
  Nombre: string;
  Descripcion: string;
  EstadoId: number; // Cambiado a EstadoId
  Estadonombre?: string;
}

// Interfaz para los lookups de Estado
export interface EstadoLookup {
  Id: number;
  Nombre: string;
}

@Injectable({
  providedIn: 'root',
})
export class TipoPagoService {
  private apiUrl = 'http://localhost:3000/api-beca/tipopago';

  constructor(private http: HttpClient) { }

  public getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token'); // Cambiado a access_token
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  /**
   * Obtiene todos los tipos de pago.
   * @returns Un Observable con un array de TipoPago.
   */
  getAllTipoPagos(): Observable<TipoPago[]> {
    return this.http.get<TipoPago[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  /**
   * Crea un nuevo tipo de pago.
   * @param data Los datos del tipo de pago a crear (sin Id).
   * @returns Un Observable con el TipoPago recién creado.
   */
  createTipoPago(data: Omit<TipoPago, 'Id' | 'Estadonombre'>): Observable<TipoPago> {
    return this.http.post<TipoPago>(`${this.apiUrl}/add`, data, { headers: this.getHeaders() });
  }

  /**
   * Actualiza un tipo de pago existente.
   * @param id El ID del tipo de pago a actualizar.
   * @param data Los datos actualizados del tipo de pago (sin Id).
   * @returns Un Observable con el TipoPago actualizado.
   */
  updateTipoPago(id: number, data: Omit<TipoPago, 'Id' | 'Estadonombre'>): Observable<TipoPago> {
    return this.http.put<TipoPago>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  /**
   * Elimina un tipo de pago por su ID.
   * @param id El ID del tipo de pago a eliminar.
   * @returns Un Observable con la respuesta de la eliminación.
   */
  deleteTipoPago(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Obtiene todos los estados para el dropdown de lookup.
   * @returns Un Observable con un array de EstadoLookup.
   */
  getAllEstadosLookup(): Observable<EstadoLookup[]> {
    return this.http.get<EstadoLookup[]>('http://localhost:3000/api-beca/estado', { headers: this.getHeaders() });
  }
}