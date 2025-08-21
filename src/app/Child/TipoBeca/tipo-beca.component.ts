import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TipoBeca {
  Id?: number;
  Nombre: string;
  Descripcion?: string;
  Monto?: number;
  FechaRegistro?: string;
  FechaModificacion?: string;
  EstadoId?: number;
  MontoSemestre?: number;
  MontoCuatrimestre?: number;
  Requisitos?: number;
  SistemaAcademico?: string;
}

@Component({
  selector: 'app-tipo-beca',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tipo-beca.component.html',
  styleUrls: ['./tipo-beca.component.css']
})
export class TipoBecaComponent implements OnInit {
  tiposBeca: TipoBeca[] = [];
  filteredTiposBeca: TipoBeca[] = [];
  error: string = '';
  loading: boolean = false;

  showCreateModal: boolean = false;
  showEditModal: boolean = false;

  nuevoTipoBeca: TipoBeca = {
    Nombre: '',
    Descripcion: '',
    Monto: 0,
    EstadoId: 1,
    MontoSemestre: 0,
    MontoCuatrimestre: 0,
    Requisitos: 0,
    SistemaAcademico: ''
  };

  tipoBecaEdit: TipoBeca = {
    Id: 0,
    Nombre: '',
    Descripcion: '',
    Monto: 0,
    EstadoId: 1,
    MontoSemestre: 0,
    MontoCuatrimestre: 0,
    Requisitos: 0,
    SistemaAcademico: ''
  };

  searchTerm: string = '';
  filtroEstado: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarTiposBeca();
  }

  private cargarTiposBeca() {
    this.loading = true;
    this.error = '';

    this.tiposBeca = [
      {
        Id: 1,
        Nombre: 'Beca de Excelencia Académica',
        Descripcion: 'Beca destinada a estudiantes con promedio sobresaliente',
        Monto: 25000,
        MontoSemestre: 12500,
        MontoCuatrimestre: 6250,
        Requisitos: 5,
        SistemaAcademico: 'Semestral (6m), Cuatrimestral (4m)',
        EstadoId: 1
      },
      {
        Id: 2,
        Nombre: 'Beca Deportiva',
        Descripcion: 'Apoyo para estudiantes atletas destacados',
        Monto: 37500,
        MontoSemestre: 18750,
        MontoCuatrimestre: 9375,
        Requisitos: 4,
        SistemaAcademico: 'Semestral (6m)',
        EstadoId: 1
      },
      {
        Id: 3,
        Nombre: 'Beca de Transporte',
        Descripcion: 'Ayuda económica para gastos de transporte',
        Monto: 25000,
        MontoSemestre: 12500,
        MontoCuatrimestre: 6250,
        Requisitos: 4,
        SistemaAcademico: 'Semestral (6m), Cuatrimestral (4m)',
        EstadoId: 1
      }
    ];

    this.filteredTiposBeca = [...this.tiposBeca];
    this.loading = false;
  }

  filtrarTiposBeca() {
    let filtered = [...this.tiposBeca];
    const term = this.searchTerm.toLowerCase();
    if (term) {
      filtered = filtered.filter(e =>
        (e.Nombre ?? '').toLowerCase().includes(term) ||
        (e.Descripcion ?? '').toLowerCase().includes(term)
      );
    }
    if (this.filtroEstado) {
      filtered = filtered.filter(e => (e.EstadoId ?? 0).toString() === this.filtroEstado);
    }
    this.filteredTiposBeca = filtered;
  }

  abrirModalCrear() {
    this.showCreateModal = true;
    this.nuevoTipoBeca = {
      Nombre: '',
      Descripcion: '',
      Monto: 0,
      EstadoId: 1,
      MontoSemestre: 0,
      MontoCuatrimestre: 0,
      Requisitos: 0,
      SistemaAcademico: ''
    };
  }

  cerrarModalCrear() {
    this.showCreateModal = false;
  }

  editarTipoBeca(id: number) {
    const tipoBeca = this.tiposBeca.find(e => e.Id === id);
    if (tipoBeca) {
      this.tipoBecaEdit = { ...tipoBeca };
      this.showEditModal = true;
    }
  }

  cerrarModalEditar() {
    this.showEditModal = false;
  }

  crearTipoBeca() {
    if (!this.nuevoTipoBeca.Nombre || (this.nuevoTipoBeca.Monto ?? 0) <= 0) {
      this.error = 'Por favor complete todos los campos obligatorios';
      return;
    }

    this.loading = true;

    setTimeout(() => {
      const newTipoBeca: TipoBeca = {
        ...this.nuevoTipoBeca,
        Id: (this.tiposBeca.length ? Math.max(...this.tiposBeca.map(e => e.Id ?? 0)) : 0) + 1,
        FechaRegistro: new Date().toISOString().slice(0, 16),
        FechaModificacion: new Date().toISOString().slice(0, 16)
      };

      this.tiposBeca.push(newTipoBeca);
      this.filteredTiposBeca = [...this.tiposBeca];
      this.cerrarModalCrear();
      this.error = '';
      this.loading = false;
    }, 1000);
  }

  actualizarTipoBeca() {
    if (!this.tipoBecaEdit.Nombre || (this.tipoBecaEdit.Monto ?? 0) <= 0) {
      this.error = 'Por favor complete todos los campos obligatorios';
      return;
    }

    this.loading = true;

    setTimeout(() => {
      const index = this.tiposBeca.findIndex(e => e.Id === this.tipoBecaEdit.Id);
      if (index !== -1) {
        this.tiposBeca[index] = { ...this.tipoBecaEdit };
        this.filteredTiposBeca = [...this.tiposBeca];
      }

      this.cerrarModalEditar();
      this.error = '';
      this.loading = false;
    }, 1000);
  }

  eliminarTipoBeca(id: number) {
    if (!confirm('¿Está seguro de eliminar este tipo de beca?')) return;
    this.loading = true;
    setTimeout(() => {
      this.tiposBeca = this.tiposBeca.filter(e => e.Id !== id);
      this.filteredTiposBeca = [...this.tiposBeca];
      this.loading = false;
    }, 1000);
  }

  getEstadoNombre(id?: number): string {
    switch (id ?? 0) {
      case 1: return 'Activo';
      case 2: return 'Inactivo';
      default: return 'Desconocido';
    }
  }
}
