import { Component, OnInit } from '@angular/core';
import { AreaConocimientoService, AreaConocimiento } from '../../services/areaconocimiento.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-area-conocimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './area-conocimiento.component.html',
  styleUrls: ['./area-conocimiento.component.css']
})
export class AreaConocimientoComponent implements OnInit {
  areas: AreaConocimiento[] = [];
  filteredAreas: AreaConocimiento[] = [];
  error: string = '';
  success: string = '';
  loading: boolean = false;

  showModal: boolean = false;
  editMode: boolean = false;
  areaToEdit: AreaConocimiento | null = null;

  nuevaAreaConocimiento: Omit<AreaConocimiento, 'Id' | 'fechaCreacion' | 'fechaModificacion'> = {
    nombre: '',
    descripcion: ''
  };

  searchTerm: string = '';

  constructor(private areaService: AreaConocimientoService) {}

  ngOnInit() {
    this.loadAreas();
  }

  loadAreas() {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.areaService.findAll().subscribe({
      next: data => {
        this.areas = data;
        this.filteredAreas = [...this.areas];
        this.loading = false;
      },
      error: err => {
        console.error('Error cargando áreas:', err);
        this.error = 'Error al cargar las áreas de conocimiento.';
        this.loading = false;
      }
    });
  }

  filterAreas() {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.filteredAreas = [...this.areas];
    } else {
      this.filteredAreas = this.areas.filter(a =>
        a.nombre.toLowerCase().includes(term) ||
        (a.descripcion && a.descripcion.toLowerCase().includes(term))
      );
    }
  }

  openModal() {
    this.resetForm();
    this.editMode = false;
    this.showModal = true;
  }

  openEditModal(area: AreaConocimiento) {
    this.nuevaAreaConocimiento = {
      nombre: area.nombre,
      descripcion: area.descripcion || ''
    };
    this.areaToEdit = { ...area };
    this.editMode = true;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.nuevaAreaConocimiento = { nombre: '', descripcion: '' };
    this.editMode = false;
    this.areaToEdit = null;
    this.error = '';
    this.success = '';
  }

  onSubmit() {
    if (!this.nuevaAreaConocimiento.nombre.trim()) {
      this.error = 'El nombre del área es obligatorio.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const operation$ = this.editMode && this.areaToEdit
      ? this.areaService.update(this.areaToEdit.Id, this.nuevaAreaConocimiento)
      : this.areaService.create(this.nuevaAreaConocimiento);

    operation$.subscribe({
      next: area => {
        this.success = this.editMode
          ? 'Área actualizada correctamente.'
          : 'Área creada correctamente.';
        this.closeModal();
        this.loadAreas();
        this.loading = false;
      },
      error: err => {
        console.error(this.editMode ? 'Error actualizando área:' : 'Error creando área:', err);
        this.error = this.editMode
          ? 'Error al actualizar el área.'
          : 'Error al crear el área.';
        this.loading = false;
      }
    });
  }

  deleteAreaConocimiento(id: number | undefined) {
    if (id === undefined) return;
    if (!confirm('¿Desea eliminar esta área de conocimiento?')) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    this.areaService.delete(id).subscribe({
      next: () => {
        this.success = 'Área eliminada correctamente.';
        this.loadAreas();
        this.loading = false;
      },
      error: err => {
        console.error('Error eliminando área:', err);
        this.error = 'Error al eliminar el área.';
        this.loading = false;
      }
    });
  }
}
