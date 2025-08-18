import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, catchError } from 'rxjs';
import { ErrorService } from './error.service'; // Ajusta la ruta si cambia

@Injectable({
  providedIn: 'root',
})
export class PeriodoAcademicoService {
  private apiUrl = 'http://localhost:3000/api-beca/PeriodoAcademico';
  private apipostUrl = 'http://localhost:3000/api-beca/PeriodoAcademico/add';

  constructor(
    private http: HttpClient,
    private error: ErrorService
  ) { }

  createPeriodoAcademico(data: any): Promise<any> {
    const urlp = `${this.apipostUrl}`;
    return lastValueFrom(
      this.http.post<any>(urlp, data).pipe(
        catchError(this.error.handleError)
      )
    );
  }


  async getAllPeriodoAcademicos(): Promise<any[]> {
    return await lastValueFrom(
      this.http.get<any[]>(this.apiUrl).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  async getPeriodoAcademicoById(id: number): Promise<any> {
    return await lastValueFrom(
      this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
        catchError(this.error.handleError)
      )
    );
  }







}