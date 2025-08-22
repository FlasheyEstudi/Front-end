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
  FechaRegistro?: string;
  EstadoNombre?: string;
  CarreraNombre?: string;
}

interface Carrera {
  Id: number;
  Nombre: string;
  Programa?: string;
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
  edadPromedio: number = 0;

  // Modales
  showModal: boolean = false;
  showEditModal: boolean = false;

  // Datos para modales
  nuevoEstudiante = {
    Nombre: '',
    Apellido: '',
    Edad: null as number | null,
    Correo: '',
    EstadoId: undefined as number | undefined,
    CarreraId: undefined as number | undefined
  };

  estudianteEdit: Estudiante = {
    Id: 0,
    Nombre: '',
    Apellido: '',
    Edad: 0,
    Correo: '',
    EstadoId: undefined,
    CarreraId: undefined,
    FechaRegistro: '',
    EstadoNombre: '',
    CarreraNombre: ''
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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  private cargarDatosIniciales() {
    this.loading = true;
    this.error = '';

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
        FechaRegistro: item.FechaRegistro || item.fechaRegistro,
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

  getProgramaNombre(id?: number): string {
    if (id == null || id === 0) return '';
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

  abrirModalRegistro() {
    this.showModal = true;
    this.error = '';
  }

  cerrarModalRegistro() {
    this.showModal = false;
    this.resetFormulario();
  }

  editarEstudiante(id: number) {
    const estudiante = this.estudiantes.find(e => e.Id === id);
    if (estudiante) {
      this.estudianteEdit = { ...estudiante };
      this.showEditModal = true;
    }
  }

  cerrarModalEdicion() {
    this.showEditModal = false;
  }

  copyToClipboard(text: string, type: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToastMessage(`${type} copiado al portapapeles`, 'success');
    }).catch(err => {
      console.error('Error al copiar texto: ', err);
      this.showToastMessage('Error al copiar al portapapeles', 'error');
    });
  }

  showToastMessage(message: string, type: 'success' | 'error' = 'success', isHtml = false) {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    const container = document.createElement('div');
    container.innerHTML = message;
    const plainText = container.textContent || container.innerText || '';

    setTimeout(() => {
      this.showToast = false;
    }, 10000);

    if (isHtml) {
      setTimeout(() => {
        const copyBtn = document.getElementById('copy-credentials-btn');
        if (copyBtn) {
          copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(plainText).then(() => {
              this.showToastMessage('✅ Credenciales copiadas al portapapeles', 'success');
            }).catch(err => {
              console.error('Error al copiar:', err);
              this.showToastMessage('❌ No se pudo copiar', 'error');
            });
          });
        }
      }, 100);
    }
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

    this.http.post<any>('http://localhost:3000/api-beca/estudiante', dataEnviar)
      .subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);

          const cred = response.credenciales;
          const est = response.estudiante;

          const mensaje = `
            <strong>🔐 Credenciales Generadas</strong><br><br>
            <strong>📧 Correo:</strong> ${est.Correo}<br>
            <strong>👤 Usuario:</strong> ${cred.username}<br>
            <strong>🔑 Contraseña:</strong> ${cred.password}<br><br>
            <button id="copy-credentials-btn" style="
              background: #4caf50; 
              color: white; 
              border: none; 
              padding: 6px 10px; 
              border-radius: 4px; 
              font-size: 0.8rem; 
              cursor: pointer;">
              📋 Copiar credenciales
            </button>
            <br><small style="color: #666; font-size: 0.8rem;">
              <em>El estudiante debe cambiar la contraseña en su primer inicio de sesión.</em>
            </small>
          `;

          this.showToastMessage(mensaje, 'success', true);

          this.resetFormulario();
          this.cerrarModalRegistro();
          this.cargarDatosIniciales();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error completo:', err);
          this.error = 'Error al crear estudiante: ' + (err.error?.message || err.message || 'Error desconocido');
          this.loading = false;
        }
      });
  }

  onSubmitEditStudent() {
    if (!this.validarEstudiante()) return;
    this.loading = true;

    const dataEnviar = {
      Id: this.estudianteEdit.Id,
      Nombre: this.estudianteEdit.Nombre,
      Apellido: this.estudianteEdit.Apellido,
      Edad: Number(this.estudianteEdit.Edad),
      Correo: this.estudianteEdit.Correo,
      EstadoId: this.estudianteEdit.EstadoId ? Number(this.estudianteEdit.EstadoId) : null,
      CarreraId: this.estudianteEdit.CarreraId ? Number(this.estudianteEdit.CarreraId) : null,
    };

    this.http.put<any>(`http://localhost:3000/api-beca/estudiante/${this.estudianteEdit.Id}`, dataEnviar)
      .subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          const index = this.estudiantes.findIndex(e => e.Id === this.estudianteEdit.Id);
          if (index !== -1) {
            this.estudiantes[index] = { ...this.estudianteEdit };
            this.filteredEstudiantes = [...this.estudiantes];
          }
          this.cerrarModalEdicion();
          this.showToastMessage('Estudiante actualizado correctamente', 'success');
          this.loading = false;
        },
        error: (err) => {
          console.error('Error completo:', err);
          this.error = 'Error al actualizar estudiante: ' + (err.error?.message || err.message || 'Error desconocido');
          this.loading = false;
        }
      });
  }

  private generateUsername(nombre: string, apellido: string): string {
    const firstLetter = nombre.charAt(0).toLowerCase();
    const formattedApellido = apellido.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return `${firstLetter}${formattedApellido}`;
  }

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

  verEstudiante(id: number) {
    alert(`Ver estudiante con ID: ${id}`);
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