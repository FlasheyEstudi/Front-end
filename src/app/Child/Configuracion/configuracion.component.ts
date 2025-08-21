import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreaConocimientoComponent } from '../area-conocimiento/area-conocimiento.component';
import { CarreraComponent } from '../carrera/carrera.component';
import { RequisitoComponent } from '../requisito/requisito.component';
import { PeriodoAcademicoComponent } from '../periodo-academico/periodo-academico.component';
import { EstadoComponent } from '../estado/estado.component';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule,
    AreaConocimientoComponent,
    CarreraComponent,
    RequisitoComponent,
    PeriodoAcademicoComponent,
    EstadoComponent
  ],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent {
  activeSection: 'areas' | 'carreras' | 'requisitos' | 'periodos' | 'estados' = 'areas';

  setActiveSection(section: 'areas' | 'carreras' | 'requisitos' | 'periodos' | 'estados'): void {
    this.activeSection = section;
  }
}