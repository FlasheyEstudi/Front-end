// src/app/Child/Estudiante/estudiante.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstudianteService, Estudiante, Carrera, Estado } from '../../services/estudiante.service';

@Component({
  selector: 'app-estudiante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estudiante.component.html',
  styleUrls: ['./estudiante.component.css']
})
export class EstudianteComponent implements OnInit {
  estudiantes: Estudiante[] = [];
  filteredEstudiantes: Estudiante[] = [];
  error: string = '';
  loading: boolean = false;

  // KPIs
  totalEstudiantes: number = 0;
  estudiantesActivos: number = 0;
  edadPromedio: number = 0;

  // Modal states
  showModal: boolean = false;
  showEditModal: boolean = false;
  showCredentialsModal: boolean = false;

  // Form data
  nuevoEstudiante = {
    Nombre: '',
    Apellido: '',
    Edad: null as number | null,
    Correo: '',
    EstadoId: null as number | null,
    CarreraId: null as number | null
  };

  estudianteEdit: Estudiante = {
    Id: 0,
    Nombre: '',
    Apellido: '',
    Edad: 0,
    Correo: '',
    EstadoId: 0,
    CarreraId: 0,
    FechaRegistro: '',
    EstadoNombre: '',
    CarreraNombre: ''
  };

  credenciales = {
    usuario: '',
    correo: '',
    contrasena: ''
  };

  // Filters
  searchTerm: string = '';
  filtroEstado: string = '';
  filtroCarrera: string = '';

  // Lookup data
  carrerasDisponibles: Carrera[] = [];
  estadosDisponibles: Estado[] = [];

  // Toast
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  constructor(private estudianteService: EstudianteService) {}

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  private async cargarDatosIniciales() {
    this.loading = true;
    this.error = '';
    try {
      const [estados, carreras, estudiantes] = await Promise.all([
        this.estudianteService.getAllEstados(),
        this.estudianteService.getAllCarreras(),
        this.estudianteService.getAllEstudiantes()
      ]);

      this.estadosDisponibles = estados;
      this.carrerasDisponibles = carreras;
      this.estudiantes = estudiantes;
      this.filteredEstudiantes = [...this.estudiantes];
      this.calcularKPIs(); // Calcular KPIs después de cargar los datos
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      this.error = 'Error cargando datos: ' + (err.error?.message || err.message);
      this.showToastMessage('Error al cargar datos', 'error');
    } finally {
      this.loading = false;
    }
  }

  getEstadoNombre(id?: number): string {
    if (id === undefined || id === null) return 'No asignado';
    const estado = this.estadosDisponibles.find(e => e.Id === id);
    return estado ? estado.Nombre : `ID: ${id}`;
  }

  getCarreraNombre(id?: number): string {
    if (id === undefined || id === null) return 'No asignado';
    const carrera = this.carrerasDisponibles.find(c => c.Id === id);
    return carrera ? carrera.Nombre : `ID: ${id}`;
  }

  // *** CORRECCIÓN PRINCIPAL ***
  // Calcular KPIs, incluyendo el número correcto de estudiantes activos
  calcularKPIs() {
    this.totalEstudiantes = this.estudiantes.length;
    // Corrección: Filtrar por EstadoId = 4, que es "Activo" según la base de datos
    this.estudiantesActivos = this.estudiantes.filter(e => e.EstadoId === 4).length;
    
    // Calcular edad promedio de forma segura
    const estudiantesConEdad = this.estudiantes.filter(e => e.Edad && e.Edad > 0);
    this.edadPromedio = estudiantesConEdad.length > 0
      ? Math.round(estudiantesConEdad.reduce((sum, e) => sum + e.Edad, 0) / estudiantesConEdad.length)
      : 0;
  }
  // *** FIN CORRECCIÓN PRINCIPAL ***

  private validarEstudiante(): boolean {
    this.error = '';
    if (!this.nuevoEstudiante.Nombre?.trim()) { this.error = 'Nombre es requerido'; return false; }
    if (!this.nuevoEstudiante.Apellido?.trim()) { this.error = 'Apellido es requerido'; return false; }
    if (!this.nuevoEstudiante.Edad || this.nuevoEstudiante.Edad <= 0) { this.error = 'Edad válida es requerida'; return false; }
    if (!this.nuevoEstudiante.Correo?.trim()) { this.error = 'Correo es requerido'; return false; }
    if (!this.nuevoEstudiante.EstadoId) { this.error = 'Estado es requerido'; return false; }
    if (!this.nuevoEstudiante.CarreraId) { this.error = 'Carrera es requerida'; return false; }
    return true;
  }

