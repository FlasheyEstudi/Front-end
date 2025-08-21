import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz TipoBeca ajustada
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
}

// Interfaz para estados
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

  // GET todos los tipos de beca
  getAllTipoBecas(): Observable<TipoBeca[]> {
    return this.http.get<TipoBeca[]>(this.apiUrl);
  }

  // GET un tipo de beca por ID
  getTipoBecaById(id: number): Observable<TipoBeca> {
    return this.http.get<TipoBeca>(`${this.apiUrl}/${id}`);
  }

  // CREATE
  createTipoBeca(data: Omit<TipoBeca, 'Id' | 'Estadonombre' | 'Beneficiarios'>): Observable<TipoBeca> {
    return this.http.post<TipoBeca>(`${this.apiUrl}/add`, data);
  }

  // UPDATE
  updateTipoBeca(id: number, data: Omit<TipoBeca, 'Id' | 'Estadonombre' | 'Beneficiarios'>): Observable<TipoBeca> {
    return this.http.put<TipoBeca>(`${this.apiUrl}/${id}`, data);
  }

  // DELETE
  deleteTipoBeca(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // UPDATE solo estado
  updateEstado(id: number, estadoId: number): Observable<TipoBeca> {
    return this.http.put<TipoBeca>(`${this.apiUrl}/${id}/estado`, { EstadoId: estadoId });
  }

  // GET todos los estados
  getAllEstadosLookup(): Observable<EstadoLookup[]> {
    return this.http.get<EstadoLookup[]>(this.apiUrlEstado);
  }
}