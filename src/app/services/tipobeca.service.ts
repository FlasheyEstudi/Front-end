import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, catchError } from 'rxjs';
import { ErrorService } from './error.service'; // Ajusta la ruta si cambia

@Injectable({
  providedIn: 'root',
})
export class TipoBecaService {
  private apiUrl = 'http://localhost:3000/api-beca/TipoBeca';
  private apipostUrl = 'http://localhost:3000/api-beca/TipoBeca/add';

  constructor(
    private http: HttpClient,
    private error: ErrorService
  ) { }

  createTipoBeca(data: any): Promise<any> {
    const urlp = `${this.apipostUrl}`;
    return lastValueFrom(
      this.http.post<any>(urlp, data).pipe(
        catchError(this.error.handleError)
      )
    );
  }


  async getAllTipoBecas(): Promise<any[]> {
    return await lastValueFrom(
      this.http.get<any[]>(this.apiUrl).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  async getTipoBecaById(id: number): Promise<any> {
    return await lastValueFrom(
      this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
        catchError(this.error.handleError)
      )
    );
  }







}