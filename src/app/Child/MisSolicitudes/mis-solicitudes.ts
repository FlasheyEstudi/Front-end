// src/app/Child/MisSolicitudes/mis-solicitudes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { SolicitudBecaService, SolicitudBecaDetalle } from '../../services/solicitudbeca.service';
import { AuthService } from '../../../auth/auth';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

interface SolicitudBecaViewModel {
  Id: number;
  TipoBecaNombre: string;
  EstadoNombre: string;
  FechaSolicitud: string;
  PorcentajeProgreso: number;
}

@Component({
  selector: 'app-mis-solicitudes',
  standalone: true, // Declarar como componente autónomo
  imports: [CommonModule], // Incluir CommonModule para *ngIf, *ngFor, ngClass
  templateUrl: './mis-solicitudes.html',
  styleUrls: ['./mis-solicitudes.css']
})
export class MisSolicitudesComponent implements OnInit {
  solicitudes: SolicitudBecaViewModel[] = [];
  loading = false;
  error = '';
  activeTab = 'active';

  constructor(
    private solicitudBecaService: SolicitudBecaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('[MisSolicitudesComponent] Inicializando...');
    if (!this.authService.isLoggedIn()) {
      console.warn('[MisSolicitudesComponent] Usuario no autenticado, redirigiendo a login.');
      this.error = '❌ No hay sesión activa.';
      this.router.navigate(['/login']);
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    console.log('[MisSolicitudesComponent] Usuario actual:', currentUser);

    if (!currentUser?.id) {
      console.error('[MisSolicitudesComponent] ID de usuario no disponible en el token.');
      this.error = '❌ Token inválido o ID de usuario no disponible.';
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    const userId = currentUser.id; // Usuario.Id
    console.log('[MisSolicitudesComponent] Cargando solicitudes para Usuario.Id:', userId);
    this.cargarSolicitudes(userId);
  }

  cargarSolicitudes(userId: number): void {
    console.log(`[MisSolicitudesComponent] Llamando a solicitudBecaService.getSolicitudesPorEstudiante(${userId})...`);
    this.loading = true;
    this.error = '';

    this.solicitudBecaService.getSolicitudesPorEstudiante(userId).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('[MisSolicitudesComponent] Error en catchError al cargar solicitudes:', error);
        let mensajeError = 'Error desconocido al cargar solicitudes.';
        if (error.error?.message) {
          mensajeError = error.error.message;
        } else if (error.message) {
          mensajeError = error.message;
        } else if (error.status) {
          mensajeError = `Error del servidor (${error.status}).`;
        }
        this.error = `❌ ${mensajeError}`;
        this.loading = false;
        return of([]);
      })
    ).subscribe({
      next: (data: SolicitudBecaDetalle[]) => {
        console.log('[MisSolicitudesComponent] Datos de solicitudes recibidos (crudos):', data);
        try {
          this.solicitudes = data.map((solicitud: SolicitudBecaDetalle) => {
            console.log('[MisSolicitudesComponent] Mapeando solicitud individual:', solicitud);
            if (!solicitud.EstadoNombre) {
              console.warn('[MisSolicitudesComponent] EstadoNombre es nulo o indefinido:', solicitud);
            }
            const solicitudMapeada: SolicitudBecaViewModel = {
              Id: solicitud.Id,
              TipoBecaNombre: solicitud.TipoBecaNombre || 'Sin tipo',
              EstadoNombre: solicitud.EstadoNombre || 'Desconocido',
              FechaSolicitud: solicitud.FechaSolicitud || new Date().toISOString(),
              PorcentajeProgreso: this.calcularProgresoSimulado(solicitud.EstadoNombre || 'Desconocido')
            };
            console.log('[MisSolicitudesComponent] Solicitud mapeada a ViewModel:', solicitudMapeada);
            return solicitudMapeada;
          });
          console.log('[MisSolicitudesComponent] Array de solicitudes mapeadas (this.solicitudes):', this.solicitudes);
        } catch (mapError: unknown) {
          console.error('[MisSolicitudesComponent] Error al mapear datos de solicitudes:', mapError);
          this.error = `❌ Error al procesar datos de solicitudes: ${mapError instanceof Error ? mapError.message : 'Desconocido'}`;
        } finally {
          this.loading = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('[MisSolicitudesComponent] Error inesperado en subscribe:', err);
        this.error = `❌ Error inesperado al cargar solicitudes: ${err.message || 'Desconocido'}`;
        this.loading = false;
      }
    });
  }

  private calcularProgresoSimulado(estadoNombre: string): number {
    const estadoNormalizado = estadoNombre?.trim().toLowerCase() || '';
    console.log(`[calcularProgresoSimulado] Estado: '${estadoNormalizado}'`);
    switch (estadoNormalizado) {
      case 'pendiente': return 25;
      case 'en revisión': return 50;
      case 'aprobado': return 100;
      case 'rechazado': return 100;
      case 'ejecutado': return 100;
      default:
        console.warn(`[calcularProgresoSimulado] Estado desconocido: '${estadoNombre}'`);
        return 0;
    }
  }

  getEstadoClass(estadoNombre: string): string {
    const normalizedEstado = estadoNombre?.trim().toLowerCase().replace(/\s+/g, '-') || 'estado-desconocido';
    console.log(`[getEstadoClass] Estado: ${estadoNombre}, Clase CSS: ${normalizedEstado}`);
    return normalizedEstado;
  }

  formatearFecha(fechaString: string | undefined): string {
    if (!fechaString) {
      console.log('[formatearFecha] Fecha indefinida o vacía recibida.');
      return 'Fecha no disponible';
    }
    try {
      const fecha = new Date(fechaString);
      if (isNaN(fecha.getTime())) {
        console.warn(`[formatearFecha] Fecha inválida recibida: ${fechaString}`);
        return 'Fecha inválida';
      }
      return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e: unknown) {
      console.error(`[formatearFecha] Error al formatear la fecha: ${fechaString}`, e);
      return 'Error al formatear fecha';
    }
  }

  abrirModal(): void {
    console.log('[MisSolicitudesComponent] Abrir modal de nueva solicitud');
    // Implementar lógica para abrir el modal
  }

  trackBySolicitudId(index: number, item: SolicitudBecaViewModel): number {
    return item.Id;
  }
}