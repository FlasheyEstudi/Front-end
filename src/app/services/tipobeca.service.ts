import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz TipoBeca
export interface TipoBeca {
  Id?: number | undefined; // Opcional, puede ser undefined
  Nombre: string;
  Descripcion?: string;
  Monto: number | undefined;
  FechaRegistro?: string | null;
  FechaModificacion?: string | null;
  EstadoId: number | undefined;
  Estadonombre?: string;
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

  getAllTipoBecas(): Observable<TipoBeca[]> {
    return this.http.get<TipoBeca[]>(this.apiUrl);
  }

  createTipoBeca(data: Omit<TipoBeca, 'Id' | 'Estadonombre'>): Observable<TipoBeca> {
    return this.http.post<TipoBeca>(`${this.apiUrl}/add`, data);
  }

  updateTipoBeca(id: number, data: Omit<TipoBeca, 'Id' | 'Estadonombre'>): Observable<TipoBeca> {
    return this.http.put<TipoBeca>(`${this.apiUrl}/${id}`, data);
  }

  deleteTipoBeca(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getAllEstadosLookup(): Observable<EstadoLookup[]> {
    return this.http.get<EstadoLookup[]>(this.apiUrlEstado);
  }
}
