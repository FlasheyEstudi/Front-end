import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, catchError } from 'rxjs';
import { ErrorService } from './error.service'; // Adjust the path if it changes

@Injectable({
  providedIn: 'root',
})
export class AreaConocimientoService { // Service name for Beca.AreaConocimiento
  private apiUrl = 'http://localhost:3000/api-beca/areas-conocimiento'; // API URL for "areas-conocimiento"
  private apipostUrl = 'http://localhost:3000/api-beca/areas-conocimiento/add'; // API POST URL for "areas-conocimiento"

  constructor(
    private http: HttpClient,
    private error: ErrorService
  ) { }

  /**
   * Creates a new area of knowledge.
   * @param data The data for the new area of knowledge.
   * @returns A Promise that resolves with the created area of knowledge.
   */
  createAreaConocimiento(data: any): Promise<any> {
    const urlp = `${this.apipostUrl}`;
    return lastValueFrom(
      this.http.post<any>(urlp, data).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  /**
   * Retrieves all areas of knowledge.
   * @returns A Promise that resolves with an array of areas of knowledge.
   */
  async getAllAreasConocimiento(): Promise<any[]> {
    return await lastValueFrom(
      this.http.get<any[]>(this.apiUrl).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  /**
   * Retrieves a single area of knowledge by its ID.
   * @param id The ID of the area of knowledge.
   * @returns A Promise that resolves with the area of knowledge.
   */
  async getAreaConocimientoById(id: number): Promise<any> {
    return await lastValueFrom(
      this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
        catchError(this.error.handleError)
      )
    );
  }

  // Optional: Add update and delete methods for a complete CRUD service
  /**
   * Updates an existing area of knowledge.
   * @param id The ID of the area of knowledge to update.
   * @param data The updated data for the area of knowledge.
   * @returns A Promise that resolves with the updated area of knowledge.
   */
  
  async updateAreaConocimiento(id: number, data: any): Promise<any> {
    const updateUrl = `${this.apiUrl}/${id}`;
    return await lastValueFrom(
      this.http.put<any>(updateUrl, data).pipe(
        catchError(this.error.handleError)
      )
    );
  }
  

  /**
   * Deletes an area of knowledge by its ID.
   * @param id The ID of the area of knowledge to delete.
   * @returns A Promise that resolves when the deletion is complete.
   */
  
  async deleteAreaConocimiento(id: number): Promise<any> {
    const deleteUrl = `${this.apiUrl}/${id}`;
    return await lastValueFrom(
      this.http.delete<any>(deleteUrl).pipe(
        catchError(this.error.handleError)
      )
    );
  }
  
}
