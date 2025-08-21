import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';

interface AreaConocimiento {
  Id: number;
  nombre: string;
}

interface Carrera {
  Id?: number;
  Nombre: string;
  AreaConocimientoId: number | null;
  Descripcion?: string;
  AreaConocimientonombre?: string;
}

@Component({
  selector: 'app-carrera',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './carrera.component.html',
  styleUrls: ['./carrera.component.css']
})
export class CarreraComponent implements OnInit {
  carreras: Carrera[] = [];
  filteredCarreras: Carrera[] = [];
  areasConocimiento: AreaConocimiento[] = [];
  nuevaCarrera: Carrera = { Nombre: '', AreaConocimientoId: null, Descripcion: '' };
  errorMsg = '';
  successMsg = '';
  searchTerm = '';
  editMode = false; // controla si el modal está abierto
  carreraToEdit: Carrera | null = null;

  apiUrl = 'http://localhost:3000/api-beca/carrera';
  apiAreaConocimientoUrl = 'http://localhost:3000/api-beca/area-conocimiento';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  /** Carga inicial de carreras y áreas */
  loadAllData() {
    this.clearMessages();
    forkJoin({
      carreras: this.http.get<Carrera[]>(this.apiUrl),
      areas: this.http.get<AreaConocimiento[]>(this.apiAreaConocimientoUrl)
    }).subscribe({
      next: ({ carreras, areas }) => {
        this.carreras = carreras;
        this.areasConocimiento = areas;
        this.onSearch();
      },
      error: (err) => {
        console.error('Error cargando datos iniciales:', err);
        this.errorMsg = 'Error cargando datos iniciales (carreras o áreas).';
      }
    });
  }

  /** Carga solo carreras */
  loadCarreras() {
    this.http.get<Carrera[]>(this.apiUrl).subscribe({
      next: data => {
        this.carreras = data;
        this.onSearch();
      },
      error: () => this.errorMsg = 'Error cargando carreras'
    });
  }

  /** Guardar o actualizar carrera */
  guardarCarrera() {
    this.clearMessages();

    if (!this.nuevaCarrera.Nombre?.trim() || this.nuevaCarrera.AreaConocimientoId === null) {
      this.errorMsg = 'Debe llenar todos los campos obligatorios.';
      return;
    }

    const dataToSend: Carrera = {
      Nombre: this.nuevaCarrera.Nombre,
      AreaConocimientoId: this.nuevaCarrera.AreaConocimientoId,
      Descripcion: this.nuevaCarrera.Descripcion || ''
    };

    if (this.carreraToEdit?.Id) {
      // actualizar
      dataToSend.Id = this.carreraToEdit.Id;
      this.http.put<Carrera>(`${this.apiUrl}/${this.carreraToEdit.Id}`, dataToSend).subscribe({
        next: () => {
          this.successMsg = 'Carrera actualizada correctamente.';
          this.resetForm();
          this.loadCarreras();
        },
        error: err => {
          console.error('Error al actualizar carrera:', err);
          this.errorMsg = err.error?.detalle || 'Error al actualizar carrera.';
        }
      });
    } else {
      // crear nueva
      this.http.post<Carrera>(`${this.apiUrl}/add`, dataToSend).subscribe({
        next: () => {
          this.successMsg = 'Carrera agregada correctamente.';
          this.resetForm();
          this.loadCarreras();
        },
        error: err => {
          console.error('Error al agregar carrera:', err);
          this.errorMsg = err.error?.detalle || 'Error al agregar carrera.';
        }
      });
    }
  }

  /** Editar carrera */
  editCarrera(carrera: Carrera) {
    this.clearMessages();
    this.editMode = true; // abrir modal
    this.carreraToEdit = { ...carrera };
    this.nuevaCarrera = { ...carrera, Descripcion: carrera.Descripcion || '' };
  }

  /** Eliminar carrera */
  deleteCarrera(id: number | undefined) {
    if (id === undefined) {
      this.errorMsg = 'ID de carrera no válido.';
      return;
    }
    if (!confirm('¿Está seguro que desea eliminar esta carrera?')) return;

    this.clearMessages();
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.successMsg = 'Carrera eliminada correctamente.';
        this.loadCarreras();
      },
      error: err => {
        console.error('Error al eliminar carrera:', err);
        this.errorMsg = err.error?.detalle || 'Error eliminando carrera. Verifique dependencias.';
      }
    });
  }

  /** Buscar carreras por nombre o área */
  onSearch() {
    if (!this.searchTerm) {
      this.filteredCarreras = [...this.carreras];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredCarreras = this.carreras.filter(c =>
      c.Nombre.toLowerCase().includes(term) ||
      (c.AreaConocimientonombre?.toLowerCase().includes(term) ?? false)
    );
  }

  /** Nombre del área según el Id */
  getCarreraAreaNombre(areaId: number | null): string {
    if (areaId === null) return 'Sin área';
    const area = this.areasConocimiento.find(a => a.Id === areaId);
    return area ? area.nombre : 'Desconocido';
  }

  /** Reset formulario y cerrar modal */
  resetForm() {
    this.nuevaCarrera = { Nombre: '', AreaConocimientoId: null, Descripcion: '' };
    this.carreraToEdit = null;
    this.editMode = false;
    this.clearMessages();
  }

  /** Cancelar edición o creación */
  cancelEdit() {
    this.resetForm();
  }

  /** Limpiar mensajes de estado */
  clearMessages() {
    this.errorMsg = '';
    this.successMsg = '';
  }
}
