import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EstudianteService } from '../../services/estudiante.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-estudiante',
  standalone: true,
  imports: [RouterModule,CommonModule,FormsModule],
  templateUrl: './estudiante.component.html',
  styleUrl: './estudiante.component.css'
})
export class EstudianteComponent   {

    estudiantes: any[] = [];
    nuevoEstudiante = {
      Nombre: '',
      Apellido: '',
      Edad: null,
      Correo: '',
      EstadoId:"",
      CarreraId:""
  };
  errorMsg: string = '';


  constructor(private estudianteService: EstudianteService) {
    this.loadEstudiantes();
   
  }


  async loadEstudiantes() {
    this.errorMsg = '';
    try {      
      this.estudiantes = await this.estudianteService.getAllEstudiantes();
       //console.log('Datos Estudiantes',JSON.stringify(this.estudiantes));
    } catch (error: any) {
      this.errorMsg = error.message || 'Error desconocido';
    }
  }


  async cargarEstudiantes() {
    this.errorMsg = '';
    try {
      this.estudiantes = await this.estudianteService.getAllEstudiantes();
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al obtener estudiantes.';
    }
  }

async recargarEstudiantes() {
  this.errorMsg = '';
  try {
    this.estudiantes = await this.estudianteService.getAllEstudiantes();
  } catch (error: any) {
    this.errorMsg = error.message || 'Error al recargar estudiantes.';
  }
}

 async guardarEstudiante() {
  // 🔍 Mostrar los datos antes de enviar
  console.log('INTENTANDO GUARDAR - Original:', this.nuevoEstudiante);

  try {
    const dataEnviar = {
      Id: 0,
      Nombre: this.nuevoEstudiante.Nombre,
      Apellido: this.nuevoEstudiante.Apellido,
      Edad: Number(this.nuevoEstudiante.Edad),
      Correo: this.nuevoEstudiante.Correo,
      EstadoId: Number(this.nuevoEstudiante.EstadoId),
      CarreraId: Number(this.nuevoEstudiante.CarreraId),
    };

    // 🔍 Mostrar los datos transformados
    console.log('DATOS A ENVIAR AL BACKEND:', dataEnviar);

    const guardado = await this.estudianteService.createEstudiante(dataEnviar);

    // 🔍 Confirmar respuesta del backend
    console.log('RESPUESTA DEL BACKEND:', guardado);

    this.limpiarFormulario();
    this.cargarEstudiantes();
  } catch (error: any) {
    this.errorMsg = error.message || 'Error al guardar estudiante.';
    console.error('❌ ERROR AL GUARDAR:', error);
  }
}



limpiarEstudiantes() {
  this.estudiantes = [];
  this.errorMsg = '';
}


  limpiarFormulario() {
    this.nuevoEstudiante = {
      Nombre: '',
      Apellido: '',
      Edad: null,
      Correo: '',
      EstadoId:'',
      CarreraId:''
    };
    this.errorMsg = '';
  }



}