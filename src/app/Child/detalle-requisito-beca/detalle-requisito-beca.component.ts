import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DetalleRequisitoBecaService } from '../../services/detallerequisitobeca.service'; // Ajusta la ruta según sea necesario

@Component({
  selector: 'app-detalle-requisito-beca', // Selector para el componente
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './detalle-requisito-beca.component.html', // Archivo de plantilla HTML
  styleUrl: './detalle-requisito-beca.component.css' // Archivo de estilos CSS
})
export class DetalleRequisitoBecaComponent implements OnInit {

  detalleRequisitosBeca: any[] = []; // Array para almacenar los detalles de requisitos
  nuevoDetalleRequisito = { // Objeto para un nuevo detalle de requisito
    TipoBecaId: null, // Corresponde a TipoBecaId (FK)
    RequisitoId: null // Corresponde a RequisitoId (FK)
  };
  errorMsg: string = ''; // Mensaje para mostrar errores

  constructor(private detalleRequisitoBecaService: DetalleRequisitoBecaService) {
    // Constructor, la carga de datos se realiza en ngOnInit
  }

  ngOnInit(): void {
    this.loadDetalleRequisitosBeca(); // Carga los datos cuando el componente se inicializa
  }

  /**
   * Carga todos los detalles de requisitos de becas desde el servicio.
   */
  async loadDetalleRequisitosBeca() {
    this.errorMsg = ''; // Limpia cualquier mensaje de error previo
    try {
      this.detalleRequisitosBeca = await this.detalleRequisitoBecaService.getAllDetalleRequisitosBeca();
      // console.log('Datos Detalle Requisitos Beca', JSON.stringify(this.detalleRequisitosBeca)); // Descomentar para depuración
    } catch (error: any) {
      this.errorMsg = error.message || 'Error desconocido al cargar detalles de requisitos de beca.';
      console.error('❌ ERROR AL CARGAR DETALLES DE REQUISITOS DE BECA:', error);
    }
  }

  /**
   * Recarga la lista de detalles de requisitos de becas.
   */
  async recargarDetalleRequisitosBeca() {
    this.errorMsg = ''; // Limpia cualquier mensaje de error previo
    try {
      this.detalleRequisitosBeca = await this.detalleRequisitoBecaService.getAllDetalleRequisitosBeca();
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al recargar detalles de requisitos de beca.';
      console.error('❌ ERROR AL RECARGAR DETALLES DE REQUISITOS DE BECA:', error);
    }
  }

  /**
   * Guarda un nuevo detalle de requisito de beca usando el servicio.
   */
  async guardarDetalleRequisitoBeca() {
    console.log('INTENTANDO GUARDAR - Original:', this.nuevoDetalleRequisito);

    try {
      // Prepara los datos para enviar al backend, alineándolos con la tabla Beca.Detalle_requisitos_beca
      const dataEnviar = {
        Id_detalle: 0, // Id_detalle es típicamente auto-generado por el backend
        TipoBecaId: Number(this.nuevoDetalleRequisito.TipoBecaId), // Convertir a número
        RequisitoId: Number(this.nuevoDetalleRequisito.RequisitoId), // Convertir a número
      };

      console.log('DATOS A ENVIAR AL BACKEND:', dataEnviar);

      const guardado = await this.detalleRequisitoBecaService.createDetalleRequisitoBeca(dataEnviar);

      console.log('RESPUESTA DEL BACKEND:', guardado);

      this.limpiarFormulario(); // Limpia el formulario después de guardar exitosamente
      this.recargarDetalleRequisitosBeca(); // Recarga la lista para mostrar la nueva entrada
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al guardar detalle de requisito de beca.';
      console.error('❌ ERROR AL GUARDAR DETALLE DE REQUISITO DE BECA:', error);
    }
  }

  /**
   * Limpia la lista de detalles de requisitos de becas mostrados.
   */
  limpiarDetalleRequisitosBeca() {
    this.detalleRequisitosBeca = []; // Vacía el array
    this.errorMsg = ''; // Limpia el mensaje de error
  }

  /**
   * Restablece los campos del formulario para un nuevo detalle de requisito.
   */
  limpiarFormulario() {
    this.nuevoDetalleRequisito = { // Restablece el objeto
      TipoBecaId: null,
      RequisitoId: null
    };
    this.errorMsg = ''; // Limpia el mensaje de error
  }
}
