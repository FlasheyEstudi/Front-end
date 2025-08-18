import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, catchError } from 'rxjs';
import { ErrorService } from './error.service'; // Ajusta la ruta si cambia

@Injectable({
  providedIn: 'root',
})
export class TipoPagoService {
  private apiUrl = 'http://localhost:3000/api-beca/TipoPago';
  private apipostUrl = 'http://localhost:3000/api-beca/TipoPago/add';

  constructor(
    private http: HttpClient,
    private error: ErrorService
  ) { }

  createTipoPago(data: any): Promise<any> {
    const urlp = `${this.apipostUrl}`;
    return lastValueFrom(
      this.http.post<any>(urlp, data).pipe(
        catchError(this.error.handleError)
      )
    );
  }


  async getAllTipoPagos(): Promise<any[]> {
    return await lastValueFrom(
      this.http.get<any[]>(this.apiUrl).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  async getTipoPagoById(id: number): Promise<any> {
    return await lastValueFrom(
      this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
        catchError(this.error.handleError)
      )
    );
  }
}