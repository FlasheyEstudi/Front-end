import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { 
  ReporteService,
  ReporteTotales,
  ReporteSolicitudesPorEstado,
  ReporteFinancialData,
  ReporteStudentData,
  ReporteImpactData
} from '../../services/reporte.service';

interface PeriodoAcademicoLookup { Id: number; Nombre: string; AnioAcademico: string; }
interface EstadoLookup { Id: number; Nombre: string; }

@Component({
  selector: 'app-reporte',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './reporte.component.html',
  styleUrls: ['./reporte.component.css']
})
export class ReporteComponent implements OnInit {
  // === DATOS DE REPORTES === //
  totales: ReporteTotales = {
    TotalSolicitudes: 0,
    Pendientes: 0,
    Aprobadas: 0,
    Rechazadas: 0,
    PresupuestoTotal: 0
  };
  solicitudesPorEstado: ReporteSolicitudesPorEstado[] = [];
  financialData: ReporteFinancialData[] = [];
  studentsData: ReporteStudentData[] = [];
  impactData: ReporteImpactData[] = [];

  // === DATOS PARA FILTROS === //
  periodosAcademicosLookup: PeriodoAcademicoLookup[] = [];
  estadosLookup: EstadoLookup[] = [];

  // === ESTADOS DEL COMPONENTE === //
  error = '';
  loading = false;
  periodoAcademicoId?: number;
  estadoId?: number;
  activeTab: 'totales'|'solicitudes'|'financiero'|'estudiantes'|'impacto'|'resumen'|'por-estudiante' = 'resumen';
  
  selectedYear = new Date().getFullYear();
  searchTerm = '';
  selectedStudent: any = null;

  constructor(private reporteService: ReporteService) {}

  ngOnInit(): void { this.loadLookupsAndData(); }

  // === CARGA INICIAL DE LOOKUPS === //
  loadLookupsAndData(): void {
    this.loading = true;
    forkJoin({
      periodos: this.reporteService['http'].get<PeriodoAcademicoLookup[]>('http://localhost:3000/api-beca/periodoacademico').pipe(catchError(() => of([]))),
      estados: this.reporteService['http'].get<EstadoLookup[]>('http://localhost:3000/api-beca/estado').pipe(catchError(() => of([])))
    }).subscribe(({ periodos, estados }) => {
      this.periodosAcademicosLookup = periodos;
      this.estadosLookup = estados;
      this.cargarDatos();
    });
  }

  // === CARGA DE DATOS DEL REPORTE === //
  cargarDatos(): void {
    this.loading = true;
    forkJoin({
      totales: this.reporteService.getTotales(this.periodoAcademicoId, this.estadoId).pipe(catchError(() => of([this.totales]))),
      solicitudes: this.reporteService.getSolicitudesPorEstado(this.periodoAcademicoId).pipe(catchError(() => of([]))),
      financial: this.reporteService.getFinancialData(this.periodoAcademicoId, this.estadoId).pipe(catchError(() => of([]))),
      students: this.reporteService.getStudentData().pipe(catchError(() => of([]))),
      impact: this.reporteService.getImpactData().pipe(catchError(() => of([])))
    }).subscribe(({ totales, solicitudes, financial, students, impact }) => {
      this.totales = totales.length > 0 ? totales[0] : this.totales;
      this.solicitudesPorEstado = solicitudes;
      this.financialData = financial;
      this.studentsData = students;
      this.impactData = impact;
      this.loading = false;
    });
  }

  // === MÉTODOS DE ACCIÓN === //
  actualizarReportes(): void { this.cargarDatos(); }
  changeTab(tab: 'totales'|'solicitudes'|'financiero'|'estudiantes'|'impacto'|'resumen'|'por-estudiante'): void { this.activeTab = tab; }
  onFilterChange(): void { this.cargarDatos(); }
  exportReport(): void { alert('Funcionalidad de exportación no implementada.'); }
  onSearch(): void {}

  // === MÉTODOS AUXILIARES === //
  getPeriodoAcademicoNombre(id?: number | null): string {
    if (!id) return 'N/A';
    const periodo = this.periodosAcademicosLookup.find(pa => pa.Id === id);
    return periodo ? `${periodo.Nombre} (${periodo.AnioAcademico})` : 'Desconocido';
  }

  getEstadoNombre(id?: number | null): string {
    if (!id) return 'N/A';
    const estado = this.estadosLookup.find(est => est.Id === id);
    return estado ? estado.Nombre : 'Desconocido';
  }

  getPointPosition(index: number): number {
    if (this.financialData.length === 0) return 0;
    return this.financialData.length === 1 ? 50 : (index / (this.financialData.length - 1)) * 100;
  }

  getPointBottomPosition(value: number): number {
    if (this.financialData.length === 0) return 0;
    const maxValue = Math.max(...this.financialData.map(d => d.Ejecutado), 1);
    return (value / maxValue) * 100;
  }

  get lineChartPoints(): string {
    return this.financialData.map((d, i) => {
      const x = this.getPointPosition(i);
      const y = 100 - this.getPointBottomPosition(d.Ejecutado);
      return `${x},${y}`;
    }).join(' ');
  }

  getMaxFinancialValue(): number {
    if (this.financialData.length === 0) return 1;
    return Math.max(...this.financialData.map(d => d.Presupuesto), 1);
  }

  getBarHeight(value: number, max: number): string {
    return max === 0 ? '0%' : `${(value / max) * 100}%`;
  }

  getPieSliceTransform(index: number): string {
    const anglePerSlice = 360 / (this.impactData.length || 1);
    return `rotate(${index * anglePerSlice}deg)`;
  }

  getPieDashArray(i: ReporteImpactData): string {
    const totalBeneficiarios = this.impactData.reduce((a, b) => a + b.beneficiarios, 0);
    if (totalBeneficiarios === 0) return '0 251';
    const porcentaje = (i.beneficiarios / totalBeneficiarios) * 251;
    return `${porcentaje} 251`;
  }

  getLinePercentage(): number {
    if (!this.financialData.length) return 0;
    const last = this.financialData[this.financialData.length - 1];
    const maxValue = Math.max(...this.financialData.map(d => d.Ejecutado), 1);
    return (last.Ejecutado / maxValue) * 100;
  }
}
