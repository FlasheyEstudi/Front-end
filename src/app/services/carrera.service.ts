import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, catchError } from 'rxjs';
import { ErrorService } from './error.service'; // Adjust the path if it changes

@Injectable({
  providedIn: 'root',
})
export class CarreraService { // Service name for Beca.Carrera
  private apiUrl = 'http://localhost:3000/api-beca/carreras'; // API URL for "carreras"
  private apipostUrl = 'http://localhost:3000/api-beca/carreras/add'; // API POST URL for "carreras"

  constructor(
    private http: HttpClient,
    private error: ErrorService
  ) { }

  /**
   * Creates a new career.
   * @param data The data for the new career.
   * @returns A Promise that resolves with the created career.
   */
  createCarrera(data: any): Promise<any> {
    const urlp = `${this.apipostUrl}`;
    return lastValueFrom(
      this.http.post<any>(urlp, data).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  /**
   * Retrieves all careers.
   * @returns A Promise that resolves with an array of careers.
   */
  async getAllCarreras(): Promise<any[]> {
    return await lastValueFrom(
      this.http.get<any[]>(this.apiUrl).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  /**
   * Retrieves a single career by its ID.
   * @param id The ID of the career.
   * @returns A Promise that resolves with the career.
   */
  async getCarreraById(id: number): Promise<any> {
    return await lastValueFrom(
      this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  // Optional: Add update and delete methods for a complete CRUD service
  /**
   * Updates an existing career.
   * @param id The ID of the career to update.
   * @param data The updated data for the career.
   * @returns A Promise that resolves with the updated career.
   */
  
  async updateCarrera(id: number, data: any): Promise<any> {
    const updateUrl = `${this.apiUrl}/${id}`;
    return await lastValueFrom(
      this.http.put<any>(updateUrl, data).pipe(
        catchError(this.error.handleError)
      )
    );
  }
  

  /**
   * Deletes a career by its ID.
   * @param id The ID of the career to delete.
   * @returns A Promise that resolves when the deletion is complete.
   */
  
  async deleteCarrera(id: number): Promise<any> {
    const deleteUrl = `${this.apiUrl}/${id}`;
    return await lastValueFrom(
      this.http.delete<any>(deleteUrl).pipe(
        catchError(this.error.handleError)
      )
    );
  }
  
}
