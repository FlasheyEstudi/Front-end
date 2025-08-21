// src/app/services/detallepago.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// === INTERFACES === //

export interface DetallePago {
  Id?: number;
  SolicitudBecaId: number;
  SolicitudBecaReferencia?: string | null;
  TipoPagoId: number;
  TipoPagoNombre?: string | null;
  Monto: number;
  FechaPago: string;
  Referencia?: string | null;
  EstadoId: number;
  Estadonombre?: string | null;
}

export interface SolicitudBecaLookup {
  Id: number;
  Referencia: string;
}

export interface TipoPagoLookup {
  Id: number;
  Nombre: string;
}

export interface EstadoLookup {
  Id: number;
  Nombre: string;
}

export interface AllDataResponse {
  success: boolean;
  timestamp: string;
  data: {
    detalles: DetallePago[];
    solicitudes: SolicitudBecaLookup[];
    tiposPago: TipoPagoLookup[];
    estados: EstadoLookup[];
  };
  counts: {
    detalles: number;
    solicitudes: number;
    tiposPago: number;
    estados: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class DetallePagoService {
  private baseUrl = 'http://localhost:3000/api-beca';

  constructor(private http: HttpClient) {}

  // === OBTENER TODOS LOS DATOS JUNTOS === //
  getAllData(): Observable<AllDataResponse> {
    const headers = this.getHeaders();
    return this.http.get<AllDataResponse>(`${this.baseUrl}/detallepago/all-data`, { headers }).pipe(
      catchError((error) => {
        console.error('[DetallePagoService] Error en getAllData:', error);
        return of({
          success: false,
          timestamp: new Date().toISOString(),
          data: { detalles: [], solicitudes: [], tiposPago: [], estados: [] },
          counts: { detalles: 0, solicitudes: 0, tiposPago: 0, estados: 0 }
        });
      })
    );
  }

  // === MÉTODOS INDIVIDUALES === //
  getAllDetallePagos(): Observable<DetallePago[]> {
    return this.http.get<DetallePago[]>(`${this.baseUrl}/detallepago`, { headers: this.getHeaders() });
  }

  createDetallePago(data: Omit<DetallePago, 'Id' | 'SolicitudBecaReferencia' | 'TipoPagoNombre' | 'Estadonombre'>): Observable<DetallePago> {
    return this.http.post<DetallePago>(`${this.baseUrl}/detallepago/add`, data, { headers: this.getHeaders() });
  }

  updateDetallePago(id: number, data: Omit<DetallePago, 'Id' | 'SolicitudBecaReferencia' | 'TipoPagoNombre' | 'Estadonombre'>): Observable<DetallePago> {
    return this.http.put<DetallePago>(`${this.baseUrl}/detallepago/${id}`, data, { headers: this.getHeaders() });
  }

  deleteDetallePago(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/detallepago/${id}`, { headers: this.getHeaders() });
  }

  getAllSolicitudBecasLookup(): Observable<SolicitudBecaLookup[]> {
    return this.http.get<SolicitudBecaLookup[]>(`${this.baseUrl}/solicitudbeca`, { headers: this.getHeaders() });
  }

  getAllTipoPagosLookup(): Observable<TipoPagoLookup[]> {
    return this.http.get<TipoPagoLookup[]>(`${this.baseUrl}/tipopago`, { headers: this.getHeaders() });
  }

  getAllEstadosLookup(): Observable<EstadoLookup[]> {
    return this.http.get<EstadoLookup[]>(`${this.baseUrl}/estado`, { headers: this.getHeaders() });
  }

  // === HEADERS PRIVADOS === //
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }
}
