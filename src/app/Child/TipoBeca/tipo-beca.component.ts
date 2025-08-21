import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TipoBeca {
  Id?: number;
  Nombre: string;
  Descripcion: string;
  Monto: number;
  FechaRegistro?: string;
  FechaModificacion?: string;
  EstadoId: number;
}

@Component({
  selector: 'app-tipo-beca',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tipo-beca.component.html',
  styleUrls: ['./tipo-beca.component.css']
})
export class TipoBecaComponent implements OnInit {
  tiposBeca: TipoBeca[] = [];
  nuevoTipoBeca: TipoBeca = {
    Nombre: '',
    Descripcion: '',
    Monto: 0,
    FechaRegistro: new Date().toISOString().slice(0, 16),
    FechaModificacion: new Date().toISOString().slice(0, 16),
    EstadoId: 1
  };
  errorMsg = '';
  loading = false;

  ngOnInit() {
    this.cargarTiposBeca();
  }

  cargarTiposBeca() {
    // Simulación de carga de datos
    this.tiposBeca = [
      {
        Id: 1,
        Nombre: 'Beca Académica',
        Descripcion: 'Beca para estudiantes con buen rendimiento académico',
        Monto: 1500,
        FechaRegistro: '2023-01-15T10:30',
        FechaModificacion: '2023-01-15T10:30',
        EstadoId: 1
      },
      {
        Id: 2,
        Nombre: 'Beca Deportiva',
        Descripcion: 'Beca para estudiantes destacados en actividades deportivas',
        Monto: 2000,
        FechaRegistro: '2023-02-20T14:45',
        FechaModificacion: '2023-02-20T14:45',
        EstadoId: 1
      }
    ];
  }

  guardarTipoBeca() {
    if (!this.nuevoTipoBeca.Nombre || !this.nuevoTipoBeca.Monto) {
      this.errorMsg = 'Por favor complete todos los campos obligatorios';
      return;
    }

    this.loading = true;
    
    // Simulación de guardado
    setTimeout(() => {
      this.tiposBeca.push({
        ...this.nuevoTipoBeca,
        Id: this.tiposBeca.length + 1,
        FechaRegistro: new Date().toISOString().slice(0, 16),
        FechaModificacion: new Date().toISOString().slice(0, 16)
      });
      
      this.limpiarFormulario();
      this.errorMsg = '';
      this.loading = false;
    }, 1000);
  }

  limpiarFormulario() {
    this.nuevoTipoBeca = {
      Nombre: '',
      Descripcion: '',
      Monto: 0,
      FechaRegistro: new Date().toISOString().slice(0, 16),
      FechaModificacion: new Date().toISOString().slice(0, 16),
      EstadoId: 1
    };
  }
}