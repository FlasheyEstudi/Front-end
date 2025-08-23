import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Importa el servicio y las interfaces
import { TipoBecaService } from '../../services/tipobeca.service'; // Ajusta la ruta según tu estructura
import { TipoBeca, EstadoLookup } from '../../services/tipobeca.service'; // Importa las interfaces

@Component({
  selector: 'app-categorias-listado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.html', // Asegúrate de que esta ruta sea correcta
  styleUrls: ['./categorias.css']   // Asegúrate de que esta ruta sea correcta
})
export class ListadoComponent implements OnInit {
  // Variables para los datos
  categorias: TipoBeca[] = [];
  estadosLookup: EstadoLookup[] = []; // Para poblar el dropdown de estados

  // Modelos para los formularios
  nuevaCategoria: Omit<TipoBeca, 'Id' | 'Estadonombre' | 'Beneficiarios' | 'RequisitosPrincipales' | 'RequisitosAdicionales'> = this.resetNuevaCategoria();
  categoriaEdit: TipoBeca | null = null; // Usamos null para indicar que no hay edición en curso

  // Estados de la UI
  showCreateModal: boolean = false;
  showEditModal: boolean = false;
  loading: boolean = false;
  error: string = '';
  
  // Datos del resumen (KPIs)
  resumen: any = { // Puedes tiparlo más específicamente si creas una interfaz para el resumen
    CategoriasConfiguradas: 0,
    BeneficiariosTotales: 0,
    PresupuestoTotal: 0,
    CategoriasActivas: 0
  };

  constructor(private tipoBecaService: TipoBecaService) {} // Inyecta el servicio

  ngOnInit() {
    this.loadCategorias();
    this.loadEstados(); // Cargar estados para los dropdowns
    this.loadResumen();
  }

  // --- Métodos para cargar datos ---
  loadCategorias() {
    this.loading = true;
    this.error = '';
    this.tipoBecaService.getAllTipoBecas().subscribe({
      next: (data) => {
        this.categorias = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando categorías (Tipos de Beca):', err);
        this.error = 'No se pudieron cargar las categorías de beca.';
        this.loading = false;
      }
    });
  }

  loadEstados() {
    this.tipoBecaService.getAllEstadosLookup().subscribe({
      next: (data) => {
        this.estadosLookup = data || [];
      },
      error: (err) => {
        console.error('Error cargando estados:', err);
        this.error = 'No se pudieron cargar la lista de estados.';
        // No detenemos loading aquí porque loadCategorias lo maneja
      }
    });
  }

  loadResumen() {
    // Asumiendo que tienes un método en el servicio para esto, o lo haces directamente
    // Si no está en el servicio, puedes dejar el http directo como antes o añadirlo.
    // Por ahora, lo dejo como placeholder. Si `getResumen` existe en el servicio, úsalo.
    // this.tipoBecaService.getResumen().subscribe(...)
    // Si no, puedes dejar el http.get directo o crear el método en el servicio.
    // Ejemplo usando http directo (necesitas inyectar HttpClient):
    /*
    this.http.get<any>(`${this.tipoBecaService.apiUrl}/resumen`, { headers: this.tipoBecaService['getAuthHeaders']() })
      .subscribe({
        next: (data) => {
          this.resumen = data;
        },
        error: (err) => {
          console.error('Error cargando resumen:', err);
          this.error = 'No se pudieron cargar los indicadores.';
        }
      });
    */
   // Para este ejemplo, asumiré que el resumen se carga de otra forma o directamente
   // desde el componente como antes. Si lo añades al servicio, reemplaza esta parte.
   // Vamos a asumir que no está en el servicio y usar http directo.
   // Necesitas inyectar HttpClient si lo haces directamente.
   // Para mantener el ejemplo con el servicio, asumiré que el resumen se obtiene
   // de otro lugar o se simula. Si necesitas el resumen, añade el método al servicio.
  }

  // --- Métodos para modales ---
  abrirModalCrear() {
    this.nuevaCategoria = this.resetNuevaCategoria();
    this.showCreateModal = true;
    this.error = ''; // Limpiar errores al abrir
  }

  cerrarModalCrear() {
    this.showCreateModal = false;
    this.error = '';
  }

