// periodoacademico.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PeriodoAcademico {
  Id?: number;
  Nombre: string;
  AnioAcademico: string;
  FechaInicio: string | null;
  FechaFin: string | null;
  FechaRegistro?: string | null;
  FechaModificacion?: string | null;
  EstadoId: number | null;
  Estadonombre?: string;
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

  getAllPeriodoAcademicos(): Observable<PeriodoAcademico[]> {
    return this.http.get<PeriodoAcademico[]>(this.apiUrl);
  }

  createPeriodoAcademico(data: PeriodoAcademico): Observable<PeriodoAcademico> {
    return this.http.post<PeriodoAcademico>(`${this.apiUrl}/add`, data);
  }

  updatePeriodoAcademico(id: number, data: PeriodoAcademico): Observable<PeriodoAcademico> {
    return this.http.put<PeriodoAcademico>(`${this.apiUrl}/${id}`, data);
  }

  deletePeriodoAcademico(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getAllEstadosLookup(): Observable<EstadoLookup[]> {
    return this.http.get<EstadoLookup[]>(this.apiUrlEstado);
  }
}