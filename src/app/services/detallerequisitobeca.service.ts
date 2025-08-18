import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, catchError } from 'rxjs';
import { ErrorService } from './error.service'; // Adjust the path if it changes

@Injectable({
  providedIn: 'root',
})
export class DetalleRequisitoBecaService { // Service name for Detalle_requisitos_beca
  private apiUrl = 'http://localhost:3000/api-beca/detalle-requisitos-beca'; // API URL for "detalle-requisitos-beca"
  private apipostUrl = 'http://localhost:3000/api-beca/detalle-requisitos-beca/add'; // API POST URL for "detalle-requisitos-beca"

  constructor(
    private http: HttpClient,
    private error: ErrorService
  ) { }

  /**
   * Creates a new detail requirement for a scholarship.
   * @param data The data for the new detail requirement.
   * @returns A Promise that resolves with the created detail requirement.
   */
  createDetalleRequisitoBeca(data: any): Promise<any> {
    const urlp = `${this.apipostUrl}`;
    return lastValueFrom(
      this.http.post<any>(urlp, data).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  /**
   * Retrieves all detail requirements for scholarships.
   * @returns A Promise that resolves with an array of detail requirements.
   */
  async getAllDetalleRequisitosBeca(): Promise<any[]> {
    return await lastValueFrom(
      this.http.get<any[]>(this.apiUrl).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  /**
   * Retrieves a single detail requirement for a scholarship by its ID.
   * @param id The ID of the detail requirement.
   * @returns A Promise that resolves with the detail requirement.
   */
  async getDetalleRequisitoBecaById(id: number): Promise<any> {
    return await lastValueFrom(
      this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  // Optional: Add update and delete methods for a complete CRUD service
  /**
   * Updates an existing detail requirement for a scholarship.
   * @param id The ID of the detail requirement to update.
   * @param data The updated data for the detail requirement.
   * @returns A Promise that resolves with the updated detail requirement.
   */
  /*
  async updateDetalleRequisitoBeca(id: number, data: any): Promise<any> {
    const updateUrl = `${this.apiUrl}/${id}`;
    return await lastValueFrom(
      this.http.put<any>(updateUrl, data).pipe(
        catchError(this.error.handleError)
      )
    );
  }
  */

  /**
   * Deletes a detail requirement for a scholarship by its ID.
   * @param id The ID of the detail requirement to delete.
   * @returns A Promise that resolves when the deletion is complete.
   */

  async deleteDetalleRequisitoBeca(id: number): Promise<any> {
    const deleteUrl = `${this.apiUrl}/${id}`;
    return await lastValueFrom(
      this.http.delete<any>(deleteUrl).pipe(
        catchError(this.error.handleError)
      )
    );
  }
  
}