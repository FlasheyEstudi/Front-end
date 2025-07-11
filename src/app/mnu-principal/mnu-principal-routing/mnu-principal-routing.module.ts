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
  }

];