  abrirModalEditar(categoria: TipoBeca) {
    // Clonamos el objeto para evitar modificar el original en la lista
    this.categoriaEdit = { ...categoria };
    this.showEditModal = true;
    this.error = ''; // Limpiar errores al abrir
  }

  cerrarModalEditar() {
    this.categoriaEdit = null;
    this.showEditModal = false;
    this.error = '';
  }

  // --- Métodos para operaciones CRUD ---
  crearCategoria() {
    // Validación básica
    if (!this.nuevaCategoria.Nombre || !this.nuevaCategoria.Monto || !this.nuevaCategoria.PorcentajeCobertura || !this.nuevaCategoria.Categoria) {
      this.error = 'Por favor complete todos los campos obligatorios: Nombre, Monto, % Cobertura, Categoría.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.tipoBecaService.createTipoBeca(this.nuevaCategoria).subscribe({
      next: (response) => {
        this.categorias.push(response);
        this.cerrarModalCrear();
        this.loadResumen(); // Refrescar KPIs
        this.loading = false;
      },
      error: (err) => {
        console.error('Error creando categoría (Tipo de Beca):', err);
        this.error = err.error?.detalle || 'Error al crear la categoría.';
        this.loading = false;
      }
    });
  }

  actualizarCategoria() {
    if (!this.categoriaEdit) {
        this.error = 'No hay categoría para actualizar.';
        return;
    }
    // Validación básica
    if (!this.categoriaEdit.Nombre || !this.categoriaEdit.Monto || !this.categoriaEdit.PorcentajeCobertura || !this.categoriaEdit.Categoria) {
      this.error = 'Por favor complete todos los campos obligatorios: Nombre, Monto, % Cobertura, Categoría.';
      return;
    }

    this.loading = true;
    this.error = '';

    // Omitimos las propiedades que no se envían al backend o que son de solo lectura
    const { Id, Estadonombre, Beneficiarios, RequisitosPrincipales, RequisitosAdicionales, ...dataToUpdate } = this.categoriaEdit;

    this.tipoBecaService.updateTipoBeca(this.categoriaEdit.Id!, dataToUpdate).subscribe({
      next: (response) => {
        // Actualizar el item en la lista local
        const index = this.categorias.findIndex(e => e.Id === this.categoriaEdit?.Id);
        if (index !== -1) {
          this.categorias[index] = response;
        }
        this.cerrarModalEditar();
        this.loadResumen(); // Refrescar KPIs
        this.loading = false;
      },
      error: (err) => {
        console.error('Error actualizando categoría (Tipo de Beca):', err);
        this.error = err.error?.detalle || 'Error al actualizar la categoría.';
        this.loading = false;
      }
    });
  }

  eliminarCategoria(id: number) {
    if (!confirm('¿Está seguro de eliminar esta categoría?')) return;
    this.loading = true;
    this.error = '';

    this.tipoBecaService.deleteTipoBeca(id).subscribe({
      next: () => {
        this.categorias = this.categorias.filter(e => e.Id !== id);
        this.loadResumen(); // Refrescar KPIs
        this.loading = false;
        this.error = '';
      },
      error: (err) => {
        console.error('Error eliminando categoría (Tipo de Beca):', err);
        this.error = err.error?.detalle || 'Error al eliminar la categoría. Puede estar asociada a solicitudes existentes.';
        this.loading = false;
      }
    });
  }

  // --- Métodos auxiliares ---
  getEstadoNombre(id?: number): string {
    if (id === undefined) return 'Desconocido';
    const estado = this.estadosLookup.find(e => e.Id === id);
    return estado ? estado.Nombre : 'Desconocido';
  }

  private resetNuevaCategoria(): Omit<TipoBeca, 'Id' | 'Estadonombre' | 'Beneficiarios' | 'RequisitosPrincipales' | 'RequisitosAdicionales'> {
    return {
      Categoria: 'A',
      Nombre: '',
      Descripcion: '',
      Monto: 0,
      PorcentajeCobertura: 100,
      Prioridad: 1,
      ColorHex: '#009dd5',
      EstadoId: 1,
      // FechaLimite se puede añadir si es parte del DTO
    };
  }
}