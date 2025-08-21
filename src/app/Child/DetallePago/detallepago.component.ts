import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DetallePago {
  Id: number;
  SolicitudBecaId: number;
  TipoPagoId: number;
  Monto: number;
  FechaPago: string;
  Referencia: string;
  EstadoId: number;
  SolicitudBecaReferencia?: string;
  TipoPagoNombre?: string;
  Estadonombre?: string;
}

interface SolicitudBecaLookup {
  Id: number;
  Referencia: string;
}

interface TipoPagoLookup {
  Id: number;
  Nombre: string;
}

interface EstadoLookup {
  Id: number;
  Nombre: string;
}

interface ControlPago {
  Id: number;
  Beneficiario: string;
  Codigo: string;
  Beca: string;
  MontoTotal: number;
  Pagado: number;
  Restante: number;
  ProximoPago: string;
  Estado: string;
  EstaProgramado: boolean;
}

interface TransactionHistory {
  id: number;
  nombre: string;
  fecha: string;
  monto: number;
  metodo: string;
  estado: string;
}

@Component({
  selector: 'app-detalle-pago',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detallepago.component.html',
  styleUrls: ['./detallepago.component.css']
})
export class DetallePagoComponent implements OnInit {
  // === PROPIEDADES EXISTENTES === //
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
  estadoFiltro: string = '';
  periodoFiltro: string = '';
  editMode: boolean = false;
  detallePagoToEdit: DetallePago | null = null;
  loading: boolean = false;

  // === NUEVAS PROPIEDADES PARA EL DASHBOARD === //
  activeTab: string = 'control'; // 'control', 'calendar', 'history'
  dashboardData: any = {
    totalPagado: 0,
    totalPendiente: 0,
    beneficiariosActivos: 0,
    presupuestoTotal: 0
  };
  calendarioDePagos: any[] = [];
  historialTransacciones: TransactionHistory[] = [];
  
  // Modales
  showProcessPaymentModal = false;
  showDetailsModal = false;
  
  // Datos para modales
  selectedStudentId: number | null = null;
  selectedDetalle: DetallePago | null = null;
  montoAPagar = 0;
  fechaPago: string = '';
  metodoPago: string = '';

  private apiUrl = 'http://localhost:3000/api-beca/detallepago';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  // === CARGA TODOS LOS DATOS === //
  loadAllData() {
    this.clearMessages();
    this.loading = true;
    
    // Cargar datos principales
    this.http.get<DetallePago[]>(`${this.apiUrl}`)
      .subscribe({
        next: data => {
          this.detallesDePago = data || [];
          this.filteredDetallesDePago = [...data];
          this.onSearch();
          
          // Cargar lookup tables
          this.loadLookups();
        },
        error: err => {
          console.error('Error cargando detalles de pago:', err);
          this.loading = false;
        }
      });
  }

  loadLookups() {
    // Cargar solicitudes de beca
    this.http.get<SolicitudBecaLookup[]>(`${this.apiUrl}/solicitudes-beca`)
      .subscribe({
        next: data => {
          this.solicitudesBecaLookup = data || [];
        }
      });

    // Cargar tipos de pago
    this.http.get<TipoPagoLookup[]>(`${this.apiUrl}/tipos-pago`)
      .subscribe({
        next: data => {
          this.tiposPagoLookup = data || [];
        }
      });

    // Cargar estados
    this.http.get<EstadoLookup[]>(`${this.apiUrl}/estados`)
      .subscribe({
        next: data => {
          this.estadosLookup = data || [];
        }
      });

    // Cargar datos del dashboard
    this.loadDashboardData();
  }

  // === NUEVOS MÉTODOS PARA EL DASHBOARD === //
  loadDashboardData() {
    // Obtener datos del dashboard
    this.http.get<any>(`${this.apiUrl}/dashboard-summary`)
      .subscribe({
        next: (summary) => {
          this.dashboardData = summary;
        },
        error: (err) => {
          console.error('Error cargando resumen del dashboard:', err);
        }
      });

    // Obtener control de pagos
    this.http.get<ControlPago[]>(`${this.apiUrl}/control-pagos`)
      .subscribe({
        next: (control) => {
          // Convertir el array de control a tipo DetallePago para mantener compatibilidad
          this.filteredDetallesDePago = control.map(item => ({
            Id: item.Id,
            SolicitudBecaId: 0, // No aplicable
            TipoPagoId: 0, // No aplicable
            Monto: item.MontoTotal,
            FechaPago: item.ProximoPago,
            Referencia: '',
            EstadoId: 0, // No aplicable
            SolicitudBecaReferencia: item.Beneficiario,
            TipoPagoNombre: item.Beca,
            Estadonombre: item.Estado
          } as DetallePago));
        },
        error: (err) => {
          console.error('Error cargando control de pagos:', err);
        }
      });

    // Obtener historial de transacciones
    this.http.get<TransactionHistory[]>(`${this.apiUrl}/historial`)
      .subscribe({
        next: (history) => {
          this.historialTransacciones = history || [];
        },
        error: (err) => {
          console.error('Error cargando historial de transacciones:', err);
        }
      });
  }

  openProcessPaymentModal() {
    this.showProcessPaymentModal = true;
    this.selectedStudentId = null;
    this.montoAPagar = 0;
    this.fechaPago = '';
    this.metodoPago = '';
  }

  closeProcessPaymentModal() {
    this.showProcessPaymentModal = false;
  }

  processPayment() {
    if (!this.selectedStudentId || !this.montoAPagar || !this.fechaPago || !this.metodoPago) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    this.loading = true;
    
    const data = {
      SolicitudBecaId: this.selectedStudentId,
      TipoPagoId: 1,
      Monto: this.montoAPagar,
      FechaPago: this.fechaPago,
      Referencia: '',
      EstadoId: 1
    };

    this.http.post(`${this.apiUrl}/add`, data)
      .subscribe({
        next: () => {
          this.closeProcessPaymentModal();
          this.loadAllData();
          alert('Pago procesado correctamente');
        },
        error: err => {
          console.error('Error procesando pago:', err);
          alert('Error al procesar el pago');
          this.loading = false;
        }
      });
  }

  openDetailsModal(detalle: DetallePago) {
    this.selectedDetalle = detalle;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
  }

  // === MÉTODOS EXISTENTES MODIFICADOS === //
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
      this.http.put(`${this.apiUrl}/${this.detallePagoToEdit.Id}`, dataToSend)
        .subscribe({
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
      this.http.post(`${this.apiUrl}/add`, dataToSend)
        .subscribe({
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
    this.http.delete(`${this.apiUrl}/${id}`)
      .subscribe({
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

  onFilterChange() {
    this.onSearch();
  }

  clearMessages() { this.errorMsg = ''; this.successMsg = ''; }

  getSolicitudBecaReferencia(id: number | null | undefined): string {
    if (id === null || id === undefined) return 'N/A';
    const s = this.solicitudesBecaLookup.find(s => s.Id === id);
    return s ? s.Referencia : 'N/A';
  }

  getTipoPagoNombre(id: number | null | undefined): string {
    if (id === null || id === undefined) return 'N/A';
    const t = this.tiposPagoLookup.find(tp => tp.Id === id);
    return t ? t.Nombre : 'N/A';
  }

  getEstadoNombre(id: number | null | undefined): string {
    if (id === null || id === undefined) return 'N/A';
    const e = this.estadosLookup.find(e => e.Id === id);
    return e ? e.Nombre : 'N/A';
  }

  getInitialFromReference(ref: string): string {
    return ref ? ref.charAt(0).toUpperCase() : '';
  }
}