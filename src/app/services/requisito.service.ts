import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, catchError } from 'rxjs';
import { ErrorService } from './error.service'; // Ajusta la ruta si cambia

// Define la interfaz para Requisito para un mejor tipado
interface Requisito {
  Id?: number; // Opcional, ya que puede ser generado por el backend
  Descripcion: string;
  EstudianteId: number | null;
  FechaRegistro: string | null; // Usar string para el input type="date"
  FechaModificacion: string | null; // Usar string para el input type="date"
  EstadoId: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class RequisitoService { // Nombre del servicio actualizado
  // URLs de la API para Requisito
  private apiUrl = 'http://localhost:3000/api-beca/Requisito'; // ¡CAMBIA ESTO POR LA URL REAL DE TU API!
  private apipostUrl = 'http://localhost:3000/api-beca/Requisito/add'; // Asumiendo un endpoint 'add'

  constructor(
    private http: HttpClient,
    private error: ErrorService // Inyección del servicio de errores
  ) { }

  /**
   * Crea un nuevo requisito en el backend.
   * @param data Los datos del requisito a crear.
   * @returns Una promesa que resuelve con la respuesta del backend.
   */
  createRequisito(data: Requisito): Promise<Requisito> { // Tipo de parámetro y retorno actualizado
    const urlp = `${this.apipostUrl}`;
    return lastValueFrom(
      this.http.post<Requisito>(urlp, data).pipe( // Tipo de post actualizado
        catchError(this.error.handleError)
      )
    );
  }

  /**
   * Obtiene todos los requisitos desde el backend.
   * @returns Una promesa que resuelve con un array de requisitos.
   */
  async getAllRequisitos(): Promise<Requisito[]> { // Nombre del método y tipo de retorno actualizado
    return await lastValueFrom(
      this.http.get<Requisito[]>(this.apiUrl).pipe( // Tipo de get actualizado
        catchError(this.error.handleError)
      )
    );
  }

  /**
   * Obtiene un requisito específico por su ID desde el backend.
   * @param id El ID del requisito a buscar.
   * @returns Una promesa que resuelve con el requisito encontrado.
   */
  async getRequisitoById(id: number): Promise<Requisito> { // Nombre del método y tipo de retorno actualizado
    return await lastValueFrom(
      this.http.get<Requisito>(`${this.apiUrl}/${id}`).pipe( // Tipo de get actualizado
        catchError(this.error.handleError)
      )
    );
  }

  // Puedes añadir aquí métodos para actualizar (put/patch) y eliminar (delete) si los necesitas
}
