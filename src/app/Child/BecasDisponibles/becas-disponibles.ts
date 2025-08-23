// src/app/Child/BecasDisponibles/becas-disponibles.component.ts
// Asegúrate de que las rutas de importación sean correctas para tu proyecto
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TipoBecaService } from '../../services/tipobeca.service'; // Ajusta la ruta si es necesario
import { SolicitudBecaService, SolicitudBeca } from '../../services/solicitudbeca.service'; // Ajusta la ruta si es necesario
import { AuthService } from '../../../auth/auth'; // Ajusta la ruta si es necesario

// Interfaz que coincide con los datos devueltos por sp_Get_All_TipoBeca
interface BecaDisponible {
  Id: number;
  Nombre: string;
  Descripcion?: string;
  Monto: number;
  EstadoId: number;
  // sp_Get_All_TipoBeca NO devuelve las siguientes propiedades
  // Categoria?: string;
  // PorcentajeCobertura?: number;
  // RequisitosPrincipales?: string;
  // RequisitosAdicionales?: number;
  // FechaLimite?: string;
  // Beneficiarios?: number;
  // ColorHex?: string;
  // Prioridad?: number;
}

@Component({
  selector: 'app-becas-disponibles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './becas-disponibles.html',
  styleUrls: ['./becas-disponibles.css'] // Ajusta la ruta si es necesario
})
export class BecasDisponiblesComponent implements OnInit {
  becas: BecaDisponible[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  // categoriaFiltro = 'Todas las categorías'; // Comentado porque Categoria no está disponible
  showModal = false;
  selectedBeca: BecaDisponible | null = null;
  formData: SolicitudBeca = {
    EstudianteId: 0,
    TipoBecaId: 0,
    PeriodoAcademicoId: 0,
    Observaciones: '',
    FechaSolicitud: new Date().toISOString().split('T')[0],
    EstadoId: 1 // Pendiente
  };
  periodosAcademicos: any[] = [];

  constructor(
    private tipoBecaService: TipoBecaService, // Puede que no lo uses directamente aquí
    private solicitudBecaService: SolicitudBecaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('[OnInit] Iniciando componente BecasDisponiblesComponent');
    if (!this.authService.isLoggedIn()) {
      console.warn('[OnInit] Usuario no autenticado, redirigiendo a login.');
      this.error = '❌ No hay sesión activa.';
      this.router.navigate(['/login']);
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    console.log('[OnInit] Usuario actual obtenido:', currentUser);
    if (!currentUser?.id) {
      console.error('[OnInit] ID de usuario no disponible en el token.');
      this.error = '❌ Token inválido o ID de usuario no disponible.';
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    this.formData.EstudianteId = currentUser.id;
    console.log('[OnInit] formData.EstudianteId establecido a:', this.formData.EstudianteId);
    this.cargarDatosFrontend();
  }

  // Filtrar solo por nombre y descripción
  get filteredBecas() {
    const filtered = this.becas.filter(beca =>
      (beca.Nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
       (beca.Descripcion?.toLowerCase().includes(this.searchTerm.toLowerCase())))
       // && (this.categoriaFiltro === 'Todas las categorías' || beca.Categoria === this.categoriaFiltro)
       // Comentado porque Categoria no está disponible
    );
    // console.log('[get filteredBecas] Filtro aplicado, resultados:', filtered.length);
    return filtered;
  }

  cargarDatosFrontend(): void {
    console.log('[cargarDatosFrontend] Iniciando carga de datos...');
    this.loading = true;
    this.error = '';

    this.solicitudBecaService.getAllData().subscribe({
      // CORRECCIÓN: Nombrar correctamente el parámetro
      next: (data: any) => { // <--- CORRECTO: El parámetro se llama "data"
        console.log('[cargarDatosFrontend] Datos recibidos de getAllData:', data);

        if (!data.success) {
             const errorMsg = `❌ Error en datos del servidor: ${data.error?.message || 'Desconocido'}`;
             console.error('[cargarDatosFrontend] Error en respuesta del servidor:', errorMsg);
             this.error = errorMsg;
             this.loading = false;
             return;
        }

        // Cargar periodos académicos
        this.periodosAcademicos = data.data?.periodosAcademicos || [];
        console.log('[cargarDatosFrontend] Periodos académicos cargados:', this.periodosAcademicos.length);
        if (this.periodosAcademicos.length > 0 && !this.formData.PeriodoAcademicoId) {
          this.formData.PeriodoAcademicoId = this.periodosAcademicos[0].Id;
          console.log('[cargarDatosFrontend] formData.PeriodoAcademicoId establecido a:', this.formData.PeriodoAcademicoId);
        }

        // Cargar becas disponibles desde tiposBeca
        const tiposBecaRaw: any[] = data.data?.tiposBeca || [];
        console.log('[cargarDatosFrontend] Tipos de beca raw recibidos:', tiposBecaRaw.length);

        // Mapear los datos recibidos a la interfaz BecaDisponible
        // Solo usamos los campos que sabemos que existen
        this.becas = tiposBecaRaw.map((b: any) => {
            // Validación básica del ID
            const becaId = b.Id;
            // Verificación explícita de que el ID es un número entero positivo
            if (typeof becaId !== 'number' || becaId <= 0 || !Number.isInteger(becaId)) {
                 console.warn('[cargarDatosFrontend] Beca con ID inválido encontrado o mapeado:', b);
                 // Opcional: puedes filtrar estas becas inválidas
                 // return null;
            }
            return {
                Id: becaId,
                Nombre: b.Nombre,
                Descripcion: b.Descripcion,
                Monto: b.Monto,
                EstadoId: b.EstadoId
            };
        // }).filter(b => b !== null); // Si decides filtrar becas con ID inválido
        });
        console.log('[cargarDatosFrontend] Becas mapeadas y cargadas:', this.becas.length);
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('[cargarDatosFrontend] Error al cargar datos desde el servicio:', err);
        this.error = `❌ Error al cargar datos: ${err.message || err.statusText}`;
        this.loading = false;
      }
    });
  }

  abrirDetalle(beca: BecaDisponible): void {
    console.log('[abrirDetalle] Beca seleccionada para detalle/solicitud:', beca);
    // Validación adicional al seleccionar
    if (!beca || typeof beca.Id !== 'number' || beca.Id <= 0 || !Number.isInteger(beca.Id)) {
        console.error('[abrirDetalle] Intento de seleccionar beca con ID inválido:', beca);
        alert('❌ Error: La beca seleccionada no es válida.');
        return;
    }
    this.selectedBeca = beca;
    this.showModal = true;
    console.log('[abrirDetalle] Modal abierto, selectedBeca.Id:', this.selectedBeca?.Id);
  }

  cerrarModal(): void {
    console.log('[cerrarModal] Cerrando modal.');
    this.showModal = false;
    this.selectedBeca = null;
    console.log('[cerrarModal] Modal cerrado, selectedBeca:', this.selectedBeca);
  }

  solicitarBeca(): void {
    console.log('[solicitarBeca] Iniciando proceso de solicitud...');
    console.log('[solicitarBeca] Estado actual de selectedBeca:', this.selectedBeca);

    // Validaciones iniciales
    if (!this.selectedBeca) {
      console.error('[solicitarBeca] ❌ No se ha seleccionado ninguna beca.');
      alert('❌ Seleccione una beca primero.');
      return;
    }

    // --- Validación CRÍTICA del ID de la beca ---
    console.log('[solicitarBeca] Validando ID de beca...');
    console.log('[solicitarBeca] typeof selectedBeca.Id:', typeof this.selectedBeca.Id);
    console.log('[solicitarBeca] selectedBeca.Id (valor):', this.selectedBeca.Id);
    console.log('[solicitarBeca] selectedBeca.Id === 0:', this.selectedBeca.Id === 0);
    console.log('[solicitarBeca] selectedBeca.Id <= 0:', this.selectedBeca.Id <= 0);
    console.log('[solicitarBeca] isNaN(selectedBeca.Id):', isNaN(this.selectedBeca.Id));
    console.log('[solicitarBeca] Number.isInteger(selectedBeca.Id):', Number.isInteger(this.selectedBeca.Id));

    // Validar ID de la beca - Validación más explícita y robusta
    if (
        this.selectedBeca.Id === undefined ||
        this.selectedBeca.Id === null ||
        typeof this.selectedBeca.Id !== 'number' || // Verifica el tipo
        isNaN(this.selectedBeca.Id) || // Verifica si es NaN
        this.selectedBeca.Id <= 0 ||
        !Number.isInteger(this.selectedBeca.Id) // Verifica si es un entero
    ) {
      console.error('[solicitarBeca] ❌ ID de beca inválido en selectedBeca:', this.selectedBeca.Id, 'Tipo:', typeof this.selectedBeca.Id);
      alert('❌ ID de beca inválido. Por favor, inténtelo de nuevo seleccionando una beca de la lista.');
      // Opcional: Cerrar el modal si el ID es inválido
      // this.cerrarModal();
      return;
    }
    // --- Fin de validación del ID ---

    // Validar ID del estudiante
    if (!this.formData.EstudianteId || this.formData.EstudianteId <= 0) {
      console.error('[solicitarBeca] ❌ ID de estudiante inválido en formData:', this.formData.EstudianteId);
      alert('❌ ID de estudiante inválido.');
      return;
    }

    // Validar ID del período académico
    if (!this.formData.PeriodoAcademicoId || this.formData.PeriodoAcademicoId <= 0) {
      console.error('[solicitarBeca] ❌ ID de período académico inválido en formData:', this.formData.PeriodoAcademicoId);
      alert('❌ Seleccione un período académico válido.');
      return;
    }

    // Asignar TipoBecaId con validación adicional
    const tipoBecaIdOriginal = this.selectedBeca.Id;
    const tipoBecaId = Number(tipoBecaIdOriginal); // Convertir explícitamente
    console.log('[solicitarBeca] tipoBecaId después de conversión Number():', tipoBecaId);
    console.log('[solicitarBeca] isNaN(tipoBecaId):', isNaN(tipoBecaId));
    console.log('[solicitarBeca] tipoBecaId <= 0:', tipoBecaId <= 0);
    console.log('[solicitarBeca] Number.isInteger(tipoBecaId):', Number.isInteger(tipoBecaId));

    if (isNaN(tipoBecaId) || tipoBecaId <= 0 || !Number.isInteger(tipoBecaId)) {
      console.error('[solicitarBeca] ❌ ID de beca inválido después de conversión:', tipoBecaIdOriginal, '->', tipoBecaId);
      alert('❌ ID de beca inválido (error de conversión).');
      return;
    }

    this.formData.TipoBecaId = tipoBecaId;
    this.formData.EstadoId = 1; // Pendiente
    console.log('[solicitarBeca] formData.TipoBecaId establecido a:', this.formData.TipoBecaId);

    // Debug: Mostrar datos antes de enviar
    console.log('[solicitarBeca] Datos de solicitud a enviar:', JSON.parse(JSON.stringify(this.formData))); // Clonar para evitar referencias
    console.log('[solicitarBeca] Beca seleccionada (detalle):', this.selectedBeca);

    this.solicitudBecaService.createSolicitudBeca(this.formData).subscribe({
      next: (response) => {
        console.log('[solicitarBeca] Solicitud creada exitosamente:', response);
        alert('✅ Solicitud enviada correctamente.');
        this.cerrarModal();
        // Resetear formulario
        this.formData.TipoBecaId = 0;
        this.formData.Observaciones = '';
        // Opcional: Recargar la lista de solicitudes o actualizar algún indicador
      },
      error: (err: HttpErrorResponse) => {
        console.error('[solicitarBeca] Error detallado al crear solicitud:', err);
        // Manejo de errores del servicio
        let errorMessage = 'Intente de nuevo.';
        if (err.error?.detalle) {
            errorMessage = err.error.detalle;
        } else if (err.error?.message) {
             errorMessage = err.error.message;
        } else if (err.message) {
             errorMessage = err.message;
        } else if (err.status) {
             errorMessage = `Error del servidor (${err.status}).`;
        }
        alert(`❌ Error al enviar la solicitud: ${errorMessage}`);
        // No cerrar el modal ni resetear el formulario si hay error
        // para que el usuario pueda corregir o reintentar
      }
    });
  }
}