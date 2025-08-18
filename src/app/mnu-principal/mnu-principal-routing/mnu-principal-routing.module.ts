import { Routes } from '@angular/router';

export const mnuPrincipalRoutes: Routes = [
  {
    path: '',
    redirectTo: 'vacio',
    pathMatch: 'full'
  },
  {

    path: 'vacio',
    title: 'Pantalla vacía',
    loadComponent: () =>
      import('../../Child/Vacio/vacio.component').then(m => m.VacioComponent)
  },

  {
    path: 'estudiante',
    title: 'Estudiante',
    pathMatch: 'full',
    loadComponent: () =>
      import('../../Child/Estudiante/estudiante.component')
        .then(m => m.EstudianteComponent)
  },
  {
    path: 'tipobeca',
    title: 'TipoBeca',
    pathMatch: 'full',
    loadComponent: () =>
      import('../../Child/TipoBeca/tipo-beca.component')
        .then(m => m.TipoBecaComponent)
  },

  {
    path: 'SolicitudBeca',
    title: 'SolicitudBeca',
    pathMatch: 'full',
    loadComponent: () =>
      import('../../Child/solicitud-beca/solicitud-beca.component')
        .then(m => m.SolicitudBecaComponent)
  },


{
    path: 'Requisito',
    title: 'Requisito',
    pathMatch: 'full',
    loadComponent: () =>
      import('../../Child/requisito/requisito.component')
        .then(m => m.RequisitoComponent)
  },



{
    path: 'PeriodoAcademico',
    title: 'PeriodoAcademico',
    pathMatch: 'full',
    loadComponent: () =>
      import('../../Child/periodo-academico/periodo-academico.component')
        .then(m => m.PeriodoAcademicoComponent)
  },

{
    path: 'Estado',
    title: 'Estado',
    pathMatch: 'full',
    loadComponent: () =>
      import('../../Child/estado/estado.component')
        .then(m => m.EstadoComponent)
  },


  {
    path: 'DetalleRequisitoBeca',
    title: 'DetalleRequisitoBeca',
    pathMatch: 'full',
    loadComponent: () =>
      import('../../Child/detalle-requisito-beca/detalle-requisito-beca.component')
        .then(m => m.DetalleRequisitoBecaComponent)
  },




   {
    path: 'Carrera',
    title: 'Carrera',
    pathMatch: 'full',
    loadComponent: () =>
      import('../../Child/carrera/carrera.component')
        .then(m => m.CarreraComponent)
  },

   {
    path: 'AreaConocimiento',
    title: 'AreaConocimiento',
    pathMatch: 'full',
    loadComponent: () =>
      import('../../Child/area-conocimiento/area-conocimiento.component')
        .then(m => m.AreaConocimientoComponent)
  },


{
    path: 'Usuario',
    title: 'Usuario',
    pathMatch: 'full',
    loadComponent: () =>
      import('../../Child/Usuario/usuario.component')
        .then(m => m.UsuarioComponent)
  },


{
    path: 'TipoPago',
    title: 'TipoPago',
    pathMatch: 'full',
    loadComponent: () =>
      import('../../Child/TipoPago/tipopago.component')
        .then(m => m.TipoPagoComponent)
  },


{
    path: 'DetallePago',
    title: 'DetallePago',
    pathMatch: 'full',
    loadComponent: () =>
      import('../../Child/DetallePago/detallepago.component')
        .then(m => m.DetallePagoComponent)
  },
   {
    path: 'reporte',
    title: 'Reporte',
    pathMatch: 'full',
    loadComponent: () =>
      import('../../Child/Reporte/reporte.component')
        .then(m => m.ReporteComponent)
   }


]