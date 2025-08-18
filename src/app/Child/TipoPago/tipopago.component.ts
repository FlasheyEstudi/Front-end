import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Asegúrate de importar RouterModule si lo necesitas

// Definimos la interfaz para la entidad TipoPago basada en tu tabla
interface TipoPago {
  Id: number | null;
  Nombre: string;
  Descripcion: string;
  Estadoid: number | null;
}

@Component({
  selector: 'app-tipo-pago',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './tipopago.component.html',
  styleUrl: './tipopago.component.css' // Asegúrate de crear este archivo
})
export class TipoPagoComponent implements OnInit {

  // Array para almacenar los tipos de pago
  tiposDePago: TipoPago[] = []; 
  
  // Objeto para un nuevo tipo de pago
  nuevoTipoPago: TipoPago = {
    Id: null, // Id es nulo para los nuevos registros
    Nombre: '',
    Descripcion: '',
    Estadoid: null
  };
  
  // Mensaje para mostrar errores
  errorMsg: string = ''; 

  constructor() {
    // Constructor. La carga de datos se realiza en ngOnInit.
  }

  ngOnInit(): void {
    // Por ahora, solo inicializamos la tabla con datos de ejemplo
    this.tiposDePago = [
      { Id: 1, Nombre: 'Beca Completa', Descripcion: 'Cubre el 100% de la matrícula y gastos de manutención.', Estadoid: 1 },
      { Id: 2, Nombre: 'Beca Parcial', Descripcion: 'Cubre el 50% de la matrícula.', Estadoid: 1 },
      { Id: 3, Nombre: 'Beca Deportiva', Descripcion: 'Ayuda financiera para estudiantes atletas destacados.', Estadoid: 1 },
    ];
  }

  /**
   * Guarda un nuevo tipo de pago.
   */
  guardarTipoPago() {
    console.log('INTENTANDO GUARDAR:', this.nuevoTipoPago);

    try {
      // Simula el guardado agregando el nuevo objeto a la lista local
      this.tiposDePago.push({ ...this.nuevoTipoPago, Id: this.tiposDePago.length + 1 });
      this.limpiarFormulario();
      console.log('Tipo de pago guardado localmente.');
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al guardar tipo de pago.';
      console.error('❌ ERROR:', error);
    }
  }

  /**
   * Limpia los campos del formulario.
   */
  limpiarFormulario() {
    this.nuevoTipoPago = {
      Id: null,
      Nombre: '',
      Descripcion: '',
      Estadoid: null
    };
    this.errorMsg = '';
  }
}
