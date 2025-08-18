import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, catchError } from 'rxjs';
import { ErrorService } from './error.service'; // Ajusta la ruta si cambia

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = 'http://localhost:3000/api-beca/Usuario';
  private apipostUrl = 'http://localhost:3000/api-beca/Usuario/add';

  constructor(
    private http: HttpClient,
    private error: ErrorService
  ) { }

  createUsuario(data: any): Promise<any> {
    const urlp = `${this.apipostUrl}`;
    return lastValueFrom(
      this.http.post<any>(urlp, data).pipe(
        catchError(this.error.handleError)
      )
    );
  }


  async getAllUsuarios(): Promise<any[]> {
    return await lastValueFrom(
      this.http.get<any[]>(this.apiUrl).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  async getUsuarioById(id: number): Promise<any> {
    return await lastValueFrom(
      this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
        catchError(this.error.handleError)
      )
    );
  }
}