import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AreaConocimiento {
  Id?: number;
  nombre: string;
  descripcion: string;
  fechaCreacion: string;
}

@Component({
  selector: 'app-area-conocimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './area-conocimiento.component.html',
  styleUrls: ['./area-conocimiento.component.css']
})
export class AreaConocimientoComponent implements OnInit {
  areasConocimiento: AreaConocimiento[] = [];
  nuevaAreaConocimiento: AreaConocimiento = { nombre: '', descripcion: '', fechaCreacion: new Date().toISOString() };
  editMode: boolean = false;
  areaToEdit: AreaConocimiento | null = null;
  error: string = '';
  success: string = '';
  showModal: boolean = false;

  private apiUrl = 'http://localhost:3000/api-beca/area-conocimiento';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAreas();
  }

  loadAreas() {
    this.http.get<AreaConocimiento[]>(this.apiUrl)
      .subscribe({
        next: data => {
          this.areasConocimiento = data.map(area => ({
            ...area,
            fechaCreacion: area.fechaCreacion || new Date().toISOString()
          }));
        },
        error: err => {
          console.error('Error cargando áreas:', err);
          this.error = 'No se pudieron cargar las áreas de conocimiento.';
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
      this.error = 'El nombre es obligatorio.';
      return;
    }

    const areaData: AreaConocimiento = {
      nombre: this.nuevaAreaConocimiento.nombre,
      descripcion: this.nuevaAreaConocimiento.descripcion || '',
      fechaCreacion: new Date().toISOString()
    };

    if (this.editMode && this.areaToEdit?.Id) {
      areaData.Id = this.areaToEdit.Id;
      this.http.put(`${this.apiUrl}/${this.areaToEdit.Id}`, areaData)
        .subscribe({
          next: () => {
            this.success = 'Área actualizada correctamente.';
            this.closeModal();
            this.loadAreas();
          },
          error: err => {
            console.error('Error actualizando área:', err);
            this.error = 'Error al actualizar el área.';
          }
        });
    } else {
      this.http.post(this.apiUrl, areaData)
        .subscribe({
          next: () => {
            this.success = 'Área creada correctamente.';
            this.closeModal();
            this.loadAreas();
          },
          error: err => {
            console.error('Error creando área:', err);
            this.error = 'Error al crear el área.';
          }
        });
    }
  }

  deleteAreaConocimiento(id: number | undefined) {
    if (id === undefined) return;
    if (!confirm('¿Desea eliminar esta área de conocimiento?')) return;

    this.http.delete(`${this.apiUrl}/${id}`)
      .subscribe({
        next: () => {
          this.success = 'Área eliminada correctamente.';
          this.loadAreas();
        },
        error: err => {
          console.error('Error eliminando área:', err);
          this.error = 'Error al eliminar el área.';
        }
      });
  }

  resetForm() {
    this.nuevaAreaConocimiento = { nombre: '', descripcion: '', fechaCreacion: new Date().toISOString() };
    this.editMode = false;
    this.areaToEdit = null;
    this.error = '';
    this.success = '';
  }
}