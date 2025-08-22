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
  totalEstudiantes: number = 0;
  estudiantesActivos: number = 0;
  edadPromedio: number = 0;

  // Modales
  showModal: boolean = false;
  showEditModal: boolean = false;
  showCredentialsModal: boolean = false;

  // Datos para modales
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

  // Datos del modal de credenciales
  credenciales = {
    usuario: '',
    correo: '',
    contrasena: ''
  };

  searchTerm: string = '';
  filtroEstado: string = '';
  filtroCarrera: string = '';

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
      // Cargar estados
      this.estadosDisponibles = await this.estudianteService.getAllEstados();
      
      // Cargar carreras
      this.carrerasDisponibles = await this.estudianteService.getAllCarreras();
      
      // Cargar estudiantes
      this.estudiantes = await this.estudianteService.getAllEstudiantes();
      this.filteredEstudiantes = [...this.estudiantes];
      this.calcularKPIs();
      this.loading = false;
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      this.error = 'Error cargando datos: ' + (err.error?.message || err.message);
      this.loading = false;
    }
  }

  getEstadoNombre(id?: number): string {
    if (id === undefined || id === null) return 'No asignado';
    const estado = this.estadosDisponibles.find(e => e.Id === id);
    return estado ? estado.Nombre : `ID: ${id}`;
  }

  getCarreraNombre(id?: number): string {
    if (id === undefined || id === null) return 'No asignada';
    const carrera = this.carrerasDisponibles.find(c => c.Id === id);
    return carrera ? carrera.Nombre : `ID: ${id}`;
  }

  getProgramaNombre(id?: number): string {
    if (id === undefined || id === null) return '';
    const carrera = this.carrerasDisponibles.find(c => c.Id === id);
    return carrera ? carrera.Programa || '' : '';
  }

  getBecasActivas(estudianteId: number): string {
    return Math.random() > 0.5 ? '1' : '';
  }

  calcularKPIs() {
    this.totalEstudiantes = this.estudiantes.length;
    this.estudiantesActivos = this.estudiantes.filter(e => e.EstadoId === 1).length;
    this.edadPromedio = this.estudiantes.length > 0 
      ? Math.round(this.estudiantes.reduce((sum, e) => sum + e.Edad, 0) / this.estudiantes.length)
      : 0;
  }

  private validarEstudiante(): boolean {
    this.error = '';
    if (!this.nuevoEstudiante.Nombre?.trim()) { this.error = 'Nombre es requerido'; return false; }
    if (!this.nuevoEstudiante.Apellido?.trim()) { this.error = 'Apellido es requerido'; return false; }
    if (!this.nuevoEstudiante.Edad || this.nuevoEstudiante.Edad <= 0) { this.error = 'Edad válida es requerida'; return false; }
    if (!this.nuevoEstudiante.Correo?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { this.error = 'Correo electrónico inválido'; return false; }
    return true;
  }

  abrirModalRegistro() { this.showModal = true; this.error = ''; }
  cerrarModalRegistro() { this.showModal = false; this.resetFormulario(); }

  editarEstudiante(id: number) {
    const estudiante = this.estudiantes.find(e => e.Id === id);
    if (estudiante) {
      this.estudianteEdit = { ...estudiante };
      this.showEditModal = true;
    }
  }

  async cerrarModalEdicion() { 
    this.showEditModal = false; 
  }

  filtrarEstudiantes() {
    let filtered = [...this.estudiantes];
    const term = this.searchTerm.toLowerCase();
    if (term) {
      filtered = filtered.filter(e =>
        e.Nombre.toLowerCase().includes(term) ||
        e.Apellido.toLowerCase().includes(term) ||
        e.Correo.toLowerCase().includes(term)
      );
    }
    if (this.filtroEstado) {
      const estadoId = Number(this.filtroEstado);
      filtered = filtered.filter(e => e.EstadoId === estadoId);
    }
    if (this.filtroCarrera) {
      const carreraId = Number(this.filtroCarrera);
      filtered = filtered.filter(e => e.CarreraId === carreraId);
    }
    this.filteredEstudiantes = filtered;
  }

  async deleteEstudiante(id: number) {
    if (!confirm('¿Está seguro de eliminar este estudiante?')) return;
    this.loading = true;
    try {
      await this.estudianteService.eliminarEstudiante(id);
      await this.cargarDatosIniciales();
      this.showToastMessage('Estudiante eliminado correctamente', 'success');
    } catch (err: any) {
      this.error = 'Error eliminando estudiante: ' + (err.error?.message || err.message);
      this.showToastMessage('Error al eliminar estudiante', 'error');
    } finally {
      this.loading = false;
    }
  }

  verEstudiante(id: number) { alert(`Ver estudiante con ID: ${id}`); }

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

  // 🔹 Nuevo: Crear estudiante y mostrar modal de credenciales
  async onSubmitNewStudent() {
    if (!this.validarEstudiante()) return;

    this.loading = true;
    try {
      const estudianteData = {
        Nombre: this.nuevoEstudiante.Nombre,
        Apellido: this.nuevoEstudiante.Apellido,
        Edad: this.nuevoEstudiante.Edad,
        Correo: this.nuevoEstudiante.Correo,
        EstadoId: this.nuevoEstudiante.EstadoId ?? undefined,
        CarreraId: this.nuevoEstudiante.CarreraId ?? undefined
      };

      // Generar usuario y contraseña aleatoria
      const usuario = this.nuevoEstudiante.Nombre.toLowerCase() + '.' + this.nuevoEstudiante.Apellido.toLowerCase();
      const password = Math.random().toString(36).slice(-8); // contraseña de 8 caracteres

      await this.estudianteService.createEstudiante({...estudianteData, Usuario: usuario, Contrasena: password});
      await this.cargarDatosIniciales();
      this.cerrarModalRegistro();

      // Mostrar modal de credenciales
      this.credenciales = { usuario, correo: this.nuevoEstudiante.Correo, contrasena: password };
      this.showCredentialsModal = true;

      this.showToastMessage('Estudiante creado correctamente', 'success');

    } catch (err: any) {
      this.error = 'Error creando estudiante: ' + (err.error?.message || err.message);
      this.showToastMessage('Error al crear estudiante', 'error');
    } finally {
      this.loading = false;
    }
  }

  async onSubmitEditStudent() {
    this.loading = true;
    try {
      const estudianteData = {
        Nombre: this.estudianteEdit.Nombre,
        Apellido: this.estudianteEdit.Apellido,
        Edad: this.estudianteEdit.Edad,
        Correo: this.estudianteEdit.Correo,
        EstadoId: this.estudianteEdit.EstadoId ?? undefined,
        CarreraId: this.estudianteEdit.CarreraId ?? undefined
      };

      await this.estudianteService.updateEstudiante(this.estudianteEdit.Id, estudianteData);
      await this.cargarDatosIniciales();
      this.cerrarModalEdicion();
      this.showToastMessage('Estudiante actualizado correctamente', 'success');
    } catch (err: any) {
      this.error = 'Error actualizando estudiante: ' + (err.error?.message || err.message);
      this.showToastMessage('Error al actualizar estudiante', 'error');
    } finally {
            this.loading = false;
    }
  }

  // Cerrar modal de credenciales
  cerrarModalCredenciales() {
    this.showCredentialsModal = false;
    this.credenciales = { usuario: '', correo: '', contrasena: '' };
  }

  // Toast
  private showToastMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }
}

