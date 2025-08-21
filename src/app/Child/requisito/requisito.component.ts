import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequisitoService, Requisito } from '../../services/requisito.service';

@Component({
  selector: 'app-requisito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './requisito.component.html',
  styleUrls: ['./requisito.component.css']
})
export class RequisitoComponent implements OnInit {
  requisitos: Requisito[] = [];
  filteredRequisitos: Requisito[] = [];
  nuevoRequisito: Requisito = {
    Descripcion: '',
    Tipo: '',
    FechaRegistro: null,
    FechaModificacion: null
  };
  errorMsg: string = '';
  successMsg: string = '';
  searchTerm: string = '';
  editMode: boolean = false; // controla modal flotante
  requisitoToEdit: Requisito | null = null;

  constructor(private requisitoService: RequisitoService) {}

  ngOnInit(): void {
    this.loadRequisitos();
  }

  /** Cargar requisitos */
  loadRequisitos() {
    this.clearMessages();
    this.requisitoService.getAllRequisitos().subscribe({
      next: (data) => {
        this.requisitos = data;
        this.onSearch();
      },
      error: (err) => {
        console.error('Error cargando requisitos:', err);
        this.errorMsg = 'Error cargando requisitos. Verifica la consola para más detalles.';
      }
    });
  }

  /** Guardar o actualizar requisito */
  guardarRequisito() {
    this.clearMessages();

    if (!this.nuevoRequisito.Descripcion?.trim() || !this.nuevoRequisito.Tipo) {
      this.errorMsg = 'Debe llenar la Descripción y el Tipo.';
      return;
    }

    const dataToSend: Requisito = {
      Descripcion: this.nuevoRequisito.Descripcion,
      Tipo: this.nuevoRequisito.Tipo,
      FechaRegistro: this.nuevoRequisito.FechaRegistro || new Date().toISOString().substring(0, 10),
      FechaModificacion: this.editMode ? new Date().toISOString().substring(0, 10) : null
    };

    if (this.editMode && this.requisitoToEdit?.Id) {
      dataToSend.Id = this.requisitoToEdit.Id;
      this.requisitoService.updateRequisito(this.requisitoToEdit.Id, dataToSend).subscribe({
        next: () => {
          this.successMsg = 'Requisito actualizado correctamente.';
          this.resetForm();
          this.loadRequisitos();
        },
        error: (err) => {
          console.error('Error al actualizar requisito:', err);
          this.errorMsg = err.error?.detalle || 'Error al actualizar requisito.';
        }
      });
    } else {
      this.requisitoService.createRequisito(dataToSend).subscribe({
        next: () => {
          this.successMsg = 'Requisito agregado correctamente.';
          this.resetForm();
          this.loadRequisitos();
        },
        error: (err) => {
          console.error('Error al agregar requisito:', err);
          this.errorMsg = err.error?.detalle || 'Error al agregar requisito.';
        }
      });
    }
  }

  /** Editar requisito */
  editRequisito(requisito: Requisito) {
    this.clearMessages();
    this.editMode = true; // abrir modal
    this.requisitoToEdit = { ...requisito };
    this.nuevoRequisito = {
      ...requisito,
      FechaRegistro: requisito.FechaRegistro ? new Date(requisito.FechaRegistro).toISOString().substring(0, 10) : null,
      FechaModificacion: requisito.FechaModificacion ? new Date(requisito.FechaModificacion).toISOString().substring(0, 10) : null
    };
  }

  /** Eliminar requisito */
  deleteRequisito(id: number | undefined) {
    if (id === undefined) {
      this.errorMsg = 'ID de requisito no válido para eliminar.';
      return;
    }
    if (!confirm('¿Está seguro que desea eliminar este requisito? Esta acción es irreversible.')) return;

    this.clearMessages();
    this.requisitoService.deleteRequisito(id).subscribe({
      next: () => {
        this.successMsg = 'Requisito eliminado correctamente.';
        this.loadRequisitos();
      },
      error: (err) => {
        console.error('Error al eliminar requisito:', err);
        this.errorMsg = err.error?.detalle || 'Error eliminando requisito.';
      }
    });
  }

  /** Mostrar u ocultar modal */
  toggleForm() {
    this.editMode = !this.editMode;
    if (!this.editMode) this.resetForm();
  }

  /** Cancelar edición */
  cancelEdit() {
    this.editMode = false;
    this.resetForm();
  }

  /** Reset del formulario */
  resetForm() {
    this.nuevoRequisito = {
      Descripcion: '',
      Tipo: '',
      FechaRegistro: null,
      FechaModificacion: null
    };
    this.editMode = false;
    this.requisitoToEdit = null;
    this.clearMessages();
  }

  /** Filtrar requisitos por búsqueda */
  onSearch() {
    if (!this.searchTerm) {
      this.filteredRequisitos = [...this.requisitos];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredRequisitos = this.requisitos.filter(req =>
      (req.Descripcion ?? '').toLowerCase().includes(term) ||
      (req.Tipo ?? '').toLowerCase().includes(term) ||
      req.Id?.toString().includes(term)
    );
  }

  /** Limpiar mensajes */
  clearMessages() {
    this.errorMsg = '';
    this.successMsg = '';
  }

  /** Nombre amigable del tipo */
  getTipoNombre(tipo: string): string {
    switch (tipo) {
      case 'documento': return 'Documento';
      case 'informacion': return 'Información';
      case 'calificacion': return 'Calificación';
      default: return 'Desconocido';
    }
  }

  /** Cerrar modal con ESC */
  @HostListener('document:keydown.escape', ['$event'])
  onEscKeydown(event: KeyboardEvent) {
    if (this.editMode) this.cancelEdit();
  }
}
