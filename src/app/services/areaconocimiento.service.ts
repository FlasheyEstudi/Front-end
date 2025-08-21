// areaconocimiento.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AreaConocimiento {
  Id?: number;
  nombre: string;
  descripcion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AreaConocimientoService {
  private apiUrl = 'http://localhost:3000/api-beca/area-conocimiento';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AreaConocimiento[]> {
    return this.http.get<AreaConocimiento[]>(this.apiUrl);
  }

  create(area: AreaConocimiento): Observable<AreaConocimiento> {
    return this.http.post<AreaConocimiento>(`${this.apiUrl}/add`, area);
  }

  update(id: number, area: AreaConocimiento): Observable<AreaConocimiento> {
    return this.http.put<AreaConocimiento>(`${this.apiUrl}/${id}`, area);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}