import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EstudianteService } from '../../services/estudiante.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-estudiante',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './estudiante.component.html',
  styleUrl: './estudiante.component.css'
})
export class EstudianteComponent   {

   estudiantes: any[] = [];
   errorMsg: string = '';

  constructor(private estudianteService: EstudianteService) {
    this.loadEstudiantes();
   
  }


  async loadEstudiantes() {
    try {
      this.estudiantes = await this.estudianteService.getAllEstudiantes();
       //console.log('Datos Estudiantes',JSON.stringify(this.estudiantes));
    } catch (error: any) {
      this.errorMsg = error.message || 'Error desconocido';
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

limpiarEstudiantes() {
  this.estudiantes = [];
  this.errorMsg = '';
}





}