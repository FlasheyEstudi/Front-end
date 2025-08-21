// src/app/Child/solicitud-beca/solicitud-beca.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SolicitudBecaService } from '../../services/solicitudbeca.service';

@Component({
  selector: 'app-solicitud-beca',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './solicitud-beca.component.html',
  styleUrls: ['./solicitud-beca.component.css']
})
export class SolicitudBecaComponent implements OnInit {
  // Datos para selects
  estudiantes: any[] = [];
  tiposBeca: any[] = [];
  estados: any[] = [];
  periodosAcademicos: any[] = [];

  // Modelo del formulario
  solicitud = {
    EstudianteId: null,
    TipoBecaId: null,
    EstadoId: 1,
    FechaSolicitud: new Date().toISOString().split('T')[0],
    PeriodoAcademicoId: null,
    Observaciones: '',
    Fecha_resultado: null
  };

  // Estados del componente
  isLoading = false;
  isSuccess = false;
  isError = false;
  message = '';

  constructor(private solicitudService: SolicitudBecaService) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  async cargarDatosIniciales() {
    this.isLoading = true;
    this.limpiarMensajes();
    
    console.log('=== INICIANDO CARGA DE DATOS ===');
    
    try {
      // Usar el nuevo endpoint que trae todos los datos juntos
      const response = await this.solicitudService.getAllData().toPromise();
      
      console.log('Respuesta del backend:', response);
      
      if (response && response.success) {
        // Extraer datos de la respuesta
        const data = response.data;
        
        this.estudiantes = data.estudiantes || [];
        this.tiposBeca = data.tiposBeca || [];
        this.estados = data.estados || [];
        this.periodosAcademicos = data.periodosAcademicos || [];
        
        console.log('Datos cargados:', {
          estudiantes: this.estudiantes.length,
          tiposBeca: this.tiposBeca.length,
          estados: this.estados.length,
          periodosAcademicos: this.periodosAcademicos.length
        });
        
        // Establecer periodo académico por defecto
        if (this.periodosAcademicos.length > 0 && !this.solicitud.PeriodoAcademicoId) {
          this.solicitud.PeriodoAcademicoId = this.periodosAcademicos[0].Id;
          console.log('Periodo por defecto establecido:', this.solicitud.PeriodoAcademicoId);
        }
        
        this.mostrarExito('Datos cargados exitosamente');
      } else {
        throw new Error(response?.error || 'Respuesta inválida del servidor');
      }

    } catch (error: any) {
      console.error('=== ERROR DETALLADO ===');
      console.error('Error completo:', error);
      
      const errorMessage = error.error?.message || 
                           error.message || 
                           error.statusText || 
                           'Error desconocido al cargar datos';
      
      this.mostrarError(`Error cargando datos iniciales: ${errorMessage}`);
      
      // Logging adicional para debugging
      if (error.status) {
        console.error('Status HTTP:', error.status);
      }
      if (error.headers) {
        console.error('Headers:', error.headers.keys());
      }
      
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit() {
    if (!this.validarFormulario()) {
      return;
    }

    this.isLoading = true;
    this.limpiarMensajes();

    try {
      const datosEnviar = {
        EstudianteId: this.solicitud.EstudianteId,
        TipoBecaId: this.solicitud.TipoBecaId,
        EstadoId: this.solicitud.EstadoId,
        FechaSolicitud: this.solicitud.FechaSolicitud,
        PeriodoAcademicoId: this.solicitud.PeriodoAcademicoId,
        Observaciones: this.solicitud.Observaciones || '',
        Fecha_resultado: this.solicitud.Fecha_resultado || null
      };

      await this.solicitudService.createSolicitudBeca(datosEnviar).toPromise();
      
      this.mostrarExito('Solicitud de beca creada exitosamente');
      this.resetForm();
      
      // Recargar datos para actualizar listas
      setTimeout(() => this.cargarDatosIniciales(), 1500);

    } catch (error: any) {
      const errorMessage = error.error?.message || 
                          error.message || 
                          'Error al crear solicitud de beca';
      this.mostrarError(`Error: ${errorMessage}`);
      console.error('Error al crear solicitud:', error);
    } finally {
      this.isLoading = false;
    }
  }

  validarFormulario(): boolean {
    const errores: string[] = [];
    
    if (!this.solicitud.EstudianteId) {
      errores.push('debe seleccionar un estudiante');
    }

    if (!this.solicitud.TipoBecaId) {
      errores.push('debe seleccionar un tipo de beca');
    }

    if (!this.solicitud.PeriodoAcademicoId) {
      errores.push('debe seleccionar un periodo académico');
    }

    if (!this.solicitud.FechaSolicitud) {
      errores.push('debe ingresar la fecha de solicitud');
    }

    if (errores.length > 0) {
      this.mostrarError(`Campos requeridos: ${errores.join(', ')}`);
      return false;
    }

    return true;
  }

  resetForm() {
    this.solicitud = {
      EstudianteId: null,
      TipoBecaId: null,
      EstadoId: 1,
      FechaSolicitud: new Date().toISOString().split('T')[0],
      PeriodoAcademicoId: this.solicitud.PeriodoAcademicoId,
      Observaciones: '',
      Fecha_resultado: null
    };
  }

  limpiarMensajes() {
    this.isSuccess = false;
    this.isError = false;
    this.message = '';
  }

  mostrarExito(mensaje: string) {
    this.isSuccess = true;
    this.isError = false;
    this.message = mensaje;
    setTimeout(() => this.limpiarMensajes(), 5000);
  }

  mostrarError(mensaje: string) {
    this.isSuccess = false;
    this.isError = true;
    this.message = mensaje;
    setTimeout(() => this.limpiarMensajes(), 5000);
  }

  getNombreCompleto(estudiante: any): string {
    if (!estudiante) return 'Desconocido';
    return `${estudiante.Nombre || ''} ${estudiante.Apellido || ''}`.trim() || 'Sin nombre';
  }

  getPeriodoCompleto(periodo: any): string {
    if (!periodo) return 'Desconocido';
    return `${periodo.Nombre || ''} (${periodo.AnioAcademico || ''})`.trim() || 'Sin información';
  }
}