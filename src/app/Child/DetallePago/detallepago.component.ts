import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { DetallePagoService, DetallePago, SolicitudBecaLookup, TipoPagoLookup, EstadoLookup } from '../../services/detallepago.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-detalle-pago',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, HttpClientModule, DatePipe],
  templateUrl: './detallepago.component.html',
  styleUrls: ['./detallepago.component.css']
})
export class DetallePagoComponent implements OnInit {

  detallesDePago: DetallePago[] = [];
  filteredDetallesDePago: DetallePago[] = [];
  solicitudesBecaLookup: SolicitudBecaLookup[] = [];
  tiposPagoLookup: TipoPagoLookup[] = [];
  estadosLookup: EstadoLookup[] = [];

  nuevoDetallePago: Partial<DetallePago> = {
    SolicitudBecaId: undefined,
    TipoPagoId: undefined,
    Monto: undefined,
    FechaPago: undefined,
    Referencia: '',
    EstadoId: undefined
  };

  errorMsg: string = '';
  successMsg: string = '';
  searchTerm: string = '';

  editMode: boolean = false;
  detallePagoToEdit: DetallePago | null = null;
  loading: boolean = false;

  constructor(private detallePagoService: DetallePagoService) { }

  ngOnInit(): void {
    this.loadAllData();
  }

  // === Carga todos los datos usando forkJoin === //
  loadAllData() {
    this.clearMessages();
    this.loading = true;

    forkJoin({
      solicitudes: this.detallePagoService.getAllSolicitudBecasLookup().pipe(catchError(err => { console.error(err); return of([]); })),
      tiposPago: this.detallePagoService.getAllTipoPagosLookup().pipe(catchError(err => { console.error(err); return of([]); })),
      estados: this.detallePagoService.getAllEstadosLookup().pipe(catchError(err => { console.error(err); return of([]); })),
      detalles: this.detallePagoService.getAllDetallePagos().pipe(catchError(err => { console.error(err); return of([]); }))
    }).subscribe({
      next: ({ solicitudes, tiposPago, estados, detalles }) => {
        this.solicitudesBecaLookup = solicitudes;
        this.tiposPagoLookup = tiposPago;
        this.estadosLookup = estados;
        this.detallesDePago = detalles;
        this.filteredDetallesDePago = [...detalles];
        this.onSearch();
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error cargando todos los datos:', err);
        this.errorMsg = 'No se pudieron cargar los datos. Ver consola.';
        this.loading = false;
      }
    });
  }

  guardarDetallePago() {
    this.clearMessages();
    this.loading = true;

    if (!this.nuevoDetallePago.SolicitudBecaId || !this.nuevoDetallePago.TipoPagoId ||
        !this.nuevoDetallePago.Monto || !this.nuevoDetallePago.FechaPago || !this.nuevoDetallePago.EstadoId) {
      this.errorMsg = 'Por favor, complete todos los campos obligatorios.';
      this.loading = false;
      return;
    }

    const dataToSend = {
      SolicitudBecaId: this.nuevoDetallePago.SolicitudBecaId!,
      TipoPagoId: this.nuevoDetallePago.TipoPagoId!,
      Monto: Number(this.nuevoDetallePago.Monto),
      FechaPago: this.nuevoDetallePago.FechaPago!,
      Referencia: this.nuevoDetallePago.Referencia || '',
      EstadoId: this.nuevoDetallePago.EstadoId!
    };

    if (this.editMode && this.detallePagoToEdit?.Id) {
      this.detallePagoService.updateDetallePago(this.detallePagoToEdit.Id, dataToSend).subscribe({
        next: () => {
          this.successMsg = 'Detalle de Pago actualizado correctamente.';
          this.resetForm();
          this.loadAllData();
        },
        error: (err) => {
          console.error('Error actualizando Detalle de Pago:', err);
          this.errorMsg = err.error?.detalle || 'Error al actualizar Detalle de Pago.';
          this.loading = false;
        }
      });
    } else {
      this.detallePagoService.createDetallePago(dataToSend).subscribe({
        next: () => {
          this.successMsg = 'Detalle de Pago agregado correctamente.';
          this.resetForm();
          this.loadAllData();
        },
        error: (err) => {
          console.error('Error agregando Detalle de Pago:', err);
          this.errorMsg = err.error?.detalle || 'Error al agregar Detalle de Pago.';
          this.loading = false;
        }
      });
    }
  }

  deleteDetallePago(id: number | undefined) {
    if (!id) { this.errorMsg = 'ID no válido'; return; }
    if (!confirm('¿Eliminar este detalle de pago?')) return;

    this.clearMessages();
    this.loading = true;
    this.detallePagoService.deleteDetallePago(id).subscribe({
      next: () => this.loadAllData(),
      error: (err) => { console.error(err); this.errorMsg = 'Error al eliminar'; this.loading = false; }
    });
  }

  editDetallePago(detallePago: DetallePago) {
    this.editMode = true;
    this.detallePagoToEdit = { ...detallePago };
    this.nuevoDetallePago = { ...detallePago, FechaPago: detallePago.FechaPago ? new Date(detallePago.FechaPago).toISOString().substring(0,10) : undefined };
  }

  cancelEdit() { this.resetForm(); }

  resetForm() {
    this.nuevoDetallePago = { SolicitudBecaId: undefined, TipoPagoId: undefined, Monto: undefined, FechaPago: undefined, Referencia: '', EstadoId: undefined };
    this.editMode = false;
    this.detallePagoToEdit = null;
    this.clearMessages();
  }

  onSearch() {
    if (!this.searchTerm) { this.filteredDetallesDePago = [...this.detallesDePago]; return; }
    const term = this.searchTerm.toLowerCase();
    this.filteredDetallesDePago = this.detallesDePago.filter(d =>
      (d.Id?.toString() ?? '').includes(term) ||
      (d.SolicitudBecaReferencia ?? '').toLowerCase().includes(term) ||
      (d.TipoPagoNombre ?? '').toLowerCase().includes(term) ||
      (d.Referencia ?? '').toLowerCase().includes(term) ||
      (d.Estadonombre ?? '').toLowerCase().includes(term) ||
      (d.Monto?.toString() ?? '').includes(term) ||
      (d.FechaPago ?? '').toLowerCase().includes(term)
    );
  }

  clearMessages() { this.errorMsg = ''; this.successMsg = ''; }

  getSolicitudBecaReferencia(id: number | null | undefined): string {
    const s = this.solicitudesBecaLookup.find(s => s.Id === id);
    return s ? s.Referencia : 'N/A';
  }

  getTipoPagoNombre(id: number | null | undefined): string {
    const t = this.tiposPagoLookup.find(tp => tp.Id === id);
    return t ? t.Nombre : 'N/A';
  }

  getEstadoNombre(id: number | null | undefined): string {
    const e = this.estadosLookup.find(e => e.Id === id);
    return e ? e.Nombre : 'N/A';
  }
}
