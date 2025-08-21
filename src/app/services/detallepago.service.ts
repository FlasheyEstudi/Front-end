// src/app/services/detallepago.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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

export interface DashboardSummary {
  totalPagado: number;
  totalPendiente: number;
  beneficiariosActivos: number;
  presupuestoTotal: number;
}

export interface ControlPago {
  Id: number;
  Beneficiario: string;
  Beca: string;
  MontoTotal: number;
  Pagado: number;
  Restante: number;
  ProximoPago: Date;
  Estado: string;
}

export interface CalendarItem {
  fecha: string;
  pagos: {
    id: number;
    nombre: string;
    monto: number;
    estado: string;
  }[];
}

export interface TransactionHistory {
  id: number;
  nombre: string;
  fecha: Date;
  monto: number;
  metodo: string;
  estado: string;
}

@Injectable({
  providedIn: 'root',
})
export class DetallePagoService {
  private baseUrl = 'http://localhost:3000/api-beca/detallepago';

  constructor(private http: HttpClient) {}

  // === CRUD DETALLES DE PAGO === //
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

  // === LOOKUPS === //
  getAllSolicitudBecasLookup(): Observable<SolicitudBecaLookup[]> {
    return this.http.get<SolicitudBecaLookup[]>(`${this.baseUrl}/solicitudbeca`, { headers: this.getHeaders() });
  }

  getAllTipoPagosLookup(): Observable<TipoPagoLookup[]> {
    return this.http.get<TipoPagoLookup[]>(`${this.baseUrl}/tipopago`, { headers: this.getHeaders() });
  }

  getAllEstadosLookup(): Observable<EstadoLookup[]> {
    return this.http.get<EstadoLookup[]>(`${this.baseUrl}/estado`, { headers: this.getHeaders() });
  }

  // === DASHBOARD === //
  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/detallepago/dashboard-summary`, { headers: this.getHeaders() });
  }

  getControlDePagos(): Observable<ControlPago[]> {
    return this.http.get<ControlPago[]>(`${this.baseUrl}/detallepago/control-pagos`, { headers: this.getHeaders() });
  }

  getCalendarioDePagos(): Observable<CalendarItem[]> {
    return this.http.get<CalendarItem[]>(`${this.baseUrl}/detallepago/calendario-pagos`, { headers: this.getHeaders() });
  }

  getHistorialTransacciones(): Observable<TransactionHistory[]> {
    return this.http.get<TransactionHistory[]>(`${this.baseUrl}/detallepago/historial`, { headers: this.getHeaders() });
  }

  // === HEADERS === //
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }
}
