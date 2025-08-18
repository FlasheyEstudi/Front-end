import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AreaConocimientoService } from '../../services/areaconocimiento.service'; // Ajusta la ruta según sea necesario

@Component({
  selector: 'app-area-conocimiento', // Selector para el componente
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './area-conocimiento.component.html', // Archivo de plantilla HTML
  styleUrl: './area-conocimiento.component.css' // Archivo de estilos CSS
})
export class AreaConocimientoComponent implements OnInit {

  areasConocimiento: any[] = []; // Array para almacenar las áreas de conocimiento
  nuevaAreaConocimiento = { // Objeto para una nueva área de conocimiento
    nombre: '' // Corresponde a la columna 'nombre'
  };
  errorMsg: string = ''; // Mensaje para mostrar errores

  constructor(private areaConocimientoService: AreaConocimientoService) {
    // Constructor, la carga de datos se realiza en ngOnInit
  }

  ngOnInit(): void {
    this.loadAreasConocimiento(); // Carga los datos cuando el componente se inicializa
  }

  /**
   * Carga todas las áreas de conocimiento desde el servicio.
   */
  async loadAreasConocimiento() {
    this.errorMsg = ''; // Limpia cualquier mensaje de error previo
    try {
      this.areasConocimiento = await this.areaConocimientoService.getAllAreasConocimiento();
      // console.log('Datos Áreas de Conocimiento', JSON.stringify(this.areasConocimiento)); // Descomentar para depuración
    } catch (error: any) {
      this.errorMsg = error.message || 'Error desconocido al cargar áreas de conocimiento.';
      console.error('❌ ERROR AL CARGAR ÁREAS DE CONOCIMIENTO:', error);
    }
  }

  /**
   * Recarga la lista de áreas de conocimiento.
   */
  async recargarAreasConocimiento() {
    this.errorMsg = ''; // Limpia cualquier mensaje de error previo
    try {
      this.areasConocimiento = await this.areaConocimientoService.getAllAreasConocimiento();
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al recargar áreas de conocimiento.';
      console.error('❌ ERROR AL RECARGAR ÁREAS DE CONOCIMIENTO:', error);
    }
  }

  /**
   * Guarda una nueva área de conocimiento usando el servicio.
   */
  async guardarAreaConocimiento() {
    console.log('INTENTANDO GUARDAR - Original:', this.nuevaAreaConocimiento);

    try {
      // Prepara los datos para enviar al backend, alineándolos con la tabla Beca.AreaConocimiento
      const dataEnviar = {
        Id: 0, // Id es típicamente auto-generado por el backend
        nombre: this.nuevaAreaConocimiento.nombre,
      };

      console.log('DATOS A ENVIAR AL BACKEND:', dataEnviar);

      const guardado = await this.areaConocimientoService.createAreaConocimiento(dataEnviar);

      console.log('RESPUESTA DEL BACKEND:', guardado);

      this.limpiarFormulario(); // Limpia el formulario después de guardar exitosamente
      this.recargarAreasConocimiento(); // Recarga la lista para mostrar la nueva área de conocimiento
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al guardar área de conocimiento.';
      console.error('❌ ERROR AL GUARDAR ÁREA DE CONOCIMIENTO:', error);
    }
  }

  /**
   * Limpia la lista de áreas de conocimiento mostradas.
   */
  limpiarAreasConocimiento() {
    this.areasConocimiento = []; // Vacía el array
    this.errorMsg = ''; // Limpia el mensaje de error
  }

  /**
   * Restablece los campos del formulario para una nueva área de conocimiento.
   */
  limpiarFormulario() {
    this.nuevaAreaConocimiento = { // Restablece el objeto
      nombre: ''
    };
    this.errorMsg = ''; // Limpia el mensaje de error
  }
}
