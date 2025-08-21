import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import {
  ReporteService,
  ReporteTotales,
  ReporteSolicitudesPorEstado,
  ReporteFinancialData,
  ReporteStudentData,
  ReporteImpactData
} from '../../services/reporte.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface PeriodoAcademicoLookup {
  Id: number;
  Nombre: string;
  AnioAcademico: string;
}

interface EstadoLookup {
  Id: number;
  Nombre: string;
}

@Component({
  selector: 'app-reporte',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './reporte.component.html',
  styleUrls: ['./reporte.component.css']
})
export class ReporteComponent implements OnInit {
  // === DATOS DE REPORTES === //
  totales: ReporteTotales | null = null;
  solicitudesPorEstado: ReporteSolicitudesPorEstado[] = [];
  financialData: ReporteFinancialData[] = [];
  studentsData: ReporteStudentData[] = [];
  impactData: ReporteImpactData[] = [];

  // === DATOS PARA FILTROS (LOOKUPS) === //
  periodosAcademicosLookup: PeriodoAcademicoLookup[] = [];
  estadosLookup: EstadoLookup[] = [];

  // === ESTADOS DEL COMPONENTE === //
  error: string = '';
  loading: boolean = false;
  periodoAcademicoId: number | undefined;
  estadoId: number | undefined;
  activeTab: 'totales' | 'solicitudes' | 'financiero' | 'estudiantes' | 'impacto' | 'resumen' | 'por-estudiante' = 'resumen';
  
  // === NUEVAS PROPIEDADES PARA EL HTML === //
  selectedYear: number = new Date().getFullYear(); // Valor por defecto
  searchTerm: string = ''; // Para la búsqueda de estudiantes
  selectedStudent: any = null; // Para el detalle del estudiante

  constructor(private reporteService: ReporteService) { }

  ngOnInit(): void {
    console.log('[ReporteComponent] Inicializando...');
    this.loadLookupsAndData();
  }

