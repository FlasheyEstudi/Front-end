import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudBecaService } from '../../services/solicitudbeca.service';

interface Solicitud {
  Id: number;
  EstudianteId: number;
  TipoBecaId: number;
  EstadoId: number;
  FechaSolicitud: string;
  PeriodoAcademicoId: number;
  Observaciones: string | null;
  Fecha_resultado: string | null;
  EstudianteNombre: string;
  EstudianteApellido: string;
  TipoBecaNombre: string;
  Estadonombre: string;
  PeriodoAcademicoNombre: string;
  PeriodoAnioAcademico: string;
}

interface BackendResponse {
  success: boolean;
  data: {
    solicitudes: Solicitud[];
    tiposBeca: any[];
    periodosAcademicos: any[];
  };
}

@Component({
  selector: 'app-solicitud-beca',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitud-beca.component.html',
  styleUrls: ['./solicitud-beca.component.css']
})
export class SolicitudBecaComponent implements OnInit {
  solicitudes: Solicitud[] = [];
  tiposBeca: any[] = [];
  periodosAcademicos: any[] = [];
  searchTerm = '';
  estadoFiltro = '';
  becaFiltro = '';
  periodoFiltro = '';
  totalSolicitudes = 0;
  aprobadas = 0;
  enRevision = 0;
  pendientes = 0;
  rechazadas = 0;

  constructor(private solicitudBecaService: SolicitudBecaService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  async cargarDatos() {
    try {
      const response = await this.solicitudBecaService.getAllData().toPromise() as BackendResponse;
      if (response && response.success && response.data) {
        this.solicitudes = response.data.solicitudes || [];
        this.tiposBeca = response.data.tiposBeca || [];
        this.periodosAcademicos = response.data.periodosAcademicos || [];
        this.totalSolicitudes = this.solicitudes.length;
        this.aprobadas = this.solicitudes.filter(s => s.Estadonombre === 'Aprobado').length;
        this.enRevision = this.solicitudes.filter(s => s.Estadonombre === 'En Proceso').length;
        this.pendientes = this.solicitudes.filter(s => s.Estadonombre === 'Pendiente').length;
        this.rechazadas = this.solicitudes.filter(s => s.Estadonombre === 'Rechazado').length;
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  }

  get filteredSolicitudes() {
    return this.solicitudes.filter(solicitud => {
      const matchesSearch =
        solicitud.EstudianteNombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        solicitud.EstudianteApellido.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesEstado = !this.estadoFiltro || solicitud.Estadonombre === this.estadoFiltro;
      const matchesBeca = !this.becaFiltro || solicitud.TipoBecaNombre === this.becaFiltro;
      const matchesPeriodo = !this.periodoFiltro || solicitud.PeriodoAcademicoNombre === this.periodoFiltro;
      return matchesSearch && matchesEstado && matchesBeca && matchesPeriodo;
    });
  }

  onSearch() {}

  onFilterChange() {}

  getStatusClass(estado: string): string {
    switch (estado) {
      case 'Aprobado': return 'approved';
      case 'En Proceso': return 'pending-review';
      case 'Pendiente': return 'pending';
      case 'Rechazado': return 'rejected';
      default: return 'default';
    }
  }

  getInitials(nombre: string): string {
    return nombre.charAt(0).toUpperCase();
  }

  verSolicitud(id: number) {
    console.log('Ver solicitud:', id);
  }
}
