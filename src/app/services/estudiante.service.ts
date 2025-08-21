import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, catchError } from 'rxjs';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root',
})
export class EstudianteService {
  private apiUrl = 'http://localhost:3000/api-beca/estudiante';

  constructor(private http: HttpClient, private error: ErrorService) {}

  createEstudiante(data: any): Promise<any> {
    return lastValueFrom(
      this.http.post<any>(this.apiUrl, data).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  async getAllEstudiantes(): Promise<any[]> {
    return await lastValueFrom(
      this.http.get<any[]>(this.apiUrl).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  async getEstudianteById(id: number): Promise<any> {
    return await lastValueFrom(
      this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  async eliminarEstudiante(id: number): Promise<any> {
    return await lastValueFrom(
      this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
        catchError(this.error.handleError)
      )
    );
  }
}