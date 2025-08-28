// src/app/Child/carrera/carrera.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { forkJoin, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  carreraToEdit: Carrera | null = null;
  editMode = false;

  searchTerm = '';
  errorMsg = '';
  successMsg = '';

  apiUrl = 'http://localhost:3000/api-beca/carrera';
  apiAreaUrl = 'http://localhost:3000/api-beca/area-conocimiento';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  /** Carga inicial de carreras y áreas */
  loadAllData() {
    this.clearMessages();
    forkJoin({
      carreras: this.http.get<Carrera[]>(this.apiUrl).pipe(catchError(this.handleError)),
      areas: this.http.get<AreaConocimiento[]>(this.apiAreaUrl).pipe(catchError(this.handleError))
    }).subscribe({
      next: ({ carreras, areas }) => {
        this.carreras = carreras;
        this.areasConocimiento = areas;
        this.onSearch();
      },
      error: (err) => {
        this.errorMsg = 'Error cargando datos iniciales: ' + err.message;
      }
    });
  }

  /** Carga solo carreras */
  loadCarreras() {
    this.http.get<Carrera[]>(this.apiUrl).pipe(catchError(this.handleError))
      .subscribe({
        next: data => { this.carreras = data; this.onSearch(); },
        error: (err) => this.errorMsg = 'Error cargando carreras: ' + err.message
      });
  }

  /** Guardar o actualizar carrera */
  guardarCarrera() {
    this.clearMessages();

    if (!this.nuevaCarrera.Nombre?.trim() || !this.nuevaCarrera.AreaConocimientoId || this.nuevaCarrera.AreaConocimientoId < 1) {
      this.errorMsg = 'Debe llenar todos los campos obligatorios y seleccionar un área válida.';
      return;
    }

    const dataToSend: Carrera = {
      Nombre: this.nuevaCarrera.Nombre,
      AreaConocimientoId: this.nuevaCarrera.AreaConocimientoId,
      Descripcion: this.nuevaCarrera.Descripcion || ''
    };

    let operation$: Observable<Carrera>;
    if (this.carreraToEdit?.Id) {
      operation$ = this.http.put<Carrera>(`${this.apiUrl}/${this.carreraToEdit.Id}`, dataToSend)
        .pipe(catchError(this.handleError));
    } else {
      operation$ = this.http.post<Carrera>(`${this.apiUrl}/add`, dataToSend)
        .pipe(catchError(this.handleError));
    }

    operation$.subscribe({
      next: (carrera) => {
        this.successMsg = this.carreraToEdit?.Id ? 'Carrera actualizada correctamente.' : 'Carrera agregada correctamente.';
        this.resetForm();
        this.loadCarreras();
      },
      error: (err: any) => {
        this.errorMsg = err.error?.detalle || err.message || 'Error en operación';
      }
    });
  }

  /** Editar carrera */
  editCarrera(carrera: Carrera) {
    this.clearMessages();
    this.editMode = true;
    this.carreraToEdit = { ...carrera };
    this.nuevaCarrera = {
      Nombre: carrera.Nombre,
      AreaConocimientoId: carrera.AreaConocimientoId,
      Descripcion: carrera.Descripcion || ''
    };
  }

  /** Eliminar carrera */
  deleteCarrera(id: number | undefined) {
    if (!id) {
      this.errorMsg = 'ID de carrera no válido.';
      return;
    }
    if (!confirm('¿Está seguro que desea eliminar esta carrera?')) return;

    this.clearMessages();
    this.http.delete(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError))
      .subscribe({
        next: () => { this.successMsg = 'Carrera eliminada correctamente.'; this.loadCarreras(); },
        error: (err: any) => this.errorMsg = err.error?.detalle || 'Error eliminando carrera. Verifique dependencias.'
      });
  }

  /** Buscar carreras por nombre o área */
  onSearch() {
    const term = this.searchTerm.toLowerCase();
    this.filteredCarreras = this.searchTerm
      ? this.carreras.filter(c =>
          c.Nombre.toLowerCase().includes(term) ||
          (c.AreaConocimientonombre?.toLowerCase().includes(term) ?? false))
      : [...this.carreras];
  }

  /** Nombre del área según el Id */
  getCarreraAreaNombre(areaId: number | null): string {
    if (!areaId) return 'Sin área';
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
  cancelEdit() { this.resetForm(); }

  /** Limpiar mensajes */
  clearMessages() {
    this.errorMsg = '';
    this.successMsg = '';
  }

  /** Manejador genérico de errores HTTP */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';
    if (error.error instanceof ErrorEvent) errorMessage = `Error: ${error.error.message}`;
    else {
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
      if (error.error?.detalle) errorMessage += `\nDetalle: ${error.error.detalle}`;
    }
    console.error('[CarreraComponent] Error de red:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
