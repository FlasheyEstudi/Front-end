// src/app/components/detallepago/detallepago.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  DetallePagoService,
  EstudianteBeneficiado,
  DetallePago,
  SolicitudBecaLookup,
  TipoPagoLookup,
  EstadoLookup,
  ControlPago,
  CalendarioPago,
  TransactionHistory,
  DashboardData
} from '../../services/detallepago.service';

@Component({
  selector: 'app-detalle-pago',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detallepago.component.html',
  styleUrls: ['./detallepago.component.css']
})
export class DetallePagoComponent implements OnInit {
  detallesDePago: DetallePago[] = [];
  filteredDetallesDePago: DetallePago[] = [];
  solicitudesBecaLookup: SolicitudBecaLookup[] = [];
  tiposPagoLookup: TipoPagoLookup[] = [];
  estadosLookup: EstadoLookup[] = [];
  estudiantesBeneficiados: EstudianteBeneficiado[] = [];
  controlDePagos: ControlPago[] = [];
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
  activeTab: string = 'control';
  dashboardData: DashboardData = {
    totalPagado: 0,
    totalPendiente: 0,
    beneficiariosActivos: 0,
    presupuestoTotal: 0
  };
  calendarioDePagos: CalendarioPago[] = [];
  historialTransacciones: TransactionHistory[] = [];
  showProcessPaymentModal = false;
  showDetailsModal = false;
  selectedStudentId: number | null = null;
  selectedSolicitudBecaId: number | null = null;
  selectedDetalle: DetallePago | null = null;
  montoAPagar = 0;
  fechaPago: string = '';
  metodoPago: string = '';

