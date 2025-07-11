import { Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';



export const routes: Routes = [

   {
    path: 'inicio',
    title: 'Inicio',
    loadComponent: () => 
        import('../app/mnu-principal/mnu-principal.component')
    .then(m => m.MnuPrincipalComponent),

    loadChildren: () => 
        import('../app/mnu-principal/mnu-principal-routing/mnu-principal-routing.module')
    .then(m => m.mnuPrincipalRoutes),
    
  },
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: '**', redirectTo: 'inicio'}

];