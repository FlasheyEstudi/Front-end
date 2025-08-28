import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadoService, Estado } from '../../services/estado.service';

@Component({
  selector: 'app-estado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estado.component.html',
  styleUrls: ['./estado.component.css']
})
export class EstadoComponent implements OnInit {
  estados: Estado[] = [];
  nuevoEstado: Estado = { Nombre: '', Color: '#000000', FechaRegistro: null, FechaModificacion: null };
  editMode = false;
  estadoToEdit: Estado | null = null;
  errorMsg = '';
  successMsg = '';

  constructor(private estadoService: EstadoService) {}

  ngOnInit(): void {
    this.loadEstados();
  }

  loadEstados() {
    this.clearMessages();
    this.estadoService.getAllEstados().subscribe({
      next: (data) => {
        this.estados = data;
        console.log('Estados cargados:', data); // Depuración
      },
      error: (err) => {
        console.error('Error cargando estados:', err);
        this.errorMsg = err.message || 'Error cargando estados.';
      }
    });
  }

  guardarEstado() {
    this.clearMessages();
    console.log('Datos del formulario:', this.nuevoEstado); // Depuración

    if (!this.nuevoEstado.Nombre?.trim()) {
      this.errorMsg = 'El nombre del estado no puede estar vacío.';
      return;
    }
    if (!this.nuevoEstado.Color || !/^#[0-9A-Fa-f]{6}$/.test(this.nuevoEstado.Color)) {
      this.errorMsg = 'El color debe ser un código hexadecimal válido (ej. #FF0000).';
      return;
    }

    const dataToSend: Estado = {
      Nombre: this.nuevoEstado.Nombre.trim(),
      Color: this.nuevoEstado.Color,
      FechaRegistro: this.editMode ? this.nuevoEstado.FechaRegistro : new Date().toISOString().split('T')[0],
      FechaModificacion: this.editMode ? new Date().toISOString().split('T')[0] : null
    };

    console.log('Enviando al backend:', dataToSend); // Depuración

    if (this.editMode && this.estadoToEdit?.Id) {
      dataToSend.Id = this.estadoToEdit.Id;
      this.estadoService.updateEstado(this.estadoToEdit.Id, dataToSend).subscribe({
        next: (response) => {
          console.log('Respuesta de actualización:', response); // Depuración
          this.successMsg = 'Estado actualizado correctamente.';
          this.resetForm();
          this.loadEstados();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          this.errorMsg = err.message || 'Error al actualizar estado.';
        }
      });
    } else {
      this.estadoService.createEstado(dataToSend).subscribe({
        next: (response) => {
          console.log('Respuesta de creación:', response); // Depuración
          this.successMsg = 'Estado creado correctamente.';
          this.resetForm();
          this.loadEstados();
        },
        error: (err) => {
          console.error('Error al crear:', err);
          this.errorMsg = err.message || 'Error al crear estado.';
        }
      });
    }
  }

  editEstado(estado: Estado) {
    this.clearMessages();
    this.editMode = true;
    this.estadoToEdit = { ...estado };
    this.nuevoEstado = {
      Nombre: estado.Nombre || '',
      Color: estado.Color || '#000000',
      FechaRegistro: estado.FechaRegistro ? new Date(estado.FechaRegistro).toISOString().split('T')[0] : null,
      FechaModificacion: estado.FechaModificacion ? new Date(estado.FechaModificacion).toISOString().split('T')[0] : null
    };
    console.log('Cargando estado para editar:', this.nuevoEstado); // Depuración
  }

  deleteEstado(id?: number) {
    if (!id) {
      this.errorMsg = 'ID inválido.';
      return;
    }
    if (!confirm('¿Seguro que desea eliminar este estado? Podría fallar si hay registros asociados.')) return;

    this.clearMessages();
    this.estadoService.deleteEstado(id).subscribe({
      next: () => {
        this.successMsg = 'Estado eliminado correctamente.';
        this.loadEstados();
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        this.errorMsg = err.message || 'Error al eliminar estado.';
      }
    });
  }

  toggleForm() {
    if (this.editMode) {
      this.resetForm();
    } else {
      this.editMode = true;
    }
  }

  resetForm() {
    this.nuevoEstado = { Nombre: '', Color: '#000000', FechaRegistro: null, FechaModificacion: null };
    this.editMode = false;
    this.estadoToEdit = null;
    this.clearMessages();
    console.log('Formulario reseteado, editMode:', this.editMode); // Depuración
  }

  clearMessages() {
    this.errorMsg = '';
    this.successMsg = '';
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscKeydown(event: KeyboardEvent) {
    if (this.editMode) {
      this.resetForm();
    }
  }
}