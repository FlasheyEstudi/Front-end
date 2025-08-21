// area-conocimiento.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AreaConocimientoService, AreaConocimiento } from '../../services/areaconocimiento.service';

@Component({
  selector: 'app-area-conocimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './area-conocimiento.component.html',
  styleUrls: ['./area-conocimiento.component.css']
})
export class AreaConocimientoComponent implements OnInit {
  areasConocimiento: AreaConocimiento[] = [];
  nuevaAreaConocimiento: AreaConocimiento = { nombre: '', descripcion: '' };
  editMode: boolean = false;
  areaToEdit: AreaConocimiento | null = null;
  errorMsg: string = '';
  successMsg: string = '';
  showModal: boolean = false; // 👈 ahora controlamos el modal

  constructor(private areaService: AreaConocimientoService) {}

  ngOnInit(): void {
    this.loadAreas();
  }

  loadAreas() {
    this.areaService.getAll().subscribe({
      next: data => this.areasConocimiento = data,
      error: err => {
        console.error('Error cargando áreas:', err);
        this.errorMsg = 'No se pudieron cargar las áreas de conocimiento.';
      }
    });
  }

  openModal(edit: boolean = false, area?: AreaConocimiento) {
    this.editMode = edit;
    this.showModal = true;
    if (edit && area) {
      this.areaToEdit = area;
      this.nuevaAreaConocimiento = { ...area, descripcion: area.descripcion || '' };
    } else {
      this.resetForm();
    }
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  guardarAreaConocimiento() {
    if (!this.nuevaAreaConocimiento.nombre?.trim()) {
      this.errorMsg = 'El nombre es obligatorio.';
      return;
    }

    const areaData: AreaConocimiento = {
      nombre: this.nuevaAreaConocimiento.nombre,
      descripcion: this.nuevaAreaConocimiento.descripcion || ''
    };

    if (this.editMode && this.areaToEdit?.Id) {
      areaData.Id = this.areaToEdit.Id;
      this.areaService.update(this.areaToEdit.Id, areaData).subscribe({
        next: () => {
          this.successMsg = 'Área actualizada correctamente.';
          this.closeModal();
          this.loadAreas();
        },
        error: err => {
          console.error('Error actualizando área:', err);
          this.errorMsg = 'Error al actualizar el área.';
        }
      });
    } else {
      this.areaService.create(areaData).subscribe({
        next: () => {
          this.successMsg = 'Área creada correctamente.';
          this.closeModal();
          this.loadAreas();
        },
        error: err => {
          console.error('Error creando área:', err);
          this.errorMsg = 'Error al crear el área.';
        }
      });
    }
  }

  deleteAreaConocimiento(id: number | undefined) {
    if (id === undefined) return;
    if (!confirm('¿Desea eliminar esta área de conocimiento?')) return;

    this.areaService.delete(id).subscribe({
      next: () => {
        this.successMsg = 'Área eliminada correctamente.';
        this.loadAreas();
      },
      error: err => {
        console.error('Error eliminando área:', err);
        this.errorMsg = 'Error al eliminar el área.';
      }
    });
  }

  resetForm() {
    this.nuevaAreaConocimiento = { nombre: '', descripcion: '' };
    this.editMode = false;
    this.areaToEdit = null;
    this.errorMsg = '';
  }
}
