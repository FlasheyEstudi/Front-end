import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';

interface KpiCard {
  label: string;
  value: number;
  delta: number;
  deltaType: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  kpis: KpiCard[] = [
    { label: 'Estudiantes Registrados', value: 0, delta: 0, deltaType: 'up', icon: '👥' },
    { label: 'Becas Disponibles', value: 0, delta: 0, deltaType: 'up', icon: '🎓' },
    { label: 'Solicitudes Pendientes', value: 0, delta: 0, deltaType: 'down', icon: '⏳' },
    { label: 'Solicitudes Aprobadas', value: 0, delta: 0, deltaType: 'up', icon: '✅' }
  ];

  monthlyTrend: number[] = [];
  statusDistribution: number[] = [];
  tipoBecaData: any[] = [];
  loading: boolean = false;
  error: string = '';

  private baseUrl = 'http://localhost:3000/api-beca/solicitudbeca';
  private kpiBaseUrl = 'http://localhost:3000/api-beca';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.renderizarGraficos(), 1000);
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  async cargarDatosDashboard(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      await Promise.all([
        this.cargarDatosKPIs(),
        this.cargarDatosGraficos(),
        this.cargarDatosTipoBeca()
      ]);
    } catch (error) {
      this.handleError('Error al cargar datos del dashboard', error);
    } finally {
      this.loading = false;
      setTimeout(() => this.renderizarGraficos(), 500);
    }
  }

  async cargarDatosKPIs(): Promise<void> {
    try {
      const headers = this.getHeaders();

      // Obtener todas las solicitudes con verificación de undefined
      const solicitudesResponse = await this.http
        .get<any[]>(this.baseUrl, { headers })
        .toPromise()
        .catch(() => []);

      const solicitudes = solicitudesResponse || [];

      // Contar por estados con verificación
      const aprobadas = solicitudes.filter((s: any) => s.EstadoNombre === 'Aprobado').length;
      const pendientes = solicitudes.filter((s: any) => s.EstadoNombre === 'Pendiente').length;

      // Obtener conteo de estudiantes
      const estudiantesCount = await this.obtenerConteoEstudiantes();

      // Obtener conteo de becas disponibles
      const becasCount = await this.obtenerConteoBecas();

      // Actualizar todos los KPIs
      this.actualizarKPIs(estudiantesCount, becasCount, pendientes, aprobadas);

    } catch (error) {
      this.handleError('Error al cargar KPIs', error);
    }
  }

  private async obtenerConteoEstudiantes(): Promise<number> {
    try {
      const headers = this.getHeaders();
      const response = await this.http
        .get<any[]>(`${this.kpiBaseUrl}/estudiante`, { headers })
        .toPromise()
        .catch(() => []);
      return response?.length || 0;
    } catch (error) {
      console.error('Error obteniendo estudiantes:', error);
      return 0;
    }
  }

  private async obtenerConteoBecas(): Promise<number> {
    try {
      const headers = this.getHeaders();
      const response = await this.http
        .get<any[]>(`${this.kpiBaseUrl}/tipobeca`, { headers })
        .toPromise()
        .catch(() => []);
      return response?.length || 0;
    } catch (error) {
      console.error('Error obteniendo becas:', error);
      return 0;
    }
  }

  private actualizarKPIs(estudiantes: number, becas: number, pendientes: number, aprobadas: number): void {
    this.kpis[0].value = estudiantes;
    this.kpis[1].value = becas;
    this.kpis[2].value = pendientes;
    this.kpis[3].value = aprobadas;
  }

  async cargarDatosGraficos(): Promise<void> {
    try {
      const headers = this.getHeaders();

      // Obtener todas las solicitudes para calcular tendencia con verificación
      const solicitudesResponse = await this.http
        .get<any[]>(this.baseUrl, { headers })
        .toPromise()
        .catch(() => []);

      const solicitudes = solicitudesResponse || [];

      // Simular datos de tendencia mensual (6 meses)
      this.monthlyTrend = [120, 130, 140, 150, 160, 170];

      // Calcular distribución de estados con verificación
      const aprobadas = solicitudes.filter((s: any) => s.EstadoNombre === 'Aprobado').length;
      const pendientes = solicitudes.filter((s: any) => s.EstadoNombre === 'Pendiente').length;
      const enRevision = solicitudes.filter((s: any) => s.EstadoNombre === 'En Proceso').length;
      const rechazadas = solicitudes.filter((s: any) => s.EstadoNombre === 'Rechazado').length;

      this.statusDistribution = [aprobadas, pendientes, enRevision, rechazadas];

    } catch (error) {
      console.error('Error cargando datos para gráficos:', error);
    }
  }

  async cargarDatosTipoBeca(): Promise<void> {
    try {
      const headers = this.getHeaders();

      const tiposResponse = await this.http
        .get<any[]>(`${this.kpiBaseUrl}/tipobeca`, { headers })
        .toPromise()
        .catch(() => []);

      const tiposBeca = tiposResponse || [];
      
      const solicitudesResponse = await this.http
        .get<any[]>(this.baseUrl, { headers })
        .toPromise()
        .catch(() => []);

      const solicitudes = solicitudesResponse || [];

      this.tipoBecaData = tiposBeca.map((tipo: any) => {
        const solicitudesTipo = solicitudes.filter((s: any) => s.TipoBecaId === tipo.Id);
        const aprobadasTipo = solicitudesTipo.filter((s: any) => s.EstadoNombre === 'Aprobado').length;
        
        return {
          tipo: tipo.Nombre || tipo.nombre,
          total: solicitudesTipo.length,
          aprobadas: aprobadasTipo
        };
      });

    } catch (error) {
      console.error('Error cargando datos de tipo de beca:', error);
    }
  }

  renderizarGraficos(): void {
    // Destruir gráficos existentes
    const trendChart = Chart.getChart('trendChart');
    if (trendChart) trendChart.destroy();

    const tipoBecaChart = Chart.getChart('tipoBecaChart');
    if (tipoBecaChart) tipoBecaChart.destroy();

    // Tendencia Mensual
    if (document.getElementById('trendChart')) {
      new Chart('trendChart', {
        type: 'line',
        data: {
          labels: this.obtenerUltimosMeses(6),
          datasets: [
            {
              label: 'Solicitudes',
              data: this.monthlyTrend,
              borderColor: '#2196F3',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              fill: true,
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    // Solicitudes por tipo de beca
    if (document.getElementById('tipoBecaChart') && this.tipoBecaData.length > 0) {
      const labels = this.tipoBecaData.map(item => item.tipo);
      const totalData = this.tipoBecaData.map(item => item.total);
      const aprobadasData = this.tipoBecaData.map(item => item.aprobadas);

      new Chart('tipoBecaChart', {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Totales',
              data: totalData,
              backgroundColor: '#2196F3',
              borderColor: '#1565C0',
              borderWidth: 1
            },
            {
              label: 'Aprobadas',
              data: aprobadasData,
              backgroundColor: '#4CAF50',
              borderColor: '#388E3C',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }
  }

  private obtenerUltimosMeses(cantidad: number): string[] {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const fecha = new Date();
    const resultado: string[] = [];
    for (let i = cantidad - 1; i >= 0; i--) {
      const d = new Date(fecha.getFullYear(), fecha.getMonth() - i, 1);
      resultado.push(meses[d.getMonth()] + ' ' + d.getFullYear().toString().slice(2));
    }
    return resultado;
  }

  private handleError(contexto: string, error: any): void {
    console.error(`${contexto}:`, error);
    this.error = `${contexto}. ${error?.message || 'Verifique su conexión'}`;
    if (error?.status === 404) this.error += ' (Recurso no encontrado)';
    else if (error?.status === 401) this.error += ' (No autorizado)';
  }

  getKpiClass(index: number): string {
    const colors = ['metal-blue', 'metal-green', 'metal-red', 'metal-purple'];
    return colors[index % colors.length];
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  actualizarDashboard(): void {
    this.cargarDatosDashboard();
  }
}