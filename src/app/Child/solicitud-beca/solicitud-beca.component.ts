import { Component, OnInit } from '@angular/core'; // Añadido OnInit para el ngOnInit
import { RouterModule } from '@angular/router';
import { SolicitudBecaService } from '../../services/solicitudbeca.service'; // Importa el nuevo servicio
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Define la interfaz para SolicitudBeca para mejor tipado
interface SolicitudBeca {
  Id?: number; // Opcional, ya que puede ser generado por el backend
  EstudianteId: number | null;
  TipoBecaId: number | null;
  EstadoId: number | null;
  FechaSolicitud: string | null; // Usar string para el input type="date"
  PeriodoAcademicoId: number | null;
  Observaciones: string;
  Fecha_resultado: string | null; // Usar string para el input type="date"
}

@Component({
  selector: 'app-solicitud-beca', // Selector actualizado
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './solicitud-beca.component.html', // Plantilla HTML actualizada
  styleUrl: './solicitud-beca.component.css' // Archivo CSS actualizado
})
export class SolicitudBecaComponent implements OnInit { // Implementa OnInit

  solicitudesBeca: SolicitudBeca[] = []; // Array para almacenar las solicitudes de beca
  nuevaSolicitudBeca: SolicitudBeca = { // Objeto para el formulario de nueva solicitud
    EstudianteId: null,
    TipoBecaId: null,
    EstadoId: null,
    FechaSolicitud: new Date().toISOString().substring(0, 10), // Inicializa con la fecha actual en formato YYYY-MM-DD
    PeriodoAcademicoId: null,
    Observaciones: '',
    Fecha_resultado: null
  };
  errorMsg: string = ''; // Mensaje de error

  // Inyecta el servicio SolicitudBecaService
  constructor(private solicitudBecaService: SolicitudBecaService) { }

  // Se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.loadSolicitudesBeca();
  }

  /**
   * Carga todas las solicitudes de beca desde el servicio.
   */
  async loadSolicitudesBeca(): Promise<void> {
    this.errorMsg = '';
    try {
      this.solicitudesBeca = await this.solicitudBecaService.getAllSolicitudesBeca();
      // console.log('Datos Solicitudes Beca', JSON.stringify(this.solicitudesBeca));
    } catch (error: any) {
      this.errorMsg = error.message || 'Error desconocido al cargar solicitudes de beca.';
      console.error('❌ ERROR AL CARGAR SOLICITUDES:', error);
    }
  }

  /**
   * Carga las solicitudes de beca (alias de loadSolicitudesBeca).
   */
  async cargarSolicitudesBeca(): Promise<void> {
    this.errorMsg = '';
    try {
      this.solicitudesBeca = await this.solicitudBecaService.getAllSolicitudesBeca();
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al obtener solicitudes de beca.';
      console.error('❌ ERROR AL OBTENER SOLICITUDES:', error);
    }
  }

  /**
   * Recarga las solicitudes de beca (alias de loadSolicitudesBeca).
   */
  async recargarSolicitudesBeca(): Promise<void> {
    this.errorMsg = '';
    try {
      this.solicitudesBeca = await this.solicitudBecaService.getAllSolicitudesBeca();
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al recargar solicitudes de beca.';
      console.error('❌ ERROR AL RECARGAR SOLICITUDES:', error);
    }
  }

  /**
   * Guarda una nueva solicitud de beca.
   */
  async guardarSolicitudBeca(): Promise<void> {
    // 🔍 Mostrar los datos antes de enviar
    console.log('INTENTANDO GUARDAR - Original:', this.nuevaSolicitudBeca);

    try {
      // Prepara los datos para enviar al backend, asegurando los tipos correctos
      const dataEnviar: SolicitudBeca = {
        Id: 0, // El ID puede ser 0 o null si el backend lo genera automáticamente
        EstudianteId: Number(this.nuevaSolicitudBeca.EstudianteId),
        TipoBecaId: Number(this.nuevaSolicitudBeca.TipoBecaId),
        EstadoId: Number(this.nuevaSolicitudBeca.EstadoId),
        FechaSolicitud: this.nuevaSolicitudBeca.FechaSolicitud,
        PeriodoAcademicoId: Number(this.nuevaSolicitudBeca.PeriodoAcademicoId),
        Observaciones: this.nuevaSolicitudBeca.Observaciones,
        Fecha_resultado: this.nuevaSolicitudBeca.Fecha_resultado
      };

      // 🔍 Mostrar los datos transformados
      console.log('DATOS A ENVIAR AL BACKEND:', dataEnviar);

      // Llama al servicio para crear la solicitud de beca
      const guardado = await this.solicitudBecaService.createSolicitudBeca(dataEnviar);

      // 🔍 Confirmar respuesta del backend
      console.log('RESPUESTA DEL BACKEND:', guardado);

      this.limpiarFormulario(); // Limpia el formulario después de guardar
      this.cargarSolicitudesBeca(); // Recarga la lista de solicitudes para mostrar la nueva
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al guardar la solicitud de beca.';
      console.error('❌ ERROR AL GUARDAR SOLICITUD:', error);
    }
  }

  /**
   * Limpia el array de solicitudes de beca.
   */
  limpiarSolicitudesBeca(): void {
    this.solicitudesBeca = [];
    this.errorMsg = '';
  }

  /**
   * Restablece el formulario a sus valores iniciales.
   */
  limpiarFormulario(): void {
    this.nuevaSolicitudBeca = {
      EstudianteId: null,
      TipoBecaId: null,
      EstadoId: null,
      FechaSolicitud: new Date().toISOString().substring(0, 10), // Restablece a la fecha actual
      PeriodoAcademicoId: null,
      Observaciones: '',
      Fecha_resultado: null
    };
    this.errorMsg = '';
  }
}
