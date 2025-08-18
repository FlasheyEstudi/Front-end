import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, catchError } from 'rxjs';
import { ErrorService } from './error.service'; // Ajusta la ruta si cambia

// Define la interfaz para SolicitudBeca para un mejor tipado
interface SolicitudBeca {
  Id?: number; // Opcional, ya que puede ser generado por el backend
  EstudianteId: number | null;
  TipoBecaId: number | null;
  EstadoId: number | null;
  FechaSolicitud: string | null; // Usar string para el input type="date"
  PeriodoAcademicoId: number | null;
  Observaciones: string;
  Fecha_resultado: string | null; // Usar string para el input type="date"
}

@Injectable({
  providedIn: 'root',
})
export class SolicitudBecaService { // Nombre del servicio actualizado
  // URLs de la API para SolicitudBeca
  private apiUrl = 'http://localhost:3000/api-beca/SolicitudBeca';
  private apipostUrl = 'http://localhost:3000/api-beca/SolicitudBeca/add'; // Asumiendo un endpoint 'add'

  constructor(
    private http: HttpClient,
    private error: ErrorService // Inyección del servicio de errores
  ) { }

  /**
   * Crea una nueva solicitud de beca en el backend.
   * @param data Los datos de la solicitud de beca a crear.
   * @returns Una promesa que resuelve con la respuesta del backend.
   */
  createSolicitudBeca(data: SolicitudBeca): Promise<SolicitudBeca> { // Tipo de parámetro y retorno actualizado
    const urlp = `${this.apipostUrl}`;
    return lastValueFrom(
      this.http.post<SolicitudBeca>(urlp, data).pipe( // Tipo de post actualizado
        catchError(this.error.handleError)
      )
    );
  }

  /**
   * Obtiene todas las solicitudes de beca desde el backend.
   * @returns Una promesa que resuelve con un array de solicitudes de beca.
   */
  async getAllSolicitudesBeca(): Promise<SolicitudBeca[]> { // Nombre del método y tipo de retorno actualizado
    return await lastValueFrom(
      this.http.get<SolicitudBeca[]>(this.apiUrl).pipe( // Tipo de get actualizado
        catchError(this.error.handleError)
      )
    );
  }

  /**
   * Obtiene una solicitud de beca específica por su ID desde el backend.
   * @param id El ID de la solicitud de beca a buscar.
   * @returns Una promesa que resuelve con la solicitud de beca encontrada.
   */
  async getSolicitudBecaById(id: number): Promise<SolicitudBeca> { // Nombre del método y tipo de retorno actualizado
    return await lastValueFrom(
      this.http.get<SolicitudBeca>(`${this.apiUrl}/${id}`).pipe( // Tipo de get actualizado
        catchError(this.error.handleError)
      )
    );
  }

  // Puedes añadir aquí métodos para actualizar (put/patch) y eliminar (delete) si los necesitas
}
