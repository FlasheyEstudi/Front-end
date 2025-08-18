import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TipoBecaService } from '../../services/tipobeca.service';

// Definimos una interfaz para asegurar que la estructura de los datos sea correcta
interface TipoBeca {
  Id: number | null;
  Nombre: string;
  Descripcion: string;
  Monto: number | null;
  FechaRegistro: string | null;
  FechaModificacion: string | null;
  EstadoId: number | null;
}

@Component({
  selector: 'app-tipobeca',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './tipo-beca.component.html',
  styleUrl: './tipo-beca.component.css'
})
export class TipoBecaComponent {
  // Inicializamos tiposBeca con un array vacío del tipo TipoBeca
  tiposBeca: TipoBeca[] = [];
  
  // Ahora el objeto nuevoTipoBeca incluye todas las propiedades necesarias
  nuevoTipoBeca: TipoBeca = {
    Id: null, // Id es nulo para los nuevos registros
    Nombre: '',
    Descripcion: '',
    Monto: null,
    FechaRegistro: '', // Inicializamos como string para el input datetime-local
    FechaModificacion: null, // No se necesita en el formulario, pero lo incluimos en la interfaz
    EstadoId: null // Inicializamos como nulo
  };

  errorMsg: string = '';

  constructor(private TipoBecaServices: TipoBecaService) {
    this.loadTiposBeca();
  }

  async loadTiposBeca() {
    this.errorMsg = '';
    try {
      this.tiposBeca = await this.TipoBecaServices.getAllTipoBecas();
    } catch (error: any) {
      this.errorMsg = error.message || 'Error desconocido al cargar tipos de beca.';
      console.error('❌ ERROR al cargar tipos de beca:', error);
    }
  }

  async guardarTipoBeca() {
    console.log('INTENTANDO GUARDAR:', this.nuevoTipoBeca);

    try {
      const dataEnviar = {
        Id: 0,
        Nombre: this.nuevoTipoBeca.Nombre,
        Descripcion: this.nuevoTipoBeca.Descripcion,
        Monto: Number(this.nuevoTipoBeca.Monto),
        // EstadoId ya está en el objeto, por lo que lo usamos directamente
        EstadoId: Number(this.nuevoTipoBeca.EstadoId)
      };

      console.log('DATOS A ENVIAR:', dataEnviar);

      const respuesta = await this.TipoBecaServices.createTipoBeca(dataEnviar);
      console.log('RESPUESTA DEL BACKEND:', respuesta);

      this.limpiarFormulario();
      this.loadTiposBeca();
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al guardar tipo de beca.';
      console.error('❌ ERROR:', error);
    }
  }

  limpiarFormulario() {
    this.nuevoTipoBeca = {
      Id: null,
      Nombre: '',
      Descripcion: '',
      Monto: null,
      FechaRegistro: '',
      FechaModificacion: null,
      EstadoId: null
    };
    this.errorMsg = '';
  }

  limpiarTiposBeca() {
    this.tiposBeca = [];
    this.errorMsg = '';
  }
}
