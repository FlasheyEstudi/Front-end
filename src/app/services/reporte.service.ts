import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// === INTERFACES SINCRONIZADAS CON LOS STORED PROCEDURES === //

export interface ReporteTotales {
  TotalSolicitudes: number;
  Pendientes: number;
  Aprobadas: number;
  Rechazadas: number;
  PresupuestoTotal: number; // <-- agregado para sincronizar con componente
}

export interface ReporteSolicitudesPorEstado {
  Estado: string;
  Cantidad: number;
}

export interface ReporteFinancialData {
  Mes: string;
  MesNumero: number;
  Presupuesto: number;
  Ejecutado: number;
  Pendiente: number;
}

export interface ReporteStudentData {
  Id: number;
  Nombre: string;
  Apellidos: string;
  Carrera: string;
  becas: number;
  MontoTotal: number;
}

export interface ReporteImpactData {
  carrera: string;
  beneficiarios: number;
  promedio: number;
  graduados: number;
  tasaRetencion: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private apiUrl = 'http://localhost:3000/api-beca/reporte';

  constructor(public http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  getTotales(periodoAcademicoId?: number, estadoId?: number): Observable<ReporteTotales[]> {
    let params = new HttpParams();
    if (periodoAcademicoId != null) params = params.set('periodoAcademicoId', periodoAcademicoId.toString());
    if (estadoId != null) params = params.set('estadoId', estadoId.toString());
    return this.http.get<ReporteTotales[]>(`${this.apiUrl}/totales`, { headers: this.getHeaders(), params });
  }

  getSolicitudesPorEstado(periodoAcademicoId?: number): Observable<ReporteSolicitudesPorEstado[]> {
    let params = new HttpParams();
    if (periodoAcademicoId != null) params = params.set('periodoAcademicoId', periodoAcademicoId.toString());
    return this.http.get<ReporteSolicitudesPorEstado[]>(`${this.apiUrl}/solicitudes-por-estado`, { headers: this.getHeaders(), params });
  }

  getFinancialData(periodoAcademicoId?: number, estadoId?: number): Observable<ReporteFinancialData[]> {
    let params = new HttpParams();
    if (periodoAcademicoId != null) params = params.set('periodoAcademicoId', periodoAcademicoId.toString());
    if (estadoId != null) params = params.set('estadoId', estadoId.toString());
    return this.http.get<ReporteFinancialData[]>(`${this.apiUrl}/financial`, { headers: this.getHeaders(), params });
  }

  getStudentData(): Observable<ReporteStudentData[]> {
    return this.http.get<ReporteStudentData[]>(`${this.apiUrl}/estudiantes`, { headers: this.getHeaders() });
  }

  getImpactData(): Observable<ReporteImpactData[]> {
    return this.http.get<ReporteImpactData[]>(`${this.apiUrl}/impacto`, { headers: this.getHeaders() });
  }
}
