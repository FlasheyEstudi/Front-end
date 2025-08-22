// src/app/Child/BecasDisponibles/becas-disponibles.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TipoBecaService, TipoBeca } from '../../services/tipobeca.service';
import { SolicitudBecaService, SolicitudBeca } from '../../services/solicitudbeca.service';
import { AuthService } from '../../../auth/auth';
import { EstudianteService } from '../../services/estudiante.service'; // ✅ Importar EstudianteService

interface BecasConDetalles extends TipoBeca {
  FechaLimite?: string;
  RequisitosPrincipales?: string;
  RequisitosAdicionales?: number;
  Beneficiarios: number;
  Categoria: string;
}

@Component({
  selector: 'app-becas-disponibles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './becas-disponibles.html',
  styleUrls: ['./becas-disponibles.css']
})
export class BecasDisponiblesComponent implements OnInit {
  becas: BecasConDetalles[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  categoriaFiltro = 'Todas las categorías';
  showModal = false;
  selectedBeca: BecasConDetalles | null = null;
  formData: SolicitudBeca = {
    EstudianteId: 0,
    TipoBecaId: 0,
    PeriodoAcademicoId: 0,
    Observaciones: '',
    FechaSolicitud: new Date().toISOString().split('T')[0],
    EstadoId: 1 // Pendiente
  };
  periodosAcademicos: any[] = [];
  estudianteIdReal: number = 0; // ✅ Almacenar el ID real del estudiante

  constructor(
    private tipoBecaService: TipoBecaService,
    private solicitudBecaService: SolicitudBecaService,
    private authService: AuthService,
    private estudianteService: EstudianteService, // ✅ Inyectar EstudianteService
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.error = '❌ No hay sesión activa.';
      this.router.navigate(['/login']);
      return;
    }
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.error = '❌ Token inválido o ID de usuario no disponible.';
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }
    
    // ✅ Obtener el ID real del estudiante usando el mapeo
    this.obtenerIdEstudiante(currentUser.id);
    
    // Cargar datos
    this.cargarTiposBecaDisponibles();
    this.cargarPeriodosAcademicos();
  }

  // ✅ Nuevo método para obtener el ID real del estudiante
  private async obtenerIdEstudiante(userId: number): Promise<void> {
    try {
      this.estudianteIdReal = await this.estudianteService.getEstudianteIdByUserId(userId);
      this.formData.EstudianteId = this.estudianteIdReal;
      console.log(`Mapeo exitoso: UserId ${userId} -> EstudianteId ${this.estudianteIdReal}`);
    } catch (error) {
      console.error('Error obteniendo ID del estudiante:', error);
      this.error = '❌ Error al obtener información del estudiante. Por favor, contacte al administrador.';
    }
  }

  get filteredBecas() {
    return this.becas.filter(beca =>
      (beca.Nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
       (beca.Descripcion?.toLowerCase().includes(this.searchTerm.toLowerCase()))) &&
      (this.categoriaFiltro === 'Todas las categorías' || beca.Categoria === this.categoriaFiltro)
    );
  }

  cargarTiposBecaDisponibles(): void {
    this.loading = true;
    this.error = '';
    
    this.tipoBecaService.getTiposBecaDisponibles().subscribe({
      next: (tiposBeca: TipoBeca[]) => {
        this.becas = tiposBeca.map((b: any) => ({
          ...b,
          Id: b.Id || 0,
          FechaLimite: b.FechaLimite || 'No definida',
          RequisitosPrincipales: b.RequisitosPrincipales || '',
          RequisitosAdicionales: b.RequisitosAdicionales || 0,
          Beneficiarios: b.Beneficiarios || 0,
          Categoria: b.Categoria || 'Sin categoría'
        }));
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = `❌ Error al cargar tipos de beca: ${err.message || err.statusText}`;
        this.loading = false;
        console.error('Error completo:', err);
      }
    });
  }

  cargarPeriodosAcademicos(): void {
    this.solicitudBecaService.getAllPeriodosAcademicosLookup().subscribe({
      next: (periodos: any[]) => {
        this.periodosAcademicos = periodos || [];
        if (this.periodosAcademicos.length > 0) {
          this.formData.PeriodoAcademicoId = this.periodosAcademicos[0].Id;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar periodos académicos:', err);
      }
    });
  }

  abrirDetalle(beca: BecasConDetalles): void {
    this.selectedBeca = beca;
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.selectedBeca = null;
  }

  solicitarBeca(): void {
    // Validaciones adicionales
    if (!this.selectedBeca) {
      alert('❌ Seleccione una beca primero.');
      return;
    }
    
    // Asegurar que selectedBeca tenga un ID válido
    if (!this.selectedBeca.Id || this.selectedBeca.Id <= 0) {
      alert('❌ ID de beca inválido.');
      return;
    }
    
    // ✅ Usar el ID real del estudiante en lugar del ID de usuario
    if (!this.estudianteIdReal || this.estudianteIdReal <= 0) {
      alert('❌ No se ha podido identificar su información como estudiante.');
      return;
    }
    
    if (!this.formData.PeriodoAcademicoId || this.formData.PeriodoAcademicoId <= 0) {
      alert('❌ Seleccione un período académico válido.');
      return;
    }
    
    // Asignar TipoBecaId con validación
    const tipoBecaId = Number(this.selectedBeca.Id);
    if (isNaN(tipoBecaId) || tipoBecaId <= 0) {
      alert('❌ ID de beca inválido.');
      return;
    }
    
    // ✅ Usar el ID real del estudiante
    this.formData.EstudianteId = this.estudianteIdReal;
    this.formData.TipoBecaId = tipoBecaId;
    this.formData.EstadoId = 1;
    
    // Debug: Mostrar datos antes de enviar
    console.log('Datos de solicitud:', this.formData);
    console.log('Beca seleccionada:', this.selectedBeca);
    
    this.solicitudBecaService.createSolicitudBeca(this.formData).subscribe({
      next: () => {
        alert('✅ Solicitud enviada correctamente.');
        this.cerrarModal();
        // Resetear formulario
        this.formData.TipoBecaId = 0;
        this.formData.Observaciones = '';
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error detallado:', err);
        const errorMessage = err.error?.detalle || err.error?.message || err.message || 'Intente de nuevo';
        alert(`❌ Error al enviar la solicitud: ${errorMessage}`);
      }
    });
  }
}