  loadLookupsAndData(): void {
    this.loading = true;
    this.error = '';
    console.log('[ReporteComponent] Cargando lookups y datos iniciales...');

    forkJoin({
      periodos: this.reporteService['http'].get<PeriodoAcademicoLookup[]>('http://localhost:3000/api-beca/periodoacademico').pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('[ReporteComponent] Error cargando periodos:', err);
          return of([]);
        })
      ),
      estados: this.reporteService['http'].get<EstadoLookup[]>('http://localhost:3000/api-beca/estado').pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('[ReporteComponent] Error cargando estados:', err);
          return of([]);
        })
      )
    }).subscribe({
      next: ({ periodos, estados }) => {
        console.log('[ReporteComponent] Lookups cargados:', { periodos, estados });
        this.periodosAcademicosLookup = periodos;
        this.estadosLookup = estados;
        this.cargarDatos();
      },
      error: (err: HttpErrorResponse) => {
        const errorMsg = 'Error al cargar opciones de filtro: ' + (err.error?.message || err.message);
        console.error('[ReporteComponent]', errorMsg, err);
        this.error = errorMsg;
        this.loading = false;
        this.cargarDatos(); // Intenta cargar reportes aunque fallen lookups
      }
    });
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = '';
    console.log('[ReporteComponent] Iniciando carga paralela de todos los reportes...');

    forkJoin({
      totales: this.reporteService.getTotales(this.periodoAcademicoId, this.estadoId).pipe(
        catchError((err: HttpErrorResponse) => {
          const errorMsg = `Error al cargar totales: ${err.error?.message || err.message}`;
          console.error('[ReporteComponent]', errorMsg);
          this.error += (this.error ? '; ' : '') + errorMsg;
          return of([{ TotalSolicitudes: 0, Pendientes: 0, Aprobadas: 0, Rechazadas: 0 }]);
        })
      ),
      solicitudes: this.reporteService.getSolicitudesPorEstado(this.periodoAcademicoId).pipe(
        catchError((err: HttpErrorResponse) => {
          const errorMsg = `Error al cargar solicitudes por estado: ${err.error?.message || err.message}`;
          console.error('[ReporteComponent]', errorMsg);
          this.error += (this.error ? '; ' : '') + errorMsg;
          return of([]);
        })
      ),
      financial: this.reporteService.getFinancialData(this.periodoAcademicoId, this.estadoId).pipe(
        catchError((err: HttpErrorResponse) => {
          const errorMsg = `Error al cargar datos financieros: ${err.error?.message || err.message}`;
          console.error('[ReporteComponent]', errorMsg);
          this.error += (this.error ? '; ' : '') + errorMsg;
          return of([]);
        })
      ),
      students: this.reporteService.getStudentData().pipe(
        catchError((err: HttpErrorResponse) => {
          const errorMsg = `Error al cargar datos de estudiantes: ${err.error?.message || err.message}`;
          console.error('[ReporteComponent]', errorMsg);
          this.error += (this.error ? '; ' : '') + errorMsg;
          return of([]);
        })
      ),
      impact: this.reporteService.getImpactData().pipe(
        catchError((err: HttpErrorResponse) => {
          const errorMsg = `Error al cargar datos de impacto: ${err.error?.message || err.message}`;
          console.error('[ReporteComponent]', errorMsg);
          this.error += (this.error ? '; ' : '') + errorMsg;
          return of([]);
        })
      )
    }).subscribe({
      next: ({ totales, solicitudes, financial, students, impact }) => {
        console.log('[ReporteComponent] Todos los datos cargados exitosamente.');
        
        // === ASIGNACIÓN CORRECTA DE DATOS === //
        this.totales = totales && totales.length > 0 ? totales[0] : { 
          TotalSolicitudes: 0, 
          Pendientes: 0, 
          Aprobadas: 0, 
          Rechazadas: 0 
        };
        this.solicitudesPorEstado = solicitudes;
        this.financialData = financial;
        this.studentsData = students;
        this.impactData = impact;

        this.loading = false;
        if (this.error) {
          console.warn('[ReporteComponent] Algunos reportes con advertencias:', this.error);
        }
      },
      error: (err: HttpErrorResponse) => {
        const errorMsg = 'Error crítico en la carga de reportes: ' + (err.error?.message || err.message);
        console.error('[ReporteComponent] Error en forkJoin:', errorMsg, err);
        this.error = errorMsg;
        this.loading = false;
      }
    });
  }

  actualizarReportes(): void {
    console.log('[ReporteComponent] Usuario actualiza reportes.');
    this.cargarDatos();
  }

  changeTab(tab: 'totales' | 'solicitudes' | 'financiero' | 'estudiantes' | 'impacto' | 'resumen' | 'por-estudiante'): void {
    console.log(`[ReporteComponent] Cambiando a pestaña: ${tab}`);
    this.activeTab = tab;
  }

  // === MÉTODOS AGREGADOS PARA EL HTML === //

  onFilterChange(): void {
    console.log('[ReporteComponent] Filtros cambiaron. Recargando datos.');
    this.cargarDatos();
  }

  exportReport(): void {
    console.log('[ReporteComponent] Exportando reporte...');
    alert('Funcionalidad de exportación no implementada aún.');
  }

  onSearch(): void {
    console.log(`[ReporteComponent] Buscando estudiantes con término: "${this.searchTerm}"`);
  }

  // === MÉTODOS AUXILIARES PARA LA VISTA === //
  getPeriodoAcademicoNombre(id: number | null | undefined): string {
    if (id === null || id === undefined) return 'N/A';
    const periodo = this.periodosAcademicosLookup.find(pa => pa.Id === id);
    return periodo ? `${periodo.Nombre} (${periodo.AnioAcademico})` : 'Desconocido';
  }

  getEstadoNombre(id: number | null | undefined): string {
    if (id === null || id === undefined) return 'N/A';
    const estado = this.estadosLookup.find(est => est.Id === id);
    return estado ? estado.Nombre : 'Desconocido';
  }

  // === LÓGICA PARA GRÁFICOS === //
  getPointPosition(index: number): number {
    if (!this.financialData || this.financialData.length === 0) return 0;
    return this.financialData.length === 1 ? 50 : (index / (this.financialData.length - 1)) * 100;
  }

  getPointBottomPosition(value: number): number {
    if (!this.financialData || this.financialData.length === 0) return 0;
    const maxValue = Math.max(...this.financialData.map(d => d.Ejecutado), 1);
    return (value / maxValue) * 100;
  }

  get lineChartPoints(): string {
    if (!this.financialData || this.financialData.length === 0) return '';
    return this.financialData.map((d, i) => {
      const x = this.getPointPosition(i);
      const y = 100 - this.getPointBottomPosition(d.Ejecutado);
      return `${x},${y}`;
    }).join(' ');
  }

  getBarHeight(value: number, max: number): string {
    if (max === 0) return '0%';
    return `${(value / max) * 100}%`;
  }

  getMaxFinancialValue(): number {
    if (this.financialData.length === 0) return 1;
    return Math.max(...this.financialData.map(d => d.Presupuesto), 1);
  }

  getPieSliceTransform(index: number): string {
    const anglePerSlice = 360 / (this.impactData.length || 1);
    return `rotate(${index * anglePerSlice}deg)`;
  }
  
  getLinePercentage(): number {
    if (!this.financialData || this.financialData.length === 0) return 0;
    const lastIndex = this.financialData.length - 1;
    const lastPoint = this.financialData[lastIndex];
    const maxValue = Math.max(...this.financialData.map(d => d.Ejecutado), 1);
    return (lastPoint.Ejecutado / maxValue) * 100;
  }
  
  getPointPositionForLine(index: number): number {
    if (!this.financialData || this.financialData.length === 0) return 0;
    return this.financialData.length === 1 ? 50 : (index / (this.financialData.length - 1)) * 100;
  }
  
  getPointBottomPositionForLine(value: number): number {
    if (!this.financialData || this.financialData.length === 0) return 100;
    const maxValue = Math.max(...this.financialData.map(d => d.Ejecutado), 1);
    return (value / maxValue) * 100;
  }
}