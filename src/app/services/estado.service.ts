import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, catchError } from 'rxjs';
import { ErrorService } from './error.service'; // Adjust the path if it changes

@Injectable({
  providedIn: 'root',
})
export class EstadoService { // Changed service name to EstadoService
  private apiUrl = 'http://localhost:3000/api-beca/estado'; // Changed API URL for "estados"
  private apipostUrl = 'http://localhost:3000/api-beca/estado/add'; // Changed API POST URL for "estados"

  constructor(
    private http: HttpClient,
    private error: ErrorService
  ) { }

  createEstado(data: any): Promise<any> { // Changed method name to createEstado
    const urlp = `${this.apipostUrl}`;
    return lastValueFrom(
      this.http.post<any>(urlp, data).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  async getAllEstados(): Promise<any[]> { // Changed method name to getAllEstados
    return await lastValueFrom(
      this.http.get<any[]>(this.apiUrl).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  async getEstadoById(id: number): Promise<any> { // Changed method name to getEstadoById
    return await lastValueFrom(
      this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  // You might want to add update and delete methods as well for a complete CRUD service
  // For example:
  
  async updateEstado(id: number, data: any): Promise<any> {
    const updateUrl = `${this.apiUrl}/${id}`;
    return await lastValueFrom(
      this.http.put<any>(updateUrl, data).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  async deleteEstado(id: number): Promise<any> {
    const deleteUrl = `${this.apiUrl}/${id}`;
    return await lastValueFrom(
      this.http.delete<any>(deleteUrl).pipe(
        catchError(this.error.handleError)
      )
    );
  }
  
}