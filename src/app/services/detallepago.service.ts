// src/app/services/detallepago.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router'; // Importa Router

// --- Interfaces para datos del frontend ---
export interface EstudianteBeneficiado {
  EstudianteId: number;
  Nombre: string;
  Apellido: string;
  SolicitudBecaId: number;
}

export interface DetallePago {
  Id: number;
  SolicitudBecaId: number;
  TipoPagoId: number;
  Monto: number;
  FechaPago: string | null; // Fecha como string desde el backend o null
  Referencia: string;
  EstadoId: number;
  SolicitudBecaReferencia?: string | null;
  TipoPagoNombre?: string | null;
  Estadonombre?: string | null;
}

export interface SolicitudBecaLookup {
  Id: number;
  Referencia: string;
}

export interface TipoPagoLookup {
  Id: number;
  Nombre: string;
}

export interface EstadoLookup {
  Id: number;
  Nombre: string;
}

export interface ControlPago {
  Id: number;
  Beneficiario: string;
  Beca: string;
  MontoTotal: number;
  Pagado: number;
  Restante: number;
  ProximoPago: string; // Fecha como string
  Estado: string;
}

export interface CalendarioPago {
  fecha: string; // Fecha como string
  pagos: Array<{ id: number; nombre: string; monto: number; estado: string }>;
}

export interface TransactionHistory {
  id: number;
  nombre: string;
  fecha: string; // Fecha como string
  monto: number;
  metodo: string;
  estado: string;
}

export interface DashboardData {
  totalPagado: number;
  totalPendiente: number;
  beneficiariosActivos: number;
  presupuestoTotal: number;
}

// Estructura de respuesta del backend (basada en el análisis)
interface ApiResponseSuccess<T> {
  success: true;
  timestamp: string;
  data: T;
  counts?: any; // Puede tener counts u otros campos
}

interface ApiResponseError {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
}

type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

@Injectable({
  providedIn: 'root'
})
export class DetallePagoService {
  // *** CORRECCIÓN CLAVE DE LA URL ***
  // Asegúrate de que esta URL base sea correcta.
  // Si 'api-beca' está como prefijo global en main.ts del backend y usas proxy:
  // Si no usas proxy, descomenta la línea de abajo:
  private baseUrl = 'http://localhost:3000/api-beca/detallepago';
  // *** FIN CORRECCIÓN DE LA URL ***

  constructor(private http: HttpClient, private router: Router) {} // Inyectar Router

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    // Crear headers base
    let headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };
    // Solo añadir Authorization si el token existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('[DetallePagoService] Token de acceso no encontrado en localStorage.');
      // En lugar de lanzar error inmediatamente, dejamos que la llamada falle
      // y manejamos el 401 en handleError
    }
    return new HttpHeaders(headers);
  }

  // Función auxiliar para manejar respuestas consistentes del backend
  private extractData<T>(response: ApiResponse<T>): T {
    if (response && typeof response === 'object') {
      if ('success' in response) {
        if (response.success === true) {
          // Verificar que 'data' exista en una respuesta exitosa
          if ('data' in response) {
            return response.data;
          } else {
            console.error('[DetallePagoService] Respuesta exitosa del backend pero sin propiedad "data":', response);
            throw new Error('Respuesta del servidor inválida: falta la propiedad "data".');
          }
        } else if (response.success === false) {
          // Backend indicó fallo
          console.error('[DetallePagoService] Error reportado por el backend:', response.error);
          throw new Error(response.error || 'Error desconocido reportado por el servidor.');
        }
      } else {
        // Si no tiene 'success', asumir que es la data directa
        console.warn('[DetallePagoService] Formato de respuesta inesperado (sin "success"), devolviendo directamente:', response);
        return response as unknown as T;
      }
    }
    // Si response no es un objeto válido
    console.error('[DetallePagoService] Formato de respuesta completamente inesperado:', response);
    throw new Error('Formato de respuesta del servidor no reconocido.');
  }

  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente (red, sintaxis, etc.)
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error del servidor. Código: ${error.status}
Mensaje: ${error.message}`;
      if (error.error?.message) {
        errorMessage += `
Detalles del backend: ${error.error.message}`;
      } else if (error.error && typeof error.error === 'object' && 'error' in error.error) {
         errorMessage += `
Detalles del backend: ${(error.error as ApiResponseError).error}`;
      }
      // *** Manejo específico para errores de autenticación ***
      if (error.status === 401 || error.status === 403) {
        errorMessage = `Error de autenticación/autorización. Código: ${error.status}.`;
        console.warn(`[DetallePagoService] Error ${error.status} - Token inválido o expirado.`);
        // Limpiar token inválido
        localStorage.removeItem('access_token');
        localStorage.removeItem('role');
        // Redirigir al login
        this.router.navigate(['/login']);
      } else if (error.status === 0) {
        // Error de red, servidor caído, CORS, etc.
        errorMessage = 'Error de conexión. Verifique que el servidor esté en ejecución y accesible.';
      } else if (error.status === 200 && error.url && error.url.includes('/login')) {
        // Caso específico del mensaje de error original
        errorMessage = 'Error: La solicitud fue redirigida a la página de login. Verifique la autenticación.';
        console.warn('[DetallePagoService] Posible redirección a login detectada. Token probablemente inválido.');
        // También limpiar token y redirigir en este caso
        localStorage.removeItem('access_token');
        localStorage.removeItem('role');
        this.router.navigate(['/login']);
      }
      // *** FIN Manejo específico ***
    }
    console.error('[DetallePagoService] Error en la llamada HTTP:', errorMessage, error);
    return throwError(errorMessage);
  }

  // --- Métodos para operaciones CRUD y datos principales ---
  getAllData(): Observable<{
    detalles: DetallePago[];
    solicitudes: SolicitudBecaLookup[];
    tiposPago: TipoPagoLookup[];
    estados: EstadoLookup[];
  }> {
    return this.http.get<ApiResponse<{
      detalles: DetallePago[];
      solicitudes: SolicitudBecaLookup[];
      tiposPago: TipoPagoLookup[];
      estados: EstadoLookup[];
    }>>(`${this.baseUrl}/all-data`, { headers: this.getHeaders() }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  getEstudiantesBeneficiados(): Observable<EstudianteBeneficiado[]> {
    return this.http.get<ApiResponse<EstudianteBeneficiado[]>>(`${this.baseUrl}/estudiantes-beneficiados`, { headers: this.getHeaders() }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  getDashboardSummary(): Observable<DashboardData> {
    return this.http.get<ApiResponse<DashboardData>>(`${this.baseUrl}/dashboard-summary`, { headers: this.getHeaders() }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  getControlDePagos(): Observable<ControlPago[]> {
    return this.http.get<ApiResponse<ControlPago[]>>(`${this.baseUrl}/control-pagos`, { headers: this.getHeaders() }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  getCalendarioDePagos(): Observable<CalendarioPago[]> {
    return this.http.get<ApiResponse<CalendarioPago[]>>(`${this.baseUrl}/calendario-pagos`, { headers: this.getHeaders() }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  getHistorialTransacciones(): Observable<TransactionHistory[]> {
    return this.http.get<ApiResponse<TransactionHistory[]>>(`${this.baseUrl}/historial`, { headers: this.getHeaders() }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  add(data: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/add`, data, { headers: this.getHeaders() }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${id}`, data, { headers: this.getHeaders() }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }
}
