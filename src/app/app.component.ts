import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './Child/sidebar/sidebar';
import { AuthService } from './../auth/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent],
  template: `
    <div class="app-container">
      <app-sidebar *ngIf="showSidebar"></app-sidebar>
      <main class="main-content" [class.with-sidebar]="showSidebar">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private router: Router, public auth: AuthService) {}

  get showSidebar(): boolean {
    const url = this.router.url;
    const isAuthRoute = url.startsWith('/login') || url.startsWith('/register');
    return this.auth.isLoggedIn() && !isAuthRoute;
  }
}