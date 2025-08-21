// src/app/services/solicitudbeca.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolicitudBecaService {
  private apiUrl = 'http://localhost:3000/api-beca/solicitudbeca';

  constructor(private http: HttpClient) { }

  // Método principal para obtener todos los datos
  getAllData(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/frontend-data`, { headers });
  }

  // Métodos individuales para cada tipo de dato (backup)
  getAllEstudiantesLookup(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`http://localhost:3000/api-beca/estudiante`, { headers });
  }

  getAllTipoBecasLookup(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`http://localhost:3000/api-beca/tipobeca`, { headers });
  }

  getAllEstadosLookup(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`http://localhost:3000/api-beca/estado`, { headers });
  }

  getAllPeriodosAcademicosLookup(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`http://localhost:3000/api-beca/periodoacademico`, { headers });
  }

  // Crear nueva solicitud
  createSolicitudBeca(data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/add`, data, { headers });
  }

  // Headers con token de autenticación
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }
}