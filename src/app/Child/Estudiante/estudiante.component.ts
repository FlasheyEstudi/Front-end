import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Estudiante {
  Id: number;
  Nombre: string;
  Apellido: string;
  Edad: number;
  Correo: string;
  EstadoId?: number;
  CarreraId?: number;
  EstadoNombre?: string;
  CarreraNombre?: string;
}

interface Carrera {
  Id: number;
  Nombre: string;
}

interface Estado {
  Id: number;
  Nombre: string;
}

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
  
  // Modal de registro
  showModal: boolean = false;
  
  // Modal de credenciales
  showCredentialsModal: boolean = false;
  credencialesEstudiante = {
    username: '',
    correo: '',
    password: ''
  };

  nuevoEstudiante = {
    Nombre: '',
    Apellido: '',
    Edad: null as number | null,
    Correo: '',
    EstadoId: undefined as number | undefined,
    CarreraId: undefined as number | undefined
  };

  searchTerm: string = '';
  filtroEstado: string = '';
  filtroCarrera: string = '';
  carrerasDisponibles: Carrera[] = [];
  estadosDisponibles: Estado[] = [];

  // Para mostrar notificaciones toast
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  private cargarDatosIniciales() {
    this.loading = true;
    this.error = '';
    
    // Cargar estados
    this.http.get<Estado[]>('http://localhost:3000/api-beca/estado')
      .subscribe({
        next: (estados) => {
          this.estadosDisponibles = Array.isArray(estados) ? estados : [];
          this.continuarCarga();
        },
        error: (err) => {
          console.error('Error cargando estados:', err);
          this.error = 'Error cargando estados: ' + (err.error?.message || err.message);
          this.loading = false;
        }
      });
  }

  private continuarCarga() {
    // Cargar carreras
    this.http.get<Carrera[]>('http://localhost:3000/api-beca/carrera')
      .subscribe({
        next: (carreras) => {
          this.carrerasDisponibles = Array.isArray(carreras) ? carreras : [];
          this.continuarCargaEstudiantes();
        },
        error: (err) => {
          console.error('Error cargando carreras:', err);
          this.error = 'Error cargando carreras: ' + (err.error?.message || err.message);
          this.loading = false;
        }
      });
  }

  private continuarCargaEstudiantes() {
    // Cargar estudiantes
    this.http.get<any[]>('http://localhost:3000/api-beca/estudiante')
      .subscribe({
        next: (estudiantes) => {
          this.estudiantes = Array.isArray(estudiantes) ? this.mapEstudiantes(estudiantes) : [];
          this.filteredEstudiantes = [...this.estudiantes];
          this.calcularKPIs();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error cargando estudiantes:', err);
          this.error = 'Error cargando estudiantes: ' + (err.error?.message || err.message);
          this.loading = false;
        }
      });
  }

  private mapEstudiantes(data: any[]): Estudiante[] {
    if (!Array.isArray(data)) {
      console.error('Datos de estudiantes no son un array:', data);
      return [];
    }
    
    return data.map(item => {
      const estudiante: Estudiante = {
        Id: item.Id || item.id || 0,
        Nombre: item.Nombre || item.nombre || '',
        Apellido: item.Apellido || item.apellido || '',
        Edad: item.Edad || item.edad || 0,
        Correo: item.Correo || item.correo || '',
        EstadoId: item.EstadoId !== undefined ? item.EstadoId : item.estadoId,
        CarreraId: item.CarreraId !== undefined ? item.CarreraId : item.carreraId,
        EstadoNombre: this.getEstadoNombre(item.EstadoId !== undefined ? item.EstadoId : item.estadoId),
        CarreraNombre: this.getCarreraNombre(item.CarreraId !== undefined ? item.CarreraId : item.carreraId)
      };
      return estudiante;
    });
  }

  getEstadoNombre(id?: number): string {
    if (id == null || id === 0) return 'No asignado';
    const estado = this.estadosDisponibles.find(e => e.Id === id);
    return estado ? estado.Nombre : `ID: ${id}`;
  }

  getCarreraNombre(id?: number): string {
    if (id == null || id === 0) return 'No asignada';
    const carrera = this.carrerasDisponibles.find(c => c.Id === id);
    return carrera ? carrera.Nombre : `ID: ${id}`;
  }

  calcularKPIs() {
    this.totalEstudiantes = this.estudiantes.length;
    this.estudiantesActivos = this.estudiantes.filter(e => e.EstadoId === 1).length;
  }

  private validarEstudiante(): boolean {
    this.error = '';
    if (!this.nuevoEstudiante.Nombre?.trim()) {
      this.error = 'Nombre es requerido';
      return false;
    }
    if (!this.nuevoEstudiante.Apellido?.trim()) {
      this.error = 'Apellido es requerido';
      return false;
    }
    if (!this.nuevoEstudiante.Edad || this.nuevoEstudiante.Edad <= 0) {
      this.error = 'Edad válida es requerida';
      return false;
    }
    if (!this.nuevoEstudiante.Correo?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      this.error = 'Correo electrónico inválido';
      return false;
    }
    return true;
  }

  // Abrir modal de registro
  abrirModalRegistro() {
    this.showModal = true;
    this.error = '';
  }

  // Cerrar modal de registro
  cerrarModalRegistro() {
    this.showModal = false;
    this.resetFormulario();
  }

  // Abrir modal de credenciales
  abrirCredentialsModal() {
    this.showCredentialsModal = true;
  }

  // Cerrar modal de credenciales
  closeCredentialsModal() {
    this.showCredentialsModal = false;
  }

  // Función para copiar al portapapeles
  copyToClipboard(text: string, type: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToastMessage(`${type} copiado al portapapeles`, 'success');
    }).catch(err => {
      console.error('Error al copiar texto: ', err);
      this.showToastMessage('Error al copiar al portapapeles', 'error');
    });
  }

  // Mostrar notificación toast
  showToastMessage(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  onSubmitNewStudent() {
    if (!this.validarEstudiante()) return;
    this.loading = true;
    
    const dataEnviar = {
      Id: 0,
      Nombre: this.nuevoEstudiante.Nombre,
      Apellido: this.nuevoEstudiante.Apellido,
      Edad: Number(this.nuevoEstudiante.Edad),
      Correo: this.nuevoEstudiante.Correo,
      EstadoId: this.nuevoEstudiante.EstadoId ? Number(this.nuevoEstudiante.EstadoId) : null,
      CarreraId: this.nuevoEstudiante.CarreraId ? Number(this.nuevoEstudiante.CarreraId) : null,
    };

    console.log('Enviando datos:', dataEnviar);

    this.http.post<any>('http://localhost:3000/api-beca/estudiante', dataEnviar)
      .subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          
          // Generar credenciales automáticamente (simulado)
          this.credencialesEstudiante = {
            username: this.generateUsername(this.nuevoEstudiante.Nombre, this.nuevoEstudiante.Apellido),
            correo: this.nuevoEstudiante.Correo,
            password: this.generatePassword()
          };
          
          this.resetFormulario();
          this.cargarDatosIniciales();
          this.cerrarModalRegistro();
          this.abrirCredentialsModal();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error completo:', err);
          this.error = 'Error al crear estudiante: ' + (err.error?.message || err.message || 'Error desconocido');
          this.loading = false;
        }
      });
  }

  // Generar nombre de usuario automáticamente
  private generateUsername(nombre: string, apellido: string): string {
    const firstLetter = nombre.charAt(0).toLowerCase();
    const formattedApellido = apellido.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return `${firstLetter}${formattedApellido}`;
  }

  // Generar contraseña automáticamente
  private generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
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
      filtered = filtered.filter(e => e.EstadoId?.toString() === this.filtroEstado);
    }
    if (this.filtroCarrera) {
      filtered = filtered.filter(e => e.CarreraId?.toString() === this.filtroCarrera);
    }
    this.filteredEstudiantes = filtered;
  }

  deleteEstudiante(id: number) {
    if (!confirm('¿Está seguro de eliminar este estudiante?')) return;
    this.loading = true;
    this.http.delete(`http://localhost:3000/api-beca/estudiante/${id}`)
      .subscribe({
        next: () => {
          this.cargarDatosIniciales();
          this.loading = false;
          this.showToastMessage('Estudiante eliminado correctamente', 'success');
        },
        error: (err) => {
          this.error = 'Error eliminando estudiante: ' + (err.error?.message || err.message);
          this.loading = false;
          this.showToastMessage('Error al eliminar estudiante', 'error');
        }
      });
  }

  resetFormulario() {
    this.nuevoEstudiante = {
      Nombre: '',
      Apellido: '',
      Edad: null,
      Correo: '',
      EstadoId: undefined,
      CarreraId: undefined
    };
    this.error = '';
  }
}