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
      next: (data) => this.estados = data,
      error: (err) => {
        console.error('Error cargando estados:', err);
        this.errorMsg = 'Error cargando estados. Verifique la consola para más detalles.';
      }
    });
  }

  guardarEstado() {
    this.clearMessages();

    if (!this.nuevoEstado.Nombre?.trim()) {
      this.errorMsg = 'El nombre del estado no puede estar vacío.';
      return;
    }
    if (!this.nuevoEstado.Color) {
      this.errorMsg = 'El color del estado no puede estar vacío.';
      return;
    }

    const dataToSend: Estado = {
      Nombre: this.nuevoEstado.Nombre,
      Color: this.nuevoEstado.Color,
      FechaRegistro: this.nuevoEstado.FechaRegistro || new Date().toISOString().substring(0, 10),
      FechaModificacion: this.editMode ? new Date().toISOString().substring(0, 10) : null
    };

    if (this.editMode && this.estadoToEdit?.Id) {
      dataToSend.Id = this.estadoToEdit.Id;
      this.estadoService.updateEstado(this.estadoToEdit.Id, dataToSend).subscribe({
        next: () => { this.successMsg = 'Estado actualizado correctamente.'; this.resetForm(); this.loadEstados(); },
        error: (err) => { console.error(err); this.errorMsg = err.error?.detalle || 'Error al actualizar estado.'; }
      });
    } else {
      this.estadoService.createEstado(dataToSend).subscribe({
        next: () => { this.successMsg = 'Estado agregado correctamente.'; this.resetForm(); this.loadEstados(); },
        error: (err) => { console.error(err); this.errorMsg = err.error?.detalle || 'Error al agregar estado.'; }
      });
    }
  }

  editEstado(estado: Estado) {
    this.clearMessages();
    this.editMode = true;
    this.estadoToEdit = { ...estado };
    this.nuevoEstado = {
      ...estado,
      FechaRegistro: estado.FechaRegistro ? new Date(estado.FechaRegistro).toISOString().substring(0, 10) : null,
      FechaModificacion: estado.FechaModificacion ? new Date(estado.FechaModificacion).toISOString().substring(0, 10) : null
    };
  }

  deleteEstado(id?: number) {
    if (!id) { this.errorMsg = 'ID inválido.'; return; }
    if (!confirm('¿Está seguro que desea eliminar este estado? Esta acción podría fallar si hay registros asociados.')) return;

    this.clearMessages();
    this.estadoService.deleteEstado(id).subscribe({
      next: () => { this.successMsg = 'Estado eliminado correctamente.'; this.loadEstados(); },
      error: (err) => { console.error(err); this.errorMsg = err.error?.detalle || 'Error eliminando estado.'; }
    });
  }

  toggleForm() { this.editMode = !this.editMode; if (!this.editMode) this.resetForm(); }
  cancelEdit() { this.resetForm(); }
  resetForm() { 
    this.nuevoEstado = { Nombre: '', Color: '#000000', FechaRegistro: null, FechaModificacion: null }; 
    this.editMode = false; this.estadoToEdit = null; this.clearMessages(); 
  }
  clearMessages() { this.errorMsg = ''; this.successMsg = ''; }

  @HostListener('document:keydown.escape', ['$event'])
  onEscKeydown(event: KeyboardEvent) {
    if (this.editMode) this.cancelEdit();
  }
}
