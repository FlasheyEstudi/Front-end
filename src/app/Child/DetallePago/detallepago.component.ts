import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Definimos la interfaz para la entidad DetallePago basada en la tabla
interface DetallePago {
  Id: number | null;
  SolicitudBecaId: number | null;
  TipoPagold: number | null;
  Monto: number | null;
  FechaPago: string | null;
  Referencia: string;
  Estadold: number | null;
}

@Component({
  selector: 'app-detalle-pago',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './detallepago.component.html',
  styleUrl: './detallepago.component.css'
})
export class DetallePagoComponent implements OnInit {

  // Array para almacenar los detalles de pago
  detallesDePago: DetallePago[] = [];
  
  // Objeto para un nuevo detalle de pago
  nuevoDetallePago: DetallePago = {
    Id: null,
    SolicitudBecaId: null,
    TipoPagold: null,
    Monto: null,
    FechaPago: null,
    Referencia: '',
    Estadold: null
  };
  
  // Mensaje para mostrar errores
  errorMsg: string = '';

  constructor() {}

  ngOnInit(): void {
    // Inicializamos la tabla con datos de ejemplo
    this.detallesDePago = [
      {
        Id: 1,
        SolicitudBecaId: 101,
        TipoPagold: 1,
        Monto: 15000.00,
        FechaPago: '2023-08-01T10:00:00Z',
        Referencia: 'REF-001',
        Estadold: 1
      },
      {
        Id: 2,
        SolicitudBecaId: 102,
        TipoPagold: 2,
        Monto: 7500.50,
        FechaPago: '2023-08-05T12:30:00Z',
        Referencia: 'REF-002',
        Estadold: 1
      },
      {
        Id: 3,
        SolicitudBecaId: 103,
        TipoPagold: 3,
        Monto: 10000.00,
        FechaPago: '2023-08-10T15:00:00Z',
        Referencia: 'REF-003',
        Estadold: 1
      }
    ];
  }

  /**
   * Guarda un nuevo detalle de pago.
   */
  guardarDetallePago() {
    console.log('INTENTANDO GUARDAR:', this.nuevoDetallePago);

    try {
      // Simula el guardado agregando el nuevo objeto a la lista local
      this.detallesDePago.push({ 
        ...this.nuevoDetallePago, 
        Id: this.detallesDePago.length + 1,
        FechaPago: new Date().toISOString()
      });
      this.limpiarFormulario();
      console.log('Detalle de pago guardado localmente.');
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al guardar detalle de pago.';
      console.error('❌ ERROR:', error);
    }
  }

  /**
   * Limpia los campos del formulario.
   */
  limpiarFormulario() {
    this.nuevoDetallePago = {
      Id: null,
      SolicitudBecaId: null,
      TipoPagold: null,
      Monto: null,
      FechaPago: null,
      Referencia: '',
      Estadold: null
    };
    this.errorMsg = '';
  }
}
