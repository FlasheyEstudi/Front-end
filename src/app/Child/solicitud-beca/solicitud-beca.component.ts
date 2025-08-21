// src/app/Child/solicitud-beca/solicitud-beca.component.ts
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

  // Contadores para KPIs
  totalSolicitudes = 0;
  aprobadas = 0;
  enRevision = 0;
  pendientes = 0;
  rechazadas = 0;

  private apiUrl = 'http://localhost:3000/api-beca/solicitudbeca';

  constructor(private solicitudBecaService: SolicitudBecaService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  async cargarDatos() {
    try {
      const response = await this.solicitudBecaService.getAllData().toPromise();
      if (response && response.success && response.data) {
        const data = response.data;
        this.solicitudes = data.solicitudes || [];
        this.tiposBeca = data.tiposBeca || [];
        this.periodosAcademicos = data.periodosAcademicos || [];
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
      const matchesSearch = solicitud.EstudianteNombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
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