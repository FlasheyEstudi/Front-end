import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// === INTERFACES SINCRONIZADAS CON LOS STORED PROCEDURES === //
// === NOMBRES DE PROPIEDADES: PascalCase o alias específicos del SP === //

export interface ReporteTotales {
  // sp_ResumenTotales devuelve:
  // SELECT COUNT(sb.Id) AS TotalSolicitudes, ...
  TotalSolicitudes: number;
  Pendientes: number;
  Aprobadas: number;
  Rechazadas: number;
}

export interface ReporteSolicitudesPorEstado {
  // sp_SolicitudesPorEstado devuelve:
  // SELECT es.Nombre AS Estado, COUNT(sb.Id) AS Cantidad
  Estado: string;
  Cantidad: number;
}

export interface ReporteFinancialData {
  // sp_ResumenFinanciero devuelve:
  // SELECT DATENAME(MONTH, ...) AS Mes, MONTH(...) AS MesNumero,
  // ISNULL(SUM(CASE ... 'Aprobado' ...), 0) AS Presupuesto, ...
  Mes: string;        // Alias 'Mes' del SP
  MesNumero: number;  // Alias 'MesNumero' del SP
  Presupuesto: number; // Alias 'Presupuesto' del SP
  Ejecutado: number;    // Alias 'Ejecutado' del SP
  Pendiente: number;    // Alias 'Pendiente' del SP
}

export interface ReporteStudentData {
  // sp_Get_Estudiante_Detalle devuelve:
  // SELECT e.Id, e.Nombre, e.Apellido AS Apellidos, ...
  Id: number;
  Nombre: string;
  Apellidos: string; // Alias 'Apellidos' del SP
  Carrera: string;   // Alias 'Carrera' del SP
  becas: number;     // Alias 'becas' del SP (minúscula)
  MontoTotal: number; // Alias 'MontoTotal' del SP
}

export interface ReporteImpactData {
  // sp_Get_Impacto_Becas devuelve:
  // SELECT c.Nombre AS carrera, COUNT(e.Id) AS beneficiarios, ...
  carrera: string;        // Alias 'carrera' del SP (minúscula)
  beneficiarios: number;  // Alias 'beneficiarios' del SP (minúscula)
  promedio: number;       // Alias 'promedio' del SP (minúscula) - hardcoded 0
  graduados: number;      // Alias 'graduados' del SP (minúscula) - calculado
  tasaRetencion: number; // Alias 'tasaRetencion' del SP (camelCase) - hardcoded 0
}

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private apiUrl = 'http://localhost:3000/api-beca/reporte';

  constructor(public http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token'); // Asegúrate de usar la clave correcta
    console.log('[ReporteService] Token obtenido:', token ? 'SI' : 'NO');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  // --- MÉTODOS PÚBLICOS --- //

  getTotales(periodoAcademicoId?: number, estadoId?: number): Observable<ReporteTotales[]> {
    let params = new HttpParams();
    if (periodoAcademicoId !== undefined && periodoAcademicoId !== null) {
      params = params.set('periodoAcademicoId', periodoAcademicoId.toString());
    }
    if (estadoId !== undefined && estadoId !== null) {
      params = params.set('estadoId', estadoId.toString());
    }
    const headers = this.getHeaders();
    console.log(`[ReporteService.getTotales] Llamando a ${this.apiUrl}/totales con params:`, params.toString());
    return this.http.get<ReporteTotales[]>(`${this.apiUrl}/totales`, { headers, params });
  }

  getSolicitudesPorEstado(periodoAcademicoId?: number): Observable<ReporteSolicitudesPorEstado[]> {
    let params = new HttpParams();
    if (periodoAcademicoId !== undefined && periodoAcademicoId !== null) {
      params = params.set('periodoAcademicoId', periodoAcademicoId.toString());
    }
    const headers = this.getHeaders();
    console.log(`[ReporteService.getSolicitudesPorEstado] Llamando a ${this.apiUrl}/solicitudes-por-estado con params:`, params.toString());
    return this.http.get<ReporteSolicitudesPorEstado[]>(`${this.apiUrl}/solicitudes-por-estado`, { headers, params });
  }

  getFinancialData(periodoAcademicoId?: number, estadoId?: number): Observable<ReporteFinancialData[]> {
    let params = new HttpParams();
    if (periodoAcademicoId !== undefined && periodoAcademicoId !== null) {
      params = params.set('periodoAcademicoId', periodoAcademicoId.toString());
    }
    if (estadoId !== undefined && estadoId !== null) {
      params = params.set('estadoId', estadoId.toString());
    }
    const headers = this.getHeaders();
    console.log(`[ReporteService.getFinancialData] Llamando a ${this.apiUrl}/financial con params:`, params.toString());
    return this.http.get<ReporteFinancialData[]>(`${this.apiUrl}/financial`, { headers, params });
  }

  getStudentData(): Observable<ReporteStudentData[]> {
    const headers = this.getHeaders();
    console.log(`[ReporteService.getStudentData] Llamando a ${this.apiUrl}/estudiantes`);
    return this.http.get<ReporteStudentData[]>(`${this.apiUrl}/estudiantes`, { headers });
  }

  getImpactData(): Observable<ReporteImpactData[]> {
    const headers = this.getHeaders();
    console.log(`[ReporteService.getImpactData] Llamando a ${this.apiUrl}/impacto`);
    return this.http.get<ReporteImpactData[]>(`${this.apiUrl}/impacto`, { headers });
  }
}