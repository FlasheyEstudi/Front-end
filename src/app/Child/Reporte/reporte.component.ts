import { Component, OnInit } from '@angular/core';
import { ReporteService } from '../../services/reporte.service';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.component.html',
})
export class ReporteComponent implements OnInit {
  totales: any;
  solicitudesPorEstado: any;

  constructor(private reporteService: ReporteService) {}

  ngOnInit(): void {
    this.cargarTotales();
    this.cargarSolicitudesPorEstado();
  }

  cargarTotales() {
    this.reporteService.getTotales().subscribe((data) => {
      this.totales = data[0]; // SP devuelve un array
    });
  }

  cargarSolicitudesPorEstado() {
    this.reporteService.getSolicitudesPorEstado().subscribe((data) => {
      this.solicitudesPorEstado = data;
    });
  }
}
