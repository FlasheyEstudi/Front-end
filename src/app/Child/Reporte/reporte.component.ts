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
  ReporteImpactData,
  PeriodoAcademicoLookup,
  EstadoLookup
} from '../../services/reporte.service';

// Importar librerías para PDF
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  filteredStudents: ReporteStudentData[] = [];

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
  selectedStudent: ReporteStudentData | null = null;

  constructor(private reporteService: ReporteService) {}

  ngOnInit(): void { 
    this.loadLookupsAndData(); 
  }

  // === CARGA INICIAL DE LOOKUPS === //
  loadLookupsAndData(): void {
    this.loading = true;
    this.error = '';
    forkJoin({
      periodos: this.reporteService.getPeriodosAcademicos().pipe(catchError(() => of([]))),
      estados: this.reporteService.getEstados().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ periodos, estados }) => {
        this.periodosAcademicosLookup = periodos;
        this.estadosLookup = estados;
        this.cargarDatos();
      },
      error: (err) => {
        this.error = 'Error al cargar los filtros. Intenta de nuevo.';
        this.loading = false;
        console.error('Error en loadLookupsAndData:', err);
      }
    });
  }

  // === CARGA DE DATOS DEL REPORTE === //
  cargarDatos(): void {
    this.loading = true;
    this.error = '';
    forkJoin({
      totales: this.reporteService.getTotales(this.periodoAcademicoId, this.estadoId).pipe(catchError(() => of([this.totales]))),
      solicitudes: this.reporteService.getSolicitudesPorEstado(this.periodoAcademicoId).pipe(catchError(() => of([]))),
      financial: this.reporteService.getFinancialData(this.periodoAcademicoId, this.estadoId).pipe(catchError(() => of([]))),
      students: this.reporteService.getStudentData().pipe(catchError(() => of([]))),
      impact: this.reporteService.getImpactData().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ totales, solicitudes, financial, students, impact }) => {
        this.totales = totales.length > 0 ? totales[0] : this.totales;
        this.solicitudesPorEstado = solicitudes;
        this.financialData = financial;
        this.studentsData = students;
        this.filteredStudents = students;
        this.impactData = impact;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los datos del reporte. Intenta de nuevo.';
        this.loading = false;
        console.error('Error en cargarDatos:', err);
      }
    });
  }

  // === MÉTODOS DE ACCIÓN === //
  actualizarReportes(): void { 
    this.cargarDatos(); 
  }
  
  changeTab(tab: 'totales'|'solicitudes'|'financiero'|'estudiantes'|'impacto'|'resumen'|'por-estudiante'): void { 
    this.activeTab = tab; 
  }
  
  onFilterChange(): void { 
    this.cargarDatos(); 
  }
  
  exportReport(): void { 
    this.exportToPDF();
  }
  
  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredStudents = this.studentsData;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredStudents = this.studentsData.filter(student => 
        student.Nombre.toLowerCase().includes(term) ||
        student.Apellidos.toLowerCase().includes(term) ||
        student.Carrera.toLowerCase().includes(term)
      );
    }
  }
  
  selectStudent(student: ReporteStudentData): void {
    this.selectedStudent = student;
  }

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

  // Método para obtener color de pie chart
  getPieColor(index: number): string {
    const colors = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0'];
    return colors[index % colors.length];
  }

  // Método para exportar a PDF
  exportToPDF(): void {
    // Crear un documento PDF
    const doc = new jsPDF.default('p', 'mm', 'a4');
    
    // Definir márgenes
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Agregar cabecera
    this.addHeader(doc, pageWidth, pageHeight, margin);
    
    // Agregar contenido del reporte
    this.addContent(doc, pageWidth, pageHeight, margin);
    
    // Guardar el PDF
    doc.save(`reporte_becas_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  // Método para agregar cabecera al PDF
  private addHeader(doc: jsPDF.default, pageWidth: number, pageHeight: number, margin: number): void {
    // Logo izquierda
    const logoX = margin;
    const logoY = margin;
    const logoWidth = 60;
    const logoHeight = 60;
    
    // Texto del logo
    doc.setFontSize(10);
    doc.setTextColor(0, 150, 136); // Color verde turquesa
    doc.text('UNIVERSIDAD NACIONAL', logoX + logoWidth + 10, logoY + 10);
    doc.text('MULTIDISCIPLINARIA', logoX + logoWidth + 10, logoY + 20);
    doc.text('RICARDO MORALES AVILÉS', logoX + logoWidth + 10, logoY + 30);
    doc.text('CIENCIAS DE LA SALUD', logoX + logoWidth + 10, logoY + 40);
    
    // Logo derecho
    const logoRightX = pageWidth - 120;
    const logoRightY = margin;
    const logoRightWidth = 100;
    const logoRightHeight = 40;
    
    // Texto del logo derecho
    doc.setFontSize(20);
    doc.setTextColor(0, 150, 136);
    doc.text('2025', logoRightX + 10, logoRightY + 15);
    doc.setFontSize(12);
    doc.text('"Fortalecimiento Institucional"', logoRightX + 10, logoRightY + 30);
    doc.setFontSize(8);
    doc.text('por más Victorias Educativas"', logoRightX + 10, logoRightY + 40);
    
    // Información inferior
    const bottomInfoX = margin;
    const bottomInfoY = pageHeight - 20;
    
    // Dirección
    doc.setFontSize(8);
    doc.setTextColor(0, 150, 136);
    doc.text('Del Hospital Salud Integral, 2 cuadras al Oeste, 1/2 al Sur, Las Palmas. Managua, Nicaragua.', bottomInfoX + 10, bottomInfoY);
    
    // Web
    doc.text('www.unm.edu.ni', bottomInfoX + 150, bottomInfoY);
    
    // Línea decorativa
    doc.setFillColor(0, 150, 136);
    doc.rect(bottomInfoX, bottomInfoY + 5, pageWidth - 2 * margin, 5, 'F');
    
    // Silueta de personaje
    const silhouetteX = pageWidth - 80;
    const silhouetteY = pageHeight - 120;
    const silhouetteWidth = 60;
    const silhouetteHeight = 80;
    
    // Dibujar silueta (simplificada)
    doc.setFillColor(0, 150, 136);
    doc.rect(silhouetteX, silhouetteY, silhouetteWidth, silhouetteHeight, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(silhouetteX + 5, silhouetteY + 10, 50, 60, 'F');
    doc.setFillColor(0, 150, 136);
    doc.rect(silhouetteX + 5, silhouetteY + 10, 50, 60, 'F');
  }

  // Método para agregar contenido del reporte al PDF
  private addContent(doc: jsPDF.default, pageWidth: number, pageHeight: number, margin: number): void {
    // Calcular posición inicial del contenido
    const contentStartY = 80;
    const sectionMargin = 10;
    
    // Agregar título principal
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('REPORTE DE BECAS', margin, contentStartY);
    
    // Agregar subtítulo
    doc.setFontSize(10);
    doc.setTextColor(0, 150, 136);
    doc.text('Resumen y detalles de solicitudes, finanzas y estudiantes', margin, contentStartY + 10);
    
    // Agregar fecha actual
    const today = new Date();
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha: ${today.toLocaleDateString()}`, pageWidth - 100, contentStartY + 10);
    
    // Agregar filtro de periodo académico
    const periodoNombre = this.getPeriodoAcademicoNombre(this.periodoAcademicoId);
    doc.text(`Periodo Académico: ${periodoNombre}`, margin, contentStartY + 20);
    
    // Agregar filtro de estado
    const estadoNombre = this.getEstadoNombre(this.estadoId);
    doc.text(`Estado: ${estadoNombre}`, margin, contentStartY + 30);
    
    // Agregar métricas principales
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Métricas Principales:', margin, contentStartY + 40);
    
    // Calcular posición para métricas
    const metricsY = contentStartY + 50;
    const metricsX = margin;
    const metricsSpacing = 100;
    
    doc.setFontSize(10);
    doc.text('Total Solicitudes:', metricsX, metricsY);
    doc.text(`${this.totales.TotalSolicitudes}`, metricsX + 100, metricsY);
    
    doc.text('Pendientes:', metricsX, metricsY + 10);
    doc.text(`${this.totales.Pendientes}`, metricsX + 100, metricsY + 10);
    
    doc.text('Aprobadas:', metricsX, metricsY + 20);
    doc.text(`${this.totales.Aprobadas}`, metricsX + 100, metricsY + 20);
    
    doc.text('Rechazadas:', metricsX, metricsY + 30);
    doc.text(`${this.totales.Rechazadas}`, metricsX + 100, metricsY + 30);
    
    doc.text('Presupuesto Total:', metricsX, metricsY + 40);
    doc.text(`${this.totales.PresupuestoTotal}`, metricsX + 100, metricsY + 40);
    
    // Agregar tabla de solicitudes por estado
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Solicitudes por Estado:', margin, metricsY + 60);
    
    // Tabla
    const tableStartY = metricsY + 70;
    const tableX = margin;
    const colWidth = 60;
    const rowHeight = 10;
    
    // Encabezados
    doc.setFontSize(10);
    doc.setTextColor(0, 150, 136);
    doc.text('Estado', tableX, tableStartY);
    doc.text('Cantidad', tableX + colWidth, tableStartY);
    
    // Datos
    doc.setTextColor(0, 0, 0);
    let currentY = tableStartY + rowHeight;
    for (const item of this.solicitudesPorEstado) {
      doc.text(item.Estado, tableX, currentY);
      doc.text(item.Cantidad.toString(), tableX + colWidth, currentY);
      currentY += rowHeight;
    }
    
    // Agregar gráfico financiero (como texto descriptivo)
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Datos Financieros:', margin, currentY + 10);
    
    // Mostrar información financiera
    const financialStartY = currentY + 20;
    const financialX = margin;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 150, 136);
    doc.text('Mes', financialX, financialStartY);
    doc.text('Presupuesto', financialX + 40, financialStartY);
    doc.text('Ejecutado', financialX + 100, financialStartY);
    doc.text('Pendiente', financialX + 160, financialStartY);
    
    // Datos financieros
    doc.setTextColor(0, 0, 0);
    let financialY = financialStartY + 10;
    for (const item of this.financialData) {
      doc.text(item.Mes, financialX, financialY);
      doc.text(item.Presupuesto.toString(), financialX + 40, financialY);
      doc.text(item.Ejecutado.toString(), financialX + 100, financialY);
      doc.text(item.Pendiente.toString(), financialX + 160, financialY);
      financialY += 10;
    }
    
    // Agregar tabla de estudiantes
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Estudiantes:', margin, financialY + 10);
    
    // Tabla de estudiantes
    const studentsStartY = financialY + 20;
    const studentsX = margin;
    const studentsColWidth = 40;
    
    // Encabezados
    doc.setFontSize(10);
    doc.setTextColor(0, 150, 136);
    doc.text('Nombre', studentsX, studentsStartY);
    doc.text('Apellidos', studentsX + studentsColWidth, studentsStartY);
    doc.text('Carrera', studentsX + 2 * studentsColWidth, studentsStartY);
    doc.text('Becas', studentsX + 3 * studentsColWidth, studentsStartY);
    doc.text('Monto Total', studentsX + 4 * studentsColWidth, studentsStartY);
    
    // Datos de estudiantes
    doc.setTextColor(0, 0, 0);
    let studentsY = studentsStartY + 10;
    for (const item of this.studentsData.slice(0, 5)) { // Limitar a 5 estudiantes para evitar exceso
      doc.text(item.Nombre, studentsX, studentsY);
      doc.text(item.Apellidos, studentsX + studentsColWidth, studentsY);
      doc.text(item.Carrera, studentsX + 2 * studentsColWidth, studentsY);
      doc.text(item.becas.toString(), studentsX + 3 * studentsColWidth, studentsY);
      doc.text(item.MontoTotal.toString(), studentsX + 4 * studentsColWidth, studentsY);
      studentsY += 10;
    }
    
    // Agregar tabla de impacto
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Impacto de Becas:', margin, studentsY + 10);
    
    // Tabla de impacto
    const impactStartY = studentsY + 20;
    const impactX = margin;
    const impactColWidth = 40;
    
    // Encabezados
    doc.setFontSize(10);
    doc.setTextColor(0, 150, 136);
    doc.text('Carrera', impactX, impactStartY);
    doc.text('Beneficiarios', impactX + impactColWidth, impactStartY);
    doc.text('Promedio', impactX + 2 * impactColWidth, impactStartY);
    doc.text('Graduados', impactX + 3 * impactColWidth, impactStartY);
    doc.text('Tasa Retención', impactX + 4 * impactColWidth, impactStartY);
    
    // Datos de impacto
    doc.setTextColor(0, 0, 0);
    let impactY = impactStartY + 10;
    for (const item of this.impactData) {
      doc.text(item.carrera, impactX, impactY);
      doc.text(item.beneficiarios.toString(), impactX + impactColWidth, impactY);
      doc.text(item.promedio.toString(), impactX + 2 * impactColWidth, impactY);
      doc.text(item.graduados.toString(), impactX + 3 * impactColWidth, impactY);
      doc.text(`${item.tasaRetencion}%`, impactX + 4 * impactColWidth, impactY);
      impactY += 10;
    }
  }
}