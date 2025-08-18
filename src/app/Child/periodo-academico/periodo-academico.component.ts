import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PeriodoAcademicoService } from '../../services/periodoacademico.service'; // Importa el nuevo servicio

// Define la interfaz para PeriodoAcademico para mejor tipado
interface PeriodoAcademico {
  Id?: number; // Opcional, ya que puede ser generado por el backend
  Nombre: string;
  AnioAcademico: string;
  FechaInicio: string | null; // Usar string para el input type="date"
  FechaFin: string | null; // Usar string para el input type="date"
  FechaRegistro: string | null; // Usar string para el input type="date"
  FechaModificacion: string | null; // Usar string para el input type="date"
  EstadoId: number | null;
}

@Component({
  selector: 'app-periodo-academico', // Selector actualizado
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './periodo-academico.component.html', // Plantilla HTML actualizada
  styleUrl: './periodo-academico.component.css' // Archivo CSS actualizado
})
export class PeriodoAcademicoComponent implements OnInit {

  periodosAcademicos: PeriodoAcademico[] = []; // Array para almacenar los periodos académicos
  nuevoPeriodoAcademico: PeriodoAcademico = { // Objeto para el formulario de nuevo periodo
    Nombre: '',
    AnioAcademico: '',
    FechaInicio: new Date().toISOString().substring(0, 10), // Inicializa con la fecha actual
    FechaFin: null,
    FechaRegistro: new Date().toISOString().substring(0, 10), // Inicializa con la fecha actual
    FechaModificacion: null,
    EstadoId: null
  };
  errorMsg: string = ''; // Mensaje de error

  // Inyecta el servicio PeriodoAcademicoService
  constructor(private periodoAcademicoService: PeriodoAcademicoService) { }

  // Se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.loadPeriodosAcademicos();
  }

  /**
   * Carga todos los periodos académicos desde el servicio.
   */
  async loadPeriodosAcademicos(): Promise<void> {
    this.errorMsg = '';
    try {
      this.periodosAcademicos = await this.periodoAcademicoService.getAllPeriodoAcademicos();
      // console.log('Datos Periodos Academicos', JSON.stringify(this.periodosAcademicos));
    } catch (error: any) {
      this.errorMsg = error.message || 'Error desconocido al cargar periodos académicos.';
      console.error('❌ ERROR AL CARGAR PERIODOS ACADÉMICOS:', error);
    }
  }

  /**
   * Guarda un nuevo periodo académico.
   */
  async guardarPeriodoAcademico(): Promise<void> {
    // 🔍 Mostrar los datos antes de enviar
    console.log('INTENTANDO GUARDAR - Original:', this.nuevoPeriodoAcademico);

    try {
      // Prepara los datos para enviar al backend, asegurando los tipos correctos
      const dataEnviar: PeriodoAcademico = {
        Id: 0, // El ID puede ser 0 o null si el backend lo genera automáticamente
        Nombre: this.nuevoPeriodoAcademico.Nombre,
        AnioAcademico: this.nuevoPeriodoAcademico.AnioAcademico,
        FechaInicio: this.nuevoPeriodoAcademico.FechaInicio,
        FechaFin: this.nuevoPeriodoAcademico.FechaFin,
        FechaRegistro: this.nuevoPeriodoAcademico.FechaRegistro,
        FechaModificacion: this.nuevoPeriodoAcademico.FechaModificacion,
        EstadoId: Number(this.nuevoPeriodoAcademico.EstadoId)
      };

      // 🔍 Mostrar los datos transformados
      console.log('DATOS A ENVIAR AL BACKEND:', dataEnviar);

      // Llama al servicio para crear el periodo académico
      const guardado = await this.periodoAcademicoService.createPeriodoAcademico(dataEnviar);

      // 🔍 Confirmar respuesta del backend
      console.log('RESPUESTA DEL BACKEND:', guardado);

      this.limpiarFormulario(); // Limpia el formulario después de guardar
      this.loadPeriodosAcademicos(); // Recarga la lista de periodos académicos para mostrar el nuevo
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al guardar periodo académico.';
      console.error('❌ ERROR AL GUARDAR PERIODO ACADÉMICO:', error);
    }
  }

  /**
   * Restablece el formulario a sus valores iniciales.
   */
  limpiarFormulario(): void {
    this.nuevoPeriodoAcademico = {
      Nombre: '',
      AnioAcademico: '',
      FechaInicio: new Date().toISOString().substring(0, 10), // Restablece a la fecha actual
      FechaFin: null,
      FechaRegistro: new Date().toISOString().substring(0, 10), // Restablece a la fecha actual
      FechaModificacion: null,
      EstadoId: null
    };
    this.errorMsg = '';
  }

  /**
   * Limpia el array de periodos académicos.
   */
  limpiarPeriodosAcademicos(): void {
    this.periodosAcademicos = [];
    this.errorMsg = '';
  }
}
