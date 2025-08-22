import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  visible: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent implements OnInit {
  collapsed = false;
  currentRoute = '';
  userName = 'Usuario';
  userRole = 'estudiante';
  menuItems: MenuItem[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateUserData();
    this.buildMenu();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
        this.updateUserData();
        this.buildMenu();
      }
    });
  }

  updateUserData() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.userRole = payload.role?.toLowerCase() || 'estudiante';
          this.userName = payload.nombre || 'Usuario';
        } catch {
          this.userRole = (localStorage.getItem('role') || 'estudiante').toLowerCase();
          this.userName = localStorage.getItem('username') || 'Usuario';
        }
      } else {
        this.userRole = 'estudiante';
        this.userName = 'Usuario';
      }
    }
  }

  buildMenu() {
    this.menuItems = [
      { label: 'Dashboard', icon: 'home', route: '/dashboard', visible: true },

      // Administrativos
      { label: 'Estudiantes', icon: 'users', route: '/estudiantes', visible: this.userRole === 'admin' },
      { label: 'Gestión Becas', icon: 'graduation-cap', route: '/tipo-beca', visible: this.userRole === 'admin' },
      { label: 'Categorías', icon: 'tags', route: '/categorias', visible: this.userRole === 'admin' },
      { label: 'Solicitudes', icon: 'file', route: '/solicitud-beca', visible: this.userRole === 'admin' },
      { label: 'Beneficiarios', icon: 'user-friends', route: '/estudiantes', visible: this.userRole === 'admin' },
      { label: 'Pagos', icon: 'credit-card', route: '/detalle-pago', visible: this.userRole === 'admin' },
      { label: 'Reportes', icon: 'chart-line', route: '/reportes', visible: this.userRole === 'admin' },
      { label: 'Configuración', icon: 'cog', route: '/configuracion', visible: this.userRole === 'admin' },

      // Estudiantes
      { label: 'Perfil', icon: 'user', route: '/perfil', visible: this.userRole === 'estudiante' },
      { label: 'Becas Disponibles', icon: 'book', route: '/becas-disponibles', visible: this.userRole === 'estudiante' },
      { label: 'Mis Solicitudes', icon: 'clipboard-list', route: '/mis-solicitudes', visible: this.userRole === 'estudiante' }
    ].filter(item => item.visible);
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  isActive(route: string): boolean {
    return this.currentRoute === route;
  }

  isLoggedIn(): boolean {
    if (typeof window !== 'undefined') return !!localStorage.getItem('access_token');
    return false;
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      localStorage.removeItem('userId');
    }
    this.router.navigate(['/login']).then(() => {
      if (typeof window !== 'undefined') window.location.reload();
    });
  }

  getIconClass(icon: string): string {
    const icons: Record<string, string> = {
      home: 'fa-home',
      users: 'fa-users',
      'graduation-cap': 'fa-graduation-cap',
      tags: 'fa-tags',
      file: 'fa-file',
      'user-friends': 'fa-user-friends',
      'credit-card': 'fa-credit-card',
      'chart-line': 'fa-chart-line',
      cog: 'fa-cog',
      user: 'fa-user',
      book: 'fa-book',
      'clipboard-list': 'fa-clipboard-list'
    };
    return icons[icon] || 'fa-home';
  }
}
