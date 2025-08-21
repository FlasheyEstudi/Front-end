// requisito.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Requisito {
  Id?: number;
  Descripcion: string;
  Tipo: string;
  FechaRegistro?: string | null;
  FechaModificacion?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class RequisitoService {
  private apiUrl = 'http://localhost:3000/api-beca/requisito';

  constructor(private http: HttpClient) {}

  getAllRequisitos(): Observable<Requisito[]> {
    return this.http.get<Requisito[]>(this.apiUrl);
  }

  createRequisito(data: Requisito): Observable<Requisito> {
    return this.http.post<Requisito>(`${this.apiUrl}/add`, data);
  }

  updateRequisito(id: number, data: Requisito): Observable<Requisito> {
    return this.http.put<Requisito>(`${this.apiUrl}/${id}`, data);
  }

  deleteRequisito(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}