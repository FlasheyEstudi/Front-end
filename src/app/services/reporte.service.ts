

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private apiUrl = 'http://localhost:3000/reporte'; // Ajusta según tu backend
  

  constructor(private http: HttpClient) {}

  getTotales(periodoAcademicoId?: number, estadoId?: number): Observable<any> {
    let url = `${this.apiUrl}/totales`;
    if (periodoAcademicoId || estadoId) {
      url += `?periodoAcademicoId=${periodoAcademicoId ?? ''}&estadoId=${estadoId ?? ''}`;
    }
    return this.http.get<any>(url);
  }

  getSolicitudesPorEstado(periodoAcademicoId?: number): Observable<any> {
    let url = `${this.apiUrl}/solicitudes-por-estado`;
    if (periodoAcademicoId) {
      url += `?periodoAcademicoId=${periodoAcademicoId}`;
    }
    return this.http.get<any>(url);
  }
}
