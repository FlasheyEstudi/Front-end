// src/app/routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './../auth/guards/auth.guard';
import { roleGuard } from './../auth/guards/role.guard';

export const routes: Routes = [
  // Rutas públicas (sin autenticación)
  {
    path: 'login',
    title: 'Login',
    loadComponent: () =>
      import('./../auth/login/login')
        .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    title: 'Registro',
    loadComponent: () =>
      import('./../auth/register/register')
        .then(m => m.RegisterComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // Rutas protegidas (requieren autenticación)
  {
    path: 'dashboard',
    title: 'Dashboard',
    loadComponent: () =>
      import('./Child/dashboard/dashboard')
        .then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },

  // Rutas administrativas (requieren rol 'admin')
  {
    path: 'area-conocimiento',
    title: 'Áreas de Conocimiento',
    loadComponent: () =>
      import('./Child/area-conocimiento/area-conocimiento.component')
        .then(m => m.AreaConocimientoComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'carreras',
    title: 'Carreras',
    loadComponent: () =>
      import('./Child/carrera/carrera.component')
        .then(m => m.CarreraComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'estudiantes',
    title: 'Estudiantes',
    loadComponent: () =>
      import('./Child/Estudiante/estudiante.component')
        .then(m => m.EstudianteComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'requisitos',
    title: 'Requisitos',
    loadComponent: () =>
      import('./Child/requisito/requisito.component')
        .then(m => m.RequisitoComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'tipo-beca',
    title: 'Tipos de Beca',
    loadComponent: () =>
      import('./Child/TipoBeca/tipo-beca.component')
        .then(m => m.TipoBecaComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' }
  },
 
  {
    path: 'periodo-academico',
    title: 'Períodos Académicos',
    loadComponent: () =>
      import('./Child/periodo-academico/periodo-academico.component')
        .then(m => m.PeriodoAcademicoComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'solicitud-beca',
    title: 'Solicitudes de Beca',
    loadComponent: () =>
      import('./Child/solicitud-beca/solicitud-beca.component')
        .then(m => m.SolicitudBecaComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'estado',
    title: 'Estados',
    loadComponent: () =>
      import('./Child/estado/estado.component')
        .then(m => m.EstadoComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'reportes',
    title: 'Reportes',
    loadComponent: () =>
      import('./Child/Reporte/reporte.component')
        .then(m => m.ReporteComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'tipo-pago',
    title: 'Tipos de Pago',
    loadComponent: () =>
      import('./Child/TipoPago/tipopago.component')
        .then(m => m.TipoPagoComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'detalle-pago',
    title: 'Detalles de Pago',
    loadComponent: () =>
      import('./Child/DetallePago/detallepago.component')
        .then(m => m.DetallePagoComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'configuracion',
    title: 'Configuración',
    loadComponent: () =>
      import('./Child/Configuracion/configuracion.component')
        .then(m => m.ConfiguracionComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' }
  },

  {
    path: 'categorias',
    title: 'Categorías de Beca',
    loadComponent: () =>
      import('./Child/categoria/categorias')
        .then(m => m.ListadoComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' }
  },

  // Rutas para estudiantes (requieren rol 'estudiante') - Descomentar cuando estén listos
  // {
  //   path: 'perfil',
  //   title: 'Perfil',
  //   loadComponent: () =>
  //     import('./Child/estudiantes/perfil/perfil.component')
  //       .then(m => m.PerfilComponent),
  //   canActivate: [authGuard, roleGuard],
  //   data: { role: 'estudiante' }
  // },
  // {
  //   path: 'becas-disponibles',
  //   title: 'Becas Disponibles',
  //   loadComponent: () =>
  //     import('./Child/estudiantes/becas-disponibles/becas-disponibles.component')
  //       .then(m => m.BecasDisponiblesComponent),
  //   canActivate: [authGuard, roleGuard],
  //   data: { role: 'estudiante' }
  // },
  // {
  //   path: 'mis-solicitudes',
  //   title: 'Mis Solicitudes',
  //   loadComponent: () =>
  //     import('./Child/estudiantes/mis-solicitudes/mis-solicitudes.component')
  //       .then(m => m.MisSolicitudesComponent),
  //   canActivate: [authGuard, roleGuard],
  //   data: { role: 'estudiante' }
  // },
  // {
  //   path: 'beca-detalle',
  //   title: 'Detalle de Beca',
  //   loadComponent: () =>
  //     import('./Child/estudiantes/beca-detalle/beca-detalle.component')
  //       .then(m => m.BecaDetalleComponent),
  //   canActivate: [authGuard, roleGuard],
  //   data: { role: 'estudiante' }
  // },

  // Ruta comodín para cualquier otra ruta no definida
  { path: '**', redirectTo: 'login' }
];