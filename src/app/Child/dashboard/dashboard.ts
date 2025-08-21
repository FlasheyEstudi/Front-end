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

interface ActivityItem {
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
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

  recentActivities: ActivityItem[] = [];
  monthlyTrend: number[] = [];
  statusDistribution: number[] = [];
  tipoBecaData: any[] = [];
  loading: boolean = false;
  error: string = '';

  private baseUrl = 'http://localhost:3000/api-beca/solicitudes-beca';
  private kpiBaseUrl = 'http://localhost:3000/api-beca';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  ngAfterViewInit(): void {
    this.renderizarGraficos();
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
        this.cargarActividadReciente(),
        this.cargarDatosTipoBeca()
      ]);
    } catch (error) {
      this.handleError('Error al cargar datos del dashboard', error);
    } finally {
      this.loading = false;
    }
  }

  // ✅ KPIs corregidos
  async cargarDatosKPIs(): Promise<void> {
    try {
      const headers = this.getHeaders();

      // Estudiantes
      const estudiantesResponse = await this.http
        .get<any[]>(`${this.kpiBaseUrl}/estudiante`, { headers })
        .toPromise()
        .catch(() => []);

      const estudiantesCount = estudiantesResponse?.length ?? 0;

      // Becas disponibles (tipos de beca)
      const tiposResponse = await this.http
        .get<any[]>(`${this.kpiBaseUrl}/tipobeca`, { headers })
        .toPromise()
        .catch(() => []);

      const becasCount = tiposResponse?.length ?? 0;

      // Solicitudes pendientes
      const pendientesResponse = await this.http
        .get<{ count: number }>(`${this.baseUrl}/count?estadoId=1`, { headers })
        .toPromise()
        .catch(() => ({ count: 0 }));

      const pendientesCount = pendientesResponse?.count ?? 0;

      // Solicitudes aprobadas
      const aprobadasResponse = await this.http
        .get<{ count: number }>(`${this.baseUrl}/count?estadoId=2`, { headers })
        .toPromise()
        .catch(() => ({ count: 0 }));

      const aprobadasCount = aprobadasResponse?.count ?? 0;

      this.actualizarKPIs(estudiantesCount, becasCount, pendientesCount, aprobadasCount);

    } catch (error) {
      this.handleError('Error al cargar KPIs', error);
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

      const tendenciaPromise = this.http
        .get<{ data: number[] }>(`${this.baseUrl}/tendencia?months=6`, { headers })
        .toPromise()
        .catch(() => ({ data: [0, 0, 0, 0, 0, 0] }));

      const estadosPromise = this.http
        .get<{ data: number[] }>(`${this.baseUrl}/estadisticas/estados`, { headers })
        .toPromise()
        .catch(() => ({ data: [0, 0, 0, 0] }));

      const [tendencia, estados] = await Promise.all([tendenciaPromise, estadosPromise]);

      this.monthlyTrend = tendencia?.data ?? [0, 0, 0, 0, 0, 0];
      this.statusDistribution = estados?.data ?? [0, 0, 0, 0];
    } catch (error) {
      this.handleError('Error al cargar datos para gráficos', error);
    }
  }

  async cargarDatosTipoBeca(): Promise<void> {
    try {
      const headers = this.getHeaders();

      const tiposResponse = await this.http
        .get<any[]>(`${this.kpiBaseUrl}/tipobeca`, { headers })
        .toPromise()
        .catch(() => []);

      const tiposBeca = tiposResponse ?? [];

      const estadisticasPromises = tiposBeca.map(async (tipo: any) => {
        const totalPromise = this.http
          .get<{ count: number }>(`${this.baseUrl}/count?tipoBecaId=${tipo.id}`, { headers })
          .toPromise()
          .catch(() => ({ count: 0 }));

        const aprobadasPromise = this.http
          .get<{ count: number }>(`${this.baseUrl}/count?tipoBecaId=${tipo.id}&estadoId=2`, { headers })
          .toPromise()
          .catch(() => ({ count: 0 }));

        const [total, aprobadas] = await Promise.all([totalPromise, aprobadasPromise]);

        return {
          tipo: tipo.nombre,
          total: total?.count ?? 0,
          aprobadas: aprobadas?.count ?? 0
        };
      });

      this.tipoBecaData = await Promise.all(estadisticasPromises);
    } catch (error) {
      this.handleError('Error al cargar datos de tipo de beca', error);
    }
  }

  async cargarActividadReciente(): Promise<void> {
    try {
      const headers = this.getHeaders();

      const response = await this.http
        .get<any[]>(`${this.baseUrl}/recientes`, { headers })
        .toPromise()
        .catch(() => []);

      const actividades = response ?? [];

      this.recentActivities = actividades.slice(0, 4).map((item: any) => ({
        title: item.titulo || 'Nueva actividad',
        description: item.descripcion || 'Sin descripción',
        time: item.fecha ? new Date(item.fecha).toLocaleString('es-ES') : 'Hace poco',
        icon: item.tipo === 'solicitud' ? '⏰' : 
              item.tipo === 'aprobacion' ? '✅' : 
              item.tipo === 'registro' ? '👤' : '⭕',
        color: item.tipo === 'solicitud' ? 'red' : 
               item.tipo === 'aprobacion' ? 'green' : 
               item.tipo === 'registro' ? 'blue' : 'gray'
      }));
    } catch (error) {
      this.handleError('Error al cargar actividad reciente', error);
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
            label: 'Aprobadas',
            data: [140, 150, 160, 165, 170, 180],
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Solicitudes',
            data: [120, 130, 140, 150, 160, 170],
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
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // Solicitudes por tipo de beca
  if (document.getElementById('tipoBecaChart')) {
    new Chart('tipoBecaChart', {
      type: 'bar',
      data: {
        labels: ['Académica', 'Deportiva', 'Transporte'],
        datasets: [
          {
            label: 'Totales',
            data: [130, 70, 180],
            backgroundColor: '#2196F3',
            borderColor: '#1565C0',
            borderWidth: 1
          },
          {
            label: 'Aprobadas',
            data: [80, 40, 120],
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