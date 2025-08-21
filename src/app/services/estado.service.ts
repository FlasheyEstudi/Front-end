// estado.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Estado {
  Id?: number;
  Nombre: string;
  Color: string;
  FechaRegistro?: string | null;
  FechaModificacion?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class EstadoService {
  private apiUrl = 'http://localhost:3000/api-beca/estado';

  constructor(private http: HttpClient) {}

  getAllEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(this.apiUrl);
  }

  createEstado(data: Estado): Observable<Estado> {
    return this.http.post<Estado>(`${this.apiUrl}/add`, data);
  }

  updateEstado(id: number, data: Estado): Observable<Estado> {
    return this.http.put<Estado>(`${this.apiUrl}/${id}`, data);
  }

  deleteEstado(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}