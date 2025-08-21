import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, catchError } from 'rxjs';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root',
})
export class DetalleRequisitoBecaService {
  private apiUrl = 'http://localhost:3000/api-beca/Detalle_requisitos_becas'; // Corregido al controlador backend
  private apipostUrl = 'http://localhost:3000/api-beca/Detalle_requisitos_becas/add'; // Corregido al endpoint POST

  constructor(
    private http: HttpClient,
    private error: ErrorService
  ) {}

  createDetalleRequisitoBeca(data: any): Promise<any> {
    return lastValueFrom(
      this.http.post<any>(this.apipostUrl, data).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  async getAllDetalleRequisitosBeca(): Promise<any[]> {
    return await lastValueFrom(
      this.http.get<any[]>(this.apiUrl).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  async getDetalleRequisitoBecaById(id: number): Promise<any> {
    return await lastValueFrom(
      this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  async deleteDetalleRequisitoBeca(id: number): Promise<any> {
    return await lastValueFrom(
      this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
        catchError(this.error.handleError)
      )
    );
  }
}