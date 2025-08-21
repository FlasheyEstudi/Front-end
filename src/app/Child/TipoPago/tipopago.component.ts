import { Component, OnInit } from '@angular/core';   
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { TipoPagoService, TipoPago, EstadoLookup } from '../../services/tipopago.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-tipo-pago',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './tipopago.component.html',
  styleUrls: ['./tipopago.component.css']
})
export class TipoPagoComponent implements OnInit {

  tiposDePago: TipoPago[] = [];
  filteredTiposDePago: TipoPago[] = [];

  estadosLookup: EstadoLookup[] = [];

  nuevoTipoPago: Partial<TipoPago> = {
    Nombre: '',
    Descripcion: '',
    EstadoId: undefined
  };

  errorMsg: string = '';
  successMsg: string = '';
  searchTerm: string = '';

  editMode: boolean = false;
  tipoPagoToEdit: TipoPago | null = null;

  constructor(private tipoPagoService: TipoPagoService) { }

  ngOnInit(): void {
    this.loadLookupsAndData();
  }

  // ======= LOAD DATA ======= //
  loadLookupsAndData(): void {
    this.clearMessages();
    this.tipoPagoService.getAllEstadosLookup().pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error cargando estados para lookup:', err);
        this.errorMsg = 'Error cargando opciones de estado. ' + (err.error?.message || err.message);
        return of([]);
      })
    ).subscribe(estados => {
      this.estadosLookup = estados;
      this.loadTiposDePago();
    });
  }

  loadTiposDePago() {
    this.clearMessages();
    this.tipoPagoService.getAllTipoPagos().subscribe({
      next: (data) => {
        this.tiposDePago = data;
        this.onSearch();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error cargando tipos de pago:', err);
        this.errorMsg = 'Error cargando tipos de pago. Verifique la consola para más detalles.';
      }
    });
  }

  // ======= CRUD ======= //
  guardarTipoPago() {
    this.clearMessages();

    if (!this.nuevoTipoPago.Nombre || this.nuevoTipoPago.Nombre.trim() === '') {
      this.errorMsg = 'El nombre es requerido.';
      return;
    }
    if (!this.nuevoTipoPago.Descripcion) {
      this.errorMsg = 'La descripción es requerida.';
      return;
    }
    if (this.nuevoTipoPago.EstadoId === undefined || this.nuevoTipoPago.EstadoId === null) {
      this.errorMsg = 'Debe seleccionar un estado.';
      return;
    }

    const estadoId = Number(this.nuevoTipoPago.EstadoId);
    if (isNaN(estadoId) || estadoId <= 0) {
      this.errorMsg = 'El estado seleccionado no es válido.';
      return;
    }

    const dataToSend: Omit<TipoPago, 'Id' | 'Estadonombre'> = {
      Nombre: this.nuevoTipoPago.Nombre.trim(),
      Descripcion: this.nuevoTipoPago.Descripcion,
      EstadoId: estadoId
    };

    if (this.editMode && this.tipoPagoToEdit?.Id) {
      this.tipoPagoService.updateTipoPago(this.tipoPagoToEdit.Id, dataToSend).subscribe({
        next: () => {
          this.successMsg = 'Tipo de pago actualizado correctamente.';
          this.resetForm();
          this.loadTiposDePago();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error al actualizar Tipo de Pago:', err);
          this.errorMsg = err.error?.detalle || 'Error al actualizar Tipo de Pago.';
        }
      });
    } else {
      this.tipoPagoService.createTipoPago(dataToSend).subscribe({
        next: () => {
          this.successMsg = 'Tipo de pago agregado correctamente.';
          this.resetForm();
          this.loadTiposDePago();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error al agregar Tipo de Pago:', err);
          this.errorMsg = err.error?.detalle || 'Error al agregar Tipo de Pago.';
        }
      });
    }
  }

  deleteTipoPago(id: number | undefined) {
    if (!id || id <= 0) {
      this.errorMsg = 'ID de Tipo de Pago no válido para eliminar.';
      return;
    }
    if (!confirm('¿Está seguro que desea eliminar este Tipo de Pago?')) return;

    this.clearMessages();
    this.tipoPagoService.deleteTipoPago(id).subscribe({
      next: () => {
        this.successMsg = 'Tipo de pago eliminado correctamente.';
        this.loadTiposDePago();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al eliminar Tipo de Pago:', err);
        this.errorMsg = err.error?.detalle || 'Error eliminando Tipo de Pago. Puede estar en uso.';
      }
    });
  }

  editTipoPago(tipoPago: TipoPago) {
    this.clearMessages();
    this.editMode = true;
    this.tipoPagoToEdit = { ...tipoPago };
    this.nuevoTipoPago = { ...tipoPago };
  }

  cancelEdit() {
    this.resetForm();
  }

  resetForm() {
    this.nuevoTipoPago = { Nombre: '', Descripcion: '', EstadoId: undefined };
    this.editMode = false;
    this.tipoPagoToEdit = null;
    this.clearMessages();
  }

  clearMessages() {
    this.errorMsg = '';
    this.successMsg = '';
  }

  // ======= BÚSQUEDA ======= //
  onSearch() {
    if (!this.searchTerm) {
      this.filteredTiposDePago = [...this.tiposDePago];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredTiposDePago = this.tiposDePago.filter(tipo =>
      (tipo.Nombre ?? '').toLowerCase().includes(term) ||
      (tipo.Descripcion ?? '').toLowerCase().includes(term) ||
      tipo.Id?.toString().includes(term)
    );
  }

  getEstadoNombre(id: number | null | undefined): string {
    if (!id) return 'N/A';
    const estado = this.estadosLookup.find(e => e.Id === id);
    return estado ? estado.Nombre : 'Desconocido';
  }

  // ======= NUEVO MÉTODO PARA EL BOTÓN ======= //
  toggleForm() {
    if (this.editMode) {
      this.cancelEdit();
    } else {
      this.resetForm();
      this.editMode = true;
    }
  }
}
