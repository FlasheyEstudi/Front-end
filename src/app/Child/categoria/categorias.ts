import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaces
interface Categoria {
  Id?: number;
  Categoria: string;
  Nombre: string;
  Descripcion?: string;
  Monto: number;
  Cobertura: number;
  Prioridad: number;
  ColorIdentificativo?: string;
  EstadoId: number;
  Beneficiarios: number;
}

interface Resumen {
  CategoriasConfiguradas: number;
  BeneficiariosTotales: number;
  PresupuestoTotal: number;
  CategoriasActivas: number;
}

@Component({
  selector: 'app-categorias-listado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.html',
  styleUrls: ['./categorias.css']
})
export class ListadoComponent implements OnInit {
  categorias: Categoria[] = [];
  nuevaCategoria: Categoria = {
    Categoria: 'A',
    Nombre: '',
    Descripcion: '',
    Cobertura: 100,
    Monto: 0,
    Prioridad: 1,
    ColorIdentificativo: '#009dd5',
    EstadoId: 1,
    Beneficiarios: 0
  };

  categoriaEdit: Categoria = {
    Id: 0,
    Categoria: 'A',
    Nombre: '',
    Descripcion: '',
    Cobertura: 100,
    Monto: 0,
    Prioridad: 1,
    ColorIdentificativo: '#009dd5',
    EstadoId: 1,
    Beneficiarios: 0
  };

  showCreateModal: boolean = false;
  showEditModal: boolean = false;
  loading: boolean = false;
  error: string = '';
  resumen: Resumen = {
    CategoriasConfiguradas: 0,
    BeneficiariosTotales: 0,
    PresupuestoTotal: 0,
    CategoriasActivas: 0
  };

  private apiUrl = 'http://localhost:3000/api-beca/tipobeca';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCategorias();
    this.loadResumen();
  }

  loadCategorias() {
    this.loading = true;
    this.http.get<Categoria[]>(this.apiUrl)
      .subscribe({
        next: data => {
          this.categorias = data || [];
          this.loading = false;
        },
        error: err => {
          console.error('Error cargando categorías:', err);
          this.error = 'No se pudieron cargar las categorías de beca.';
          this.loading = false;
        }
      });
  }

  loadResumen() {
    this.http.get<Resumen>(`${this.apiUrl}/resumen`)
      .subscribe({
        next: data => {
          this.resumen = data;
        },
        error: err => {
          console.error('Error cargando resumen:', err);
          this.error = 'No se pudieron cargar los indicadores.';
        }
      });
  }

  abrirModalCrear() {
    this.showCreateModal = true;
    this.nuevaCategoria = {
      Categoria: 'A',
      Nombre: '',
      Descripcion: '',
      Cobertura: 100,
      Monto: 0,
      Prioridad: 1,
      ColorIdentificativo: '#009dd5',
      EstadoId: 1,
      Beneficiarios: 0
    };
  }

  cerrarModalCrear() {
    this.showCreateModal = false;
  }

  editarCategoria(id: number) {
    const categoria = this.categorias.find(e => e.Id === id);
    if (categoria) {
      this.categoriaEdit = { ...categoria };
      this.showEditModal = true;
    }
  }

  cerrarModalEditar() {
    this.showEditModal = false;
  }

  crearCategoria() {
    if (!this.nuevaCategoria.Nombre || !this.nuevaCategoria.Monto || !this.nuevaCategoria.Cobertura || !this.nuevaCategoria.Categoria) {
      this.error = 'Por favor complete todos los campos obligatorios';
      return;
    }

    this.loading = true;

    const dataToSend = {
      Categoria: this.nuevaCategoria.Categoria,
      Nombre: this.nuevaCategoria.Nombre,
      Descripcion: this.nuevaCategoria.Descripcion,
      Monto: this.nuevaCategoria.Monto,
      PorcentajeCobertura: this.nuevaCategoria.Cobertura,
      Prioridad: this.nuevaCategoria.Prioridad,
      ColorHex: this.nuevaCategoria.ColorIdentificativo,
      EstadoId: this.nuevaCategoria.EstadoId
    };

    this.http.post<Categoria>(`${this.apiUrl}/add`, dataToSend)
      .subscribe({
        next: (response) => {
          this.categorias.push(response);
          this.cerrarModalCrear();
          this.error = '';
          this.loading = false;
          this.loadResumen(); // Refresh KPIs after creation
        },
        error: (err) => {
          console.error('Error creando categoría:', err);
          this.error = err.error?.detalle || 'Error al crear la categoría.';
          this.loading = false;
        }
      });
  }

  actualizarCategoria() {
    if (!this.categoriaEdit.Nombre || !this.categoriaEdit.Monto || !this.categoriaEdit.Cobertura || !this.categoriaEdit.Categoria) {
      this.error = 'Por favor complete todos los campos obligatorios';
      return;
    }

    this.loading = true;

    const dataToSend = {
      Id: this.categoriaEdit.Id,
      Categoria: this.categoriaEdit.Categoria,
      Nombre: this.categoriaEdit.Nombre,
      Descripcion: this.categoriaEdit.Descripcion,
      Monto: this.categoriaEdit.Monto,
      PorcentajeCobertura: this.categoriaEdit.Cobertura,
      Prioridad: this.categoriaEdit.Prioridad,
      ColorHex: this.categoriaEdit.ColorIdentificativo,
      EstadoId: this.categoriaEdit.EstadoId
    };

    this.http.put<Categoria>(`${this.apiUrl}/${this.categoriaEdit.Id}`, dataToSend)
      .subscribe({
        next: (response) => {
          const index = this.categorias.findIndex(e => e.Id === this.categoriaEdit.Id);
          if (index !== -1) {
            this.categorias[index] = response;
          }
          this.cerrarModalEditar();
          this.error = '';
          this.loading = false;
          this.loadResumen(); // Refresh KPIs after update
        },
        error: (err) => {
          console.error('Error actualizando categoría:', err);
          this.error = err.error?.detalle || 'Error al actualizar la categoría.';
          this.loading = false;
        }
      });
  }

  eliminarCategoria(id: number) {
    if (!confirm('¿Está seguro de eliminar esta categoría?')) return;
    this.loading = true;

    this.http.delete(`${this.apiUrl}/${id}`)
      .subscribe({
        next: () => {
          this.categorias = this.categorias.filter(e => e.Id !== id);
          this.loading = false;
          this.error = '';
          this.loadResumen(); // Refresh KPIs after deletion
        },
        error: (err) => {
          console.error('Error eliminando categoría:', err);
          this.error = err.error?.detalle || 'Error al eliminar la categoría. Puede estar asociada a solicitudes existentes.';
          this.loading = false;
        }
      });
  }

  getEstadoNombre(id?: number): string {
    if (id === undefined) return 'Desconocido';
    switch (id) {
      case 1: return 'Activa';
      case 2: return 'Inactiva';
      default: return 'Desconocido';
    }
  }
}