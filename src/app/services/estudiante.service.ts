import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom, catchError } from 'rxjs';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root',
})
export class EstudianteService {
  private apiUrl = 'http://localhost:3000/api-beca/estudiante';

  constructor(private http: HttpClient, private error: ErrorService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token || ''}` });
  }

  createEstudiante(data: any): Promise<any> {
    return lastValueFrom(
      this.http.post<any>(this.apiUrl, data, { headers: this.getHeaders() }).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  async getAllEstudiantes(): Promise<any[]> {
    return await lastValueFrom(
      this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  async getEstudianteById(id: number): Promise<any> {
    return await lastValueFrom(
      this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  async eliminarEstudiante(id: number): Promise<any> {
    return await lastValueFrom(
      this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
        catchError(this.error.handleError)
      )
    );
  }
}