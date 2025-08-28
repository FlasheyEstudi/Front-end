import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudBecaService, SolicitudBeca, SolicitudBecaDetalle, PeriodoAcademico } from '../../services/solicitudbeca.service';
import { AuthService } from '../../../auth/auth';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface SolicitudBecaViewModel {
  Id: number;
  TipoBecaId: number; // Added to fix TS2339
  TipoBecaNombre: string;
  EstadoNombre: string;
  FechaSolicitud: string;
  PorcentajeProgreso: number;
}

interface TipoBeca {
  Id: number;
  Nombre: string;
}

@Component({
  selector: 'app-mis-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-solicitudes.html',
  styleUrls: ['./mis-solicitudes.css']
})
export class MisSolicitudesComponent implements OnInit {
  solicitudes: SolicitudBecaViewModel[] = [];
  loading = false;
  error = '';
  showModal = false;
  tiposBeca: TipoBeca[] = [];
  periodosAcademicos: PeriodoAcademico[] = [];
  formData: SolicitudBeca = {
    EstudianteId: 0,
    TipoBecaId: 0,
    PeriodoAcademicoId: 0,
    Observaciones: '',
    FechaSolicitud: new Date().toISOString().split('T')[0],
    EstadoId: 1
  };

  constructor(
    private solicitudBecaService: SolicitudBecaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.error = '❌ Sesión no activa';
      this.router.navigate(['/login']);
      return;
    }
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) {
      this.error = '❌ Token inválido';
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }
    this.formData.EstudianteId = userId;
    this.cargarSolicitudes(userId);
    this.cargarDatosModal();
  }

  cargarSolicitudes(userId: number): void {
    this.loading = true;
    this.error = '';
    this.solicitudBecaService.getSolicitudesPorEstudiante(userId).pipe(
      catchError((err: HttpErrorResponse) => {
        this.error = `❌ Error al cargar solicitudes: ${err.message}`;
        this.loading = false;
        return of([]);
      })
    ).subscribe({
      next: (data: SolicitudBecaDetalle[]) => {
        this.solicitudes = data.map(s => ({
          Id: s.Id,
          TipoBecaId: s.TipoBecaId, // Added to populate TipoBecaId
          TipoBecaNombre: s.TipoBecaNombre || 'Sin tipo',
          EstadoNombre: s.EstadoNombre || 'Desconocido',
          FechaSolicitud: s.FechaSolicitud || new Date().toISOString(),
          PorcentajeProgreso: this.calcularProgresoSimulado(s.EstadoNombre)
        }));
        this.loading = false;
      }
    });
  }

  cargarDatosModal(): void {
    this.solicitudBecaService.getAllData().subscribe({
      next: (data) => {
        if (data.success) {
          this.tiposBeca = data.data?.tiposBeca?.map((b: any) => ({ Id: b.Id, Nombre: b.Nombre })) || [];
          this.periodosAcademicos = data.data?.periodosAcademicos || [];
          if (this.periodosAcademicos.length > 0 && !this.formData.PeriodoAcademicoId) {
            this.formData.PeriodoAcademicoId = this.periodosAcademicos[0].Id;
          }
        } else {
          this.error = `❌ Error cargando datos: ${data.error?.message || 'Desconocido'}`;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.error = `❌ Error cargando datos: ${err.message}`;
      }
    });
  }

  private calcularProgresoSimulado(estadoNombre: string | null): number {
    const estado = estadoNombre?.toLowerCase().trim() || 'desconocido';
    const progresoMap: { [key: string]: number } = {
      pendiente: 25,
      'en revisión': 50,
      aprobado: 100,
      rechazado: 100,
      ejecutado: 100,
      desconocido: 0
    };
    return progresoMap[estado] || 0;
  }

  getEstadoClass(estadoNombre: string): string {
    return estadoNombre?.toLowerCase().trim().replace(/\s+/g, '-') || 'desconocido';
  }

  formatearFecha(fechaString: string | null): string {
    if (!fechaString) return 'Fecha no disponible';
    const fecha = new Date(fechaString);
    return isNaN(fecha.getTime())
      ? 'Fecha inválida'
      : fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  abrirModal(): void {
    this.showModal = true;
    this.formData = {
      EstudianteId: this.formData.EstudianteId,
      TipoBecaId: this.tiposBeca.length > 0 ? this.tiposBeca[0].Id : 0,
      PeriodoAcademicoId: this.periodosAcademicos.length > 0 ? this.periodosAcademicos[0].Id : 0,
      Observaciones: '',
      FechaSolicitud: new Date().toISOString().split('T')[0],
      EstadoId: 1
    };
  }

  cerrarModal(): void {
    this.showModal = false;
  }

  solicitarBeca(): void {
    if (!this.formData.TipoBecaId || !this.formData.PeriodoAcademicoId) {
      this.error = '❌ Seleccione beca y período';
      return;
    }
    if (this.solicitudes.some(s => s.TipoBecaId === this.formData.TipoBecaId)) {
      this.error = `❌ Ya solicitaste esta beca`;
      return;
    }
    this.solicitudBecaService.createSolicitudBeca(this.formData).subscribe({
      next: () => {
        this.error = '';
        this.cerrarModal();
        this.cargarSolicitudes(this.formData.EstudianteId);
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.status === 409 ? `❌ Ya solicitaste esta beca` : `❌ Error: ${err.message}`;
      }
    });
  }

  trackBySolicitudId(index: number, item: SolicitudBecaViewModel): number {
    return item.Id;
  }
}