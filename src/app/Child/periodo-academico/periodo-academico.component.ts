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
    Codigo: '',
    Nombre: '',
    AnioAcademico: '',
    FechaInicio: '',
    FechaFin: '',
    EstadoId: null
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
        this.filteredPeriodosAcademicos = [...this.periodosAcademicos];
        console.log('Estados cargados:', this.estadosLookup); // Depuración
      },
      error: (err) => {
        console.error('Error cargando datos:', err);
        this.errorMsg = err.message || 'Error al cargar períodos o estados.';
      }
    });
  }

  guardarPeriodoAcademico() {
    this.clearMessages();
    console.log('Datos del formulario:', this.nuevoPeriodoAcademico); // Depuración

    // Validaciones
    if (!this.nuevoPeriodoAcademico.Codigo?.trim() ||
        !this.nuevoPeriodoAcademico.Nombre?.trim() ||
        !this.nuevoPeriodoAcademico.AnioAcademico?.trim() ||
        !this.nuevoPeriodoAcademico.FechaInicio ||
        !this.nuevoPeriodoAcademico.FechaFin ||
        this.nuevoPeriodoAcademico.EstadoId === null) {
      this.errorMsg = 'Todos los campos son obligatorios.';
      return;
    }

    if (this.nuevoPeriodoAcademico.Codigo.length > 50 || !/^[A-Za-z0-9\-]+$/.test(this.nuevoPeriodoAcademico.Codigo)) {
      this.errorMsg = 'El Código debe tener hasta 50 caracteres (letras, números, guiones).';
      return;
    }

    if (!/^\d{4}-[A-B]$/.test(this.nuevoPeriodoAcademico.AnioAcademico)) {
      this.errorMsg = 'El Año Académico debe tener el formato AAAA-A o AAAA-B.';
      return;
    }

    const fechaInicio = new Date(this.nuevoPeriodoAcademico.FechaInicio);
    const fechaFin = new Date(this.nuevoPeriodoAcademico.FechaFin);
    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      this.errorMsg = 'Formato de fecha inválido.';
      return;
    }
    if (fechaInicio > fechaFin) {
      this.errorMsg = 'La Fecha de Inicio no puede ser posterior a la Fecha de Fin.';
      return;
    }

    const dataToSend: PeriodoAcademico = {
      Codigo: this.nuevoPeriodoAcademico.Codigo.trim(),
      Nombre: this.nuevoPeriodoAcademico.Nombre.trim(),
      AnioAcademico: this.nuevoPeriodoAcademico.AnioAcademico.trim(),
      FechaInicio: fechaInicio.toISOString().split('T')[0], // YYYY-MM-DD
      FechaFin: fechaFin.toISOString().split('T')[0], // YYYY-MM-DD
      EstadoId: Number(this.nuevoPeriodoAcademico.EstadoId) // Asegurar número
    };

    console.log('Enviando al backend:', dataToSend); // Depuración

    if (this.editMode && this.periodoAcademicoToEdit?.Id) {
      dataToSend.Id = this.periodoAcademicoToEdit.Id;
      this.periodoAcademicoService.updatePeriodoAcademico(this.periodoAcademicoToEdit.Id, dataToSend).subscribe({
        next: (response) => {
          console.log('Respuesta de actualización:', response); // Depuración
          this.successMsg = 'Período actualizado correctamente.';
          this.resetForm();
          this.loadAllData();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          this.errorMsg = err.message || 'Error al actualizar el período.';
        }
      });
    } else {
      this.periodoAcademicoService.createPeriodoAcademico(dataToSend).subscribe({
        next: (response) => {
          console.log('Respuesta de creación:', response); // Depuración
          this.successMsg = 'Período creado correctamente.';
          this.resetForm();
          this.loadAllData();
        },
        error: (err) => {
          console.error('Error al crear:', err);
          this.errorMsg = err.message || 'Error al crear el período.';
        }
      });
    }
  }

  editPeriodoAcademico(pa: PeriodoAcademico) {
    this.clearMessages();
    this.editMode = true;
    this.periodoAcademicoToEdit = { ...pa };
    this.nuevoPeriodoAcademico = {
      Codigo: pa.Codigo || '',
      Nombre: pa.Nombre || '',
      AnioAcademico: pa.AnioAcademico || '',
      FechaInicio: pa.FechaInicio ? new Date(pa.FechaInicio).toISOString().split('T')[0] : '',
      FechaFin: pa.FechaFin ? new Date(pa.FechaFin).toISOString().split('T')[0] : '',
      EstadoId: pa.EstadoId ?? null,
      Estadonombre: pa.Estadonombre
    };
    console.log('Cargando período para editar:', this.nuevoPeriodoAcademico); // Depuración
  }

  deletePeriodoAcademico(id?: number) {
    if (!id) {
      this.errorMsg = 'ID inválido.';
      return;
    }
    if (!confirm('¿Seguro que desea eliminar este período?')) return;

    this.clearMessages();
    this.periodoAcademicoService.deletePeriodoAcademico(id).subscribe({
      next: () => {
        this.successMsg = 'Período eliminado correctamente.';
        this.loadAllData();
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        this.errorMsg = err.message || 'Error al eliminar el período.';
      }
    });
  }

  resetForm() {
    this.nuevoPeriodoAcademico = {
      Codigo: '',
      Nombre: '',
      AnioAcademico: '',
      FechaInicio: '',
      FechaFin: '',
      EstadoId: null
    };
    this.editMode = false;
    this.periodoAcademicoToEdit = null;
    this.clearMessages();
    console.log('Formulario reseteado, editMode:', this.editMode); // Depuración
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredPeriodosAcademicos = [...this.periodosAcademicos];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredPeriodosAcademicos = this.periodosAcademicos.filter(pa =>
      (pa.Codigo ?? '').toLowerCase().includes(term) ||
      (pa.Nombre ?? '').toLowerCase().includes(term) ||
      (pa.AnioAcademico ?? '').toLowerCase().includes(term) ||
      (pa.Estadonombre ?? '').toLowerCase().includes(term) ||
      pa.Id?.toString().includes(term)
    );
  }

  clearMessages() {
    this.errorMsg = '';
    this.successMsg = '';
  }

  toggleForm() {
    if (this.editMode) {
      this.resetForm();
    } else {
      this.editMode = true;
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscKeydown(event: KeyboardEvent) {
    if (this.editMode) {
      this.resetForm();
    }
  }
}