  // Filtros
  aplicarFiltros() {
    this.filteredEstudiantes = this.estudiantes.filter(estudiante => {
      const matchesSearch = !this.searchTerm ||
        (estudiante.Nombre?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
         estudiante.Apellido?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
         estudiante.Correo?.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesEstado = !this.filtroEstado || estudiante.EstadoId?.toString() === this.filtroEstado;
      const matchesCarrera = !this.filtroCarrera || estudiante.CarreraId?.toString() === this.filtroCarrera;

      return matchesSearch && matchesEstado && matchesCarrera;
    });
  }

  limpiarFiltros() {
    this.searchTerm = '';
    this.filtroEstado = '';
    this.filtroCarrera = '';
    this.filteredEstudiantes = [...this.estudiantes];
  }

  // Toast
  showToastMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  // Modales
  abrirModalRegistro() {
    this.showModal = true;
    this.resetFormulario();
  }

  cerrarModalRegistro() {
    this.showModal = false;
    this.resetFormulario();
  }

  abrirModalCredenciales(usuario: string, correo: string, contrasena: string) {
    this.credenciales = { usuario, correo, contrasena };
    this.showCredentialsModal = true;
  }

  cerrarModalCredenciales() {
    this.showCredentialsModal = false;
    this.credenciales = { usuario: '', correo: '', contrasena: '' };
  }

  editarEstudiante(id: number) {
    const estudiante = this.estudiantes.find(e => e.Id === id);
    if (estudiante) {
      // Crear una copia para evitar mutaciones directas
      this.estudianteEdit = { ...estudiante };
      this.showEditModal = true;
    }
  }

  async cerrarModalEdicion() {
    this.showEditModal = false;
    // Opcional: Resetear el formulario de edición si es necesario
    // this.estudianteEdit = { ...this.estudianteEditInitialState };
  }

  // Acciones CRUD
  async deleteEstudiante(id: number) {
    if (!confirm('¿Está seguro de eliminar este estudiante?')) return;
    this.loading = true;
    try {
      await this.estudianteService.eliminarEstudiante(id);
      await this.cargarDatosIniciales(); // Recargar datos después de eliminar
      this.showToastMessage('Estudiante eliminado correctamente', 'success');
    } catch (err: any) {
      this.error = 'Error eliminando estudiante: ' + (err.error?.message || err.message);
      this.showToastMessage('Error al eliminar estudiante', 'error');
    } finally {
      this.loading = false;
    }
  }

  verEstudiante(id: number) {
    alert(`Ver estudiante con ID: ${id}`);
  }

  resetFormulario() {
    this.nuevoEstudiante = {
      Nombre: '',
      Apellido: '',
      Edad: null,
      Correo: '',
      EstadoId: null,
      CarreraId: null
    };
    this.error = '';
  }

  async onSubmitNewStudent() {
    if (!this.validarEstudiante()) return;
    this.loading = true;
    try {
      const estudianteData = {
        Nombre: this.nuevoEstudiante.Nombre,
        Apellido: this.nuevoEstudiante.Apellido,
        Edad: this.nuevoEstudiante.Edad,
        Correo: this.nuevoEstudiante.Correo,
        EstadoId: this.nuevoEstudiante.EstadoId !== null ? this.nuevoEstudiante.EstadoId : undefined,
        CarreraId: this.nuevoEstudiante.CarreraId !== null ? this.nuevoEstudiante.CarreraId : undefined,
        Role: 'estudiante' // Si es necesario
      };

      const response = await this.estudianteService.createEstudiante(estudianteData);
      await this.cargarDatosIniciales(); // Recargar datos después de crear

      if (response.credenciales) {
        this.abrirModalCredenciales(
          response.credenciales.username,
          this.nuevoEstudiante.Correo,
          response.credenciales.password
        );
      } else {
        this.showToastMessage('Estudiante creado correctamente', 'success');
      }
      this.cerrarModalRegistro();
    } catch (err: any) {
      this.error = 'Error creando estudiante: ' + (err.error?.message || err.message);
      this.showToastMessage('Error al crear estudiante', 'error');
    } finally {
      this.loading = false;
    }
  }

  async onSubmitEditStudent() {
    if (!this.estudianteEdit.Id) {
       this.error = 'ID de estudiante no válido para editar';
       this.showToastMessage('Error al actualizar estudiante', 'error');
       return;
    }
    this.loading = true;
    try {
      const estudianteData = {
        Nombre: this.estudianteEdit.Nombre,
        Apellido: this.estudianteEdit.Apellido,
        Edad: this.estudianteEdit.Edad,
        Correo: this.estudianteEdit.Correo,
        EstadoId: this.estudianteEdit.EstadoId !== null ? this.estudianteEdit.EstadoId : undefined,
        CarreraId: this.estudianteEdit.CarreraId !== null ? this.estudianteEdit.CarreraId : undefined,
      };

      await this.estudianteService.updateEstudiante(this.estudianteEdit.Id, estudianteData);
      await this.cargarDatosIniciales(); // Recargar datos después de actualizar
      this.cerrarModalEdicion();
      this.showToastMessage('Estudiante actualizado correctamente', 'success');
    } catch (err: any) {
      this.error = 'Error actualizando estudiante: ' + (err.error?.message || err.message);
      this.showToastMessage('Error al actualizar estudiante', 'error');
    } finally {
      this.loading = false;
    }
  }

  copyToClipboard(text: string, type: string) {
    navigator.clipboard.writeText(text);
    // Opcional: Mostrar un mensaje de confirmación de copia
    // this.showToastMessage(`${type} copiado al portapapeles`, 'success');
  }

  // Función para rastrear estudiantes en *ngFor
  trackByEstudiante(index: number, item: Estudiante): number {
    return item.Id;
  }

  // Placeholder para funcionalidad futura
  getBecasActivas(estudianteId: number): number | null {
    // Lógica para obtener el número de becas activas del estudiante
    // Por ahora, retorna null o un valor por defecto
    return null; // o 0, o el número real si se implementa
  }

  getProgramaNombre(carreraId?: number): string {
    // Lógica para obtener el nombre del programa de una carrera
    // Por ahora, retorna un string vacío o un valor por defecto
    return ''; // o 'Programa no disponible'
  }
}