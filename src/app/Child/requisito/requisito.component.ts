import { Component, OnInit } from '@angular/core'; // Añadido OnInit para el ngOnInit
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequisitoService } from '../../services/requisito.service'; // Importa el nuevo servicio

// Define la interfaz para Requisito para mejor tipado
interface Requisito {
  Id?: number; // Opcional, ya que puede ser generado por el backend
  Descripcion: string;
  EstudianteId: number | null;
  FechaRegistro: string | null; // Usar string para el input type="date"
  FechaModificacion: string | null; // Usar string para el input type="date"
  EstadoId: number | null;
}

@Component({
  selector: 'app-requisito', // Selector actualizado
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './requisito.component.html', // Plantilla HTML actualizada
  styleUrl: './requisito.component.css' // Archivo CSS actualizado
})
export class RequisitoComponent implements OnInit { // Implementa OnInit

  requisitos: Requisito[] = []; // Array para almacenar los requisitos
  nuevoRequisito: Requisito = { // Objeto para el formulario de nuevo requisito
    Descripcion: '',
    EstudianteId: null,
    FechaRegistro: new Date().toISOString().substring(0, 10), // Inicializa con la fecha actual
    FechaModificacion: null, // Puede ser null inicialmente
    EstadoId: null
  };
  errorMsg: string = ''; // Mensaje de error

  // Inyecta el servicio RequisitoService
  constructor(private requisitoService: RequisitoService) { }

  // Se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.loadRequisitos();
  }

  /**
   * Carga todos los requisitos desde el servicio.
   */
  async loadRequisitos(): Promise<void> {
    this.errorMsg = '';
    try {
      this.requisitos = await this.requisitoService.getAllRequisitos();
      // console.log('Datos Requisitos', JSON.stringify(this.requisitos));
    } catch (error: any) {
      this.errorMsg = error.message || 'Error desconocido al cargar requisitos.';
      console.error('❌ ERROR AL CARGAR REQUISITOS:', error);
    }
  }

  /**
   * Guarda un nuevo requisito.
   */
  async guardarRequisito(): Promise<void> {
    // 🔍 Mostrar los datos antes de enviar
    console.log('INTENTANDO GUARDAR - Original:', this.nuevoRequisito);

    try {
      // Prepara los datos para enviar al backend, asegurando los tipos correctos
      const dataEnviar: Requisito = {
        Id: 0, // El ID puede ser 0 o null si el backend lo genera automáticamente
        Descripcion: this.nuevoRequisito.Descripcion,
        EstudianteId: Number(this.nuevoRequisito.EstudianteId),
        FechaRegistro: this.nuevoRequisito.FechaRegistro,
        FechaModificacion: this.nuevoRequisito.FechaModificacion,
        EstadoId: Number(this.nuevoRequisito.EstadoId)
      };

      // 🔍 Mostrar los datos transformados
      console.log('DATOS A ENVIAR AL BACKEND:', dataEnviar);

      // Llama al servicio para crear el requisito
      const guardado = await this.requisitoService.createRequisito(dataEnviar);

      // 🔍 Confirmar respuesta del backend
      console.log('RESPUESTA DEL BACKEND:', guardado);

      this.limpiarFormulario(); // Limpia el formulario después de guardar
      this.loadRequisitos(); // Recarga la lista de requisitos para mostrar el nuevo
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al guardar requisito.';
      console.error('❌ ERROR AL GUARDAR REQUISITO:', error);
    }
  }

  /**
   * Restablece el formulario a sus valores iniciales.
   */
  limpiarFormulario(): void {
    this.nuevoRequisito = {
      Descripcion: '',
      EstudianteId: null,
      FechaRegistro: new Date().toISOString().substring(0, 10), // Restablece a la fecha actual
      FechaModificacion: null,
      EstadoId: null
    };
    this.errorMsg = '';
  }

  /**
   * Limpia el array de requisitos.
   */
  limpiarRequisitos(): void {
    this.requisitos = [];
    this.errorMsg = '';
  }
}
