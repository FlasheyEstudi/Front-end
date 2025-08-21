import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { PeriodoAcademicoService, PeriodoAcademico } from '../../services/periodoacademico.service';

interface EstadoLookup {
  Id: number;
  Nombre: string;
}

@Component({
  selector: 'app-periodo-academico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './periodo-academico.component.html',
  styleUrls: ['./periodo-academico.component.css']
})
export class PeriodoAcademicoComponent implements OnInit {
  periodosAcademicos: PeriodoAcademico[] = [];
  filteredPeriodosAcademicos: PeriodoAcademico[] = [];
  estadosLookup: EstadoLookup[] = [];
  nuevoPeriodoAcademico: PeriodoAcademico = {
    Nombre: '',
    AnioAcademico: '',
    FechaInicio: null,
    FechaFin: null,
    FechaRegistro: null,
    FechaModificacion: null,
    EstadoId: null,
    Estadonombre: ''
  };
  errorMsg = '';
  successMsg = '';
  searchTerm = '';
  editMode = false;
  periodoAcademicoToEdit: PeriodoAcademico | null = null;

  constructor(private periodoAcademicoService: PeriodoAcademicoService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData() {
    this.clearMessages();
    forkJoin({
      periodosAcademicos: this.periodoAcademicoService.getAllPeriodoAcademicos(),
      estados: this.periodoAcademicoService.getAllEstadosLookup()
    }).subscribe({
      next: ({ periodosAcademicos, estados }) => {
        this.estadosLookup = estados;
        this.periodosAcademicos = periodosAcademicos.map(pa => ({
          ...pa,
          Estadonombre: estados.find(s => s.Id === pa.EstadoId)?.Nombre || 'Desconocido'
        }));
        this.onSearch();
      },
      error: (err) => {
        console.error('Error cargando datos iniciales:', err);
        this.errorMsg = 'Error cargando datos iniciales (periodos académicos o estados).';
      }
    });
  }

  guardarPeriodoAcademico() {
    this.clearMessages();

    if (!this.nuevoPeriodoAcademico.Nombre?.trim() || 
        !this.nuevoPeriodoAcademico.AnioAcademico?.trim() ||
        !this.nuevoPeriodoAcademico.FechaInicio ||
        !this.nuevoPeriodoAcademico.FechaFin ||
        this.nuevoPeriodoAcademico.EstadoId === null) {
      this.errorMsg = 'Debe llenar todos los campos obligatorios.';
      return;
    }

    const fechaInicio = new Date(this.nuevoPeriodoAcademico.FechaInicio);
    const fechaFin = new Date(this.nuevoPeriodoAcademico.FechaFin);
    if (fechaInicio > fechaFin) {
      this.errorMsg = 'La Fecha de Inicio no puede ser posterior a la Fecha de Fin.';
      return;
    }

    const dataToSend: PeriodoAcademico = {
      Nombre: this.nuevoPeriodoAcademico.Nombre,
      AnioAcademico: this.nuevoPeriodoAcademico.AnioAcademico,
      FechaInicio: this.nuevoPeriodoAcademico.FechaInicio,
      FechaFin: this.nuevoPeriodoAcademico.FechaFin,
      EstadoId: this.nuevoPeriodoAcademico.EstadoId,
      FechaRegistro: this.nuevoPeriodoAcademico.FechaRegistro || new Date().toISOString().substring(0, 10),
      FechaModificacion: this.editMode ? new Date().toISOString().substring(0, 10) : null,
      Estadonombre: this.estadosLookup.find(s => s.Id === this.nuevoPeriodoAcademico.EstadoId)?.Nombre || ''
    };

    if (this.editMode && this.periodoAcademicoToEdit?.Id) {
      dataToSend.Id = this.periodoAcademicoToEdit.Id;
      this.periodoAcademicoService.updatePeriodoAcademico(this.periodoAcademicoToEdit.Id, dataToSend).subscribe({
        next: () => {
          this.successMsg = 'Periodo Académico actualizado correctamente.';
          this.resetForm();
          this.loadAllData();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          this.errorMsg = err.error?.detalle || 'Error al actualizar.';
        }
      });
    } else {
      this.periodoAcademicoService.createPeriodoAcademico(dataToSend).subscribe({
        next: () => {
          this.successMsg = 'Periodo Académico agregado correctamente.';
          this.resetForm();
          this.loadAllData();
        },
        error: (err) => {
          console.error('Error al agregar:', err);
          this.errorMsg = err.error?.detalle || 'Error al agregar.';
        }
      });
    }
  }

  editPeriodoAcademico(pa: PeriodoAcademico) {
    this.clearMessages();
    this.editMode = true;
    this.periodoAcademicoToEdit = { ...pa };
    this.nuevoPeriodoAcademico = {
      ...pa,
      FechaInicio: pa.FechaInicio ? new Date(pa.FechaInicio).toISOString().substring(0, 10) : null,
      FechaFin: pa.FechaFin ? new Date(pa.FechaFin).toISOString().substring(0, 10) : null,
      FechaRegistro: pa.FechaRegistro ? new Date(pa.FechaRegistro).toISOString().substring(0, 10) : null,
      FechaModificacion: pa.FechaModificacion ? new Date(pa.FechaModificacion).toISOString().substring(0, 10) : null
    };
  }

  deletePeriodoAcademico(id?: number) {
    if (!id) { this.errorMsg = 'ID inválido.'; return; }
    if (!confirm('¿Está seguro que desea eliminar este período?')) return;

    this.clearMessages();
    this.periodoAcademicoService.deletePeriodoAcademico(id).subscribe({
      next: () => { this.successMsg = 'Periodo eliminado.'; this.loadAllData(); },
      error: (err) => { console.error(err); this.errorMsg = err.error?.detalle || 'Error eliminando período.'; }
    });
  }

  cancelEdit() { this.resetForm(); }

  resetForm() {
    this.nuevoPeriodoAcademico = {
      Nombre: '',
      AnioAcademico: '',
      FechaInicio: null,
      FechaFin: null,
      FechaRegistro: null,
      FechaModificacion: null,
      EstadoId: null,
      Estadonombre: ''
    };
    this.editMode = false;
    this.periodoAcademicoToEdit = null;
    this.clearMessages();
  }

  onSearch() {
    if (!this.searchTerm) { this.filteredPeriodosAcademicos = [...this.periodosAcademicos]; return; }
    const term = this.searchTerm.toLowerCase();
    this.filteredPeriodosAcademicos = this.periodosAcademicos.filter(pa =>
      (pa.Nombre ?? '').toLowerCase().includes(term) ||
      (pa.AnioAcademico ?? '').toLowerCase().includes(term) ||
      (pa.Estadonombre ?? '').toLowerCase().includes(term) ||
      pa.Id?.toString().includes(term)
    );
  }

  clearMessages() { this.errorMsg = ''; this.successMsg = ''; }

  toggleForm() { this.editMode = !this.editMode; if (!this.editMode) this.resetForm(); }

  formatDate(date: string | null): string {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscKeydown(event: KeyboardEvent) {
    if (this.editMode) this.cancelEdit();
  }
}