  constructor(private detallePagoService: DetallePagoService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData() {
    this.clearMessages();
    this.loading = true;
    console.log('[Component] Iniciando carga de datos principales...');
    this.detallePagoService.getAllData().subscribe({
      next: (data: {
        detalles: DetallePago[];
        solicitudes: SolicitudBecaLookup[];
        tiposPago: TipoPagoLookup[];
        estados: EstadoLookup[];
      }) => {
        console.log('[Component] Datos principales cargados:', data);
        if (data && Array.isArray(data.detalles)) {
          this.detallesDePago = data.detalles;
          this.filteredDetallesDePago = [...this.detallesDePago];
          this.solicitudesBecaLookup = data.solicitudes || [];
          this.tiposPagoLookup = data.tiposPago || [];
          this.estadosLookup = data.estados || [];
          this.loadDashboardData();
        } else {
          console.error('[Component] Formato de datos principales inesperado:', data);
          this.errorMsg = 'Error al cargar los datos principales: Formato de respuesta inesperado.';
          this.loading = false;
        }
      },
      error: (err: any) => {
        console.error('[Component] Error cargando datos principales:', err);
        this.errorMsg = 'Error al cargar los datos principales: ' + (err.message || 'Desconocido');
        this.loading = false;
      }
    });
  }

  loadDashboardData() {
    console.log('[Component] Cargando datos del dashboard...');
    this.loading = true;
    forkJoin({
      dashboard: this.detallePagoService.getDashboardSummary().pipe(
        catchError(err => {
          console.error('[Component] Error cargando resumen del dashboard:', err);
          return of({ totalPagado: 0, totalPendiente: 0, beneficiariosActivos: 0, presupuestoTotal: 0 });
        })
      ),
      controlPagos: this.detallePagoService.getControlDePagos().pipe(
        catchError(err => {
          console.error('[Component] Error cargando control de pagos:', err);
          return of([]);
        })
      ),
      historial: this.detallePagoService.getHistorialTransacciones().pipe(
        catchError(err => {
          console.error('[Component] Error cargando historial de transacciones:', err);
          return of([]);
        })
      ),
      calendario: this.detallePagoService.getCalendarioDePagos().pipe(
        catchError(err => {
          console.error('[Component] Error cargando calendario de pagos:', err);
          return of([]);
        })
      ),
      // *** MEJORA EN EL MANEJO DE ERRORES ***
      estudiantes: this.detallePagoService.getEstudiantesBeneficiados().pipe(
        catchError(err => {
          // Registrar el error completo para diagnóstico
          console.error('[Component] Error DETALLADO cargando estudiantes beneficiados:', err);
          // Verificar si `err` tiene más propiedades útiles
          let errorMsg = 'Desconocido';
          if (err && typeof err === 'object') {
            if (err.message) {
              errorMsg = err.message;
            } else if (err.error) {
              errorMsg = err.error;
            } else if (err.status) {
              errorMsg = `HTTP ${err.status}: ${err.statusText || 'Error'}`;
            }
            // Si es un objeto, intentar serializarlo parcialmente para ver su contenido
            try {
              errorMsg += ` (Detalles: ${JSON.stringify(err, Object.getOwnPropertyNames(err)).substring(0, 200)}...)`;
            } catch (e) {
              errorMsg += ` (No se pudo serializar el error)`;
            }
          } else if (err) {
            errorMsg = String(err);
          }
          this.errorMsg = 'No se pudieron cargar los estudiantes beneficiados: ' + errorMsg;
          console.log('[Component] Mensaje de error construido:', this.errorMsg); // Depuración
          return of([]); // Devolver un array vacío para que no falle el forkJoin
        })
      )
      // *** FIN MEJORA ***
    }).subscribe({
      next: (results) => {
        console.log('[Component] Datos del dashboard cargados en paralelo:', results);
        // Verificar específicamente los estudiantes
        console.log('[Component] Estudiantes beneficiados recibidos (RAW):', results.estudiantes);
        if (!Array.isArray(results.estudiantes)) {
           console.error('[Component] El resultado de estudiantes no es un array:', results.estudiantes);
           this.errorMsg = 'Datos de estudiantes recibidos en formato inesperado.';
           this.estudiantesBeneficiados = []; // Asegurar array vacío
        } else {
           this.estudiantesBeneficiados = results.estudiantes;
           console.log('[Component] Estudiantes beneficiados asignados al componente:', this.estudiantesBeneficiados.length, 'elementos');
        }
        this.dashboardData = results.dashboard;
        this.controlDePagos = results.controlPagos;
        this.historialTransacciones = results.historial;
        this.calendarioDePagos = results.calendario;
        // this.estudiantesBeneficiados = results.estudiantes; // Ya se asignó arriba
        this.loading = false;
        this.onSearch();
      },
      error: (err) => {
        console.error('[Component] Error inesperado en forkJoin:', err);
        this.errorMsg = 'Error inesperado cargando datos del dashboard: ' + (err.message || 'Desconocido');
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

    const dataToSend: any = {
      SolicitudBecaId: this.nuevoDetallePago.SolicitudBecaId!,
      TipoPagoId: this.nuevoDetallePago.TipoPagoId!,
      Monto: Number(this.nuevoDetallePago.Monto),
      FechaPago: this.nuevoDetallePago.FechaPago!,
      Referencia: this.nuevoDetallePago.Referencia || '',
      EstadoId: this.nuevoDetallePago.EstadoId!
    };

    if (this.editMode && this.detallePagoToEdit?.Id) {
      this.detallePagoService.update(this.detallePagoToEdit.Id, dataToSend).subscribe({
        next: (updatedData: any) => {
          this.successMsg = 'Detalle de Pago actualizado correctamente.';
          this.resetForm();
          this.loadAllData();
        },
        error: (err: any) => {
          console.error('[Component] Error actualizando Detalle de Pago:', err);
          this.errorMsg = 'Error al actualizar: ' + (err.message || 'Desconocido');
          this.loading = false;
        }
      });
    } else {
      this.detallePagoService.add(dataToSend).subscribe({
        next: (newData: any) => {
          this.successMsg = 'Detalle de Pago agregado correctamente.';
          this.resetForm();
          this.loadAllData();
        },
        error: (err: any) => {
          console.error('[Component] Error agregando Detalle de Pago:', err);
          this.errorMsg = 'Error al agregar: ' + (err.message || 'Desconocido');
          this.loading = false;
        }
      });
    }
  }

  deleteDetallePago(id: number | undefined) {
    if (!id) {
      this.errorMsg = 'ID no válido';
      return;
    }
    if (!confirm('¿Eliminar este detalle de pago?')) return;
    this.clearMessages();
    this.loading = true;
    this.detallePagoService.delete(id).subscribe({
      next: (deletedData: any) => {
        this.successMsg = deletedData?.mensaje || 'Detalle de Pago eliminado correctamente.';
        this.loadAllData();
      },
      error: (err: any) => {
        console.error('[Component] Error eliminando Detalle de Pago:', err);
        this.errorMsg = 'Error al eliminar: ' + (err.message || 'Desconocido');
        this.loading = false;
      }
    });
  }

  editDetallePago(detallePago: DetallePago) {
    this.editMode = true;
    this.detallePagoToEdit = { ...detallePago };
    let fechaString: string | undefined = undefined;
    if (detallePago.FechaPago !== null && detallePago.FechaPago !== undefined) {
      if (typeof detallePago.FechaPago === 'string' && detallePago.FechaPago.trim() !== '') {
        const dateObj = new Date(detallePago.FechaPago);
        if (!isNaN(dateObj.getTime())) {
          fechaString = dateObj.toISOString().substring(0, 10);
        } else {
          console.warn('[Component] FechaPago string no es una fecha válida:', detallePago.FechaPago);
        }
      }
    }
    this.nuevoDetallePago = {
      ...detallePago,
      FechaPago: fechaString
    };
  }

  cancelEdit() {
    this.resetForm();
  }

  resetForm() {
    this.nuevoDetallePago = {
      SolicitudBecaId: undefined,
      TipoPagoId: undefined,
      Monto: undefined,
      FechaPago: undefined,
      Referencia: '',
      EstadoId: undefined
    };
    this.editMode = false;
    this.detallePagoToEdit = null;
    this.clearMessages();
  }

  onSearch() {
    let filtered = [...this.detallesDePago];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        (d.SolicitudBecaReferencia ?? '').toLowerCase().includes(term) ||
        (d.TipoPagoNombre ?? '').toLowerCase().includes(term) ||
        (d.Monto?.toString() ?? '').includes(term) ||
        (d.Estadonombre ?? '').toLowerCase().includes(term)
      );
    }
    if (this.estadoFiltro) {
      filtered = filtered.filter(d => d.Estadonombre === this.estadoFiltro);
    }
    if (this.periodoFiltro) {
      filtered = filtered.filter(d => {
        if (d.FechaPago !== null && d.FechaPago !== undefined) {
          if (typeof d.FechaPago === 'string') {
            return d.FechaPago.includes(this.periodoFiltro);
          }
        }
        return false;
      });
    }
    this.filteredDetallesDePago = filtered;
  }

  onFilterChange() {
    this.onSearch();
  }

  clearMessages() {
    this.errorMsg = '';
    this.successMsg = '';
  }

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

  getInitialFromReference(ref: string | undefined | null): string {
    if (!ref) return '?';
    return ref.charAt(0).toUpperCase();
  }

  openProcessPaymentModal() {
    this.showProcessPaymentModal = true;
    this.selectedStudentId = null;
    this.selectedSolicitudBecaId = null;
    this.montoAPagar = 0;
    this.fechaPago = '';
    this.metodoPago = '';
  }

  closeProcessPaymentModal() {
    this.showProcessPaymentModal = false;
  }

  processPayment() {
    if (!this.selectedSolicitudBecaId || !this.montoAPagar || !this.fechaPago || !this.metodoPago) {
      this.errorMsg = 'Por favor complete todos los campos obligatorios';
      return;
    }
    this.clearMessages();
    this.loading = true;
    const data = {
      SolicitudBecaId: this.selectedSolicitudBecaId,
      TipoPagoId: this.tiposPagoLookup.find(tp => tp.Nombre === this.metodoPago)?.Id || 1,
      Monto: this.montoAPagar,
      FechaPago: this.fechaPago,
      Referencia: '',
      EstadoId: this.estadosLookup.find(e => e.Nombre === 'Pagado')?.Id || 1
    };
    this.detallePagoService.add(data).subscribe({
      next: (paymentData: any) => {
        this.successMsg = paymentData?.mensaje || 'Pago procesado correctamente';
        this.closeProcessPaymentModal();
        this.loadAllData();
      },
      error: (err: any) => {
        console.error('[Component] Error procesando pago:', err);
        this.errorMsg = 'Error al procesar el pago: ' + (err.message || 'Desconocido');
        this.loading = false;
      }
    });
  }

  onEstudianteChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      const estudianteId = +target.value;
      console.log('[Component] Estudiante seleccionado:', estudianteId); // Depuración
      if (!isNaN(estudianteId)) {
        const estudiante = this.estudiantesBeneficiados.find(e => e.EstudianteId === estudianteId);
        this.selectedSolicitudBecaId = estudiante ? estudiante.SolicitudBecaId : null;
        console.log('[Component] SolicitudBecaId asignada:', this.selectedSolicitudBecaId); // Depuración
      } else {
        this.selectedSolicitudBecaId = null;
      }
    }
  }

  openDetailsModal(detalle: DetallePago) {
    this.selectedDetalle = detalle;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
  }

  exportToPDF() {
    alert('Funcionalidad de exportación a PDF no implementada.');
  }
}
