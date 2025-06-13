import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule,
    MatMenuModule
  ],
  template: `
    <div class="app-container">
      <!-- Top Navigation -->
      <mat-toolbar color="primary" class="toolbar">
        <button mat-icon-button (click)="sidenav.toggle()" class="menu-button">
          <mat-icon>menu</mat-icon>
        </button>
        <span class="app-title">HealthyMeal</span>
        <span class="spacer"></span>
        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item routerLink="/app/preferences">
            <mat-icon>settings</mat-icon>
            <span>Preferencje</span>
          </button>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Wyloguj</span>
          </button>
        </mat-menu>
      </mat-toolbar>

      <!-- Side Navigation -->
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" opened class="sidenav">
          <mat-nav-list>
            <a mat-list-item routerLink="/app/dashboard" routerLinkActive="active">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Panel Główny</span>
            </a>
            <a mat-list-item routerLink="/app/recipes" routerLinkActive="active">
              <mat-icon matListItemIcon>restaurant</mat-icon>
              <span matListItemTitle>Przepisy</span>
            </a>
            <a mat-list-item routerLink="/app/ingredients" routerLinkActive="active">
              <mat-icon matListItemIcon>kitchen</mat-icon>
              <span matListItemTitle>Składniki</span>
            </a>
            <mat-divider></mat-divider>
            <a mat-list-item routerLink="/app/preferences" routerLinkActive="active">
              <mat-icon matListItemIcon>settings</mat-icon>
              <span matListItemTitle>Preferencje</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <!-- Main Content -->
        <mat-sidenav-content class="content">
          <div class="content-container">
            <router-outlet></router-outlet>
          </div>

          <!-- Footer -->
          <footer class="footer">
            <div class="footer-content">
              <span>© 2025 HealthyMeal. Wszystkie prawa zastrzeżone.</span>
              <div class="footer-links">
                <a href="#">Polityka Prywatności</a>
                <a href="#">Regulamin</a>
                <a href="#">Kontakt</a>
              </div>
            </div>
          </footer>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    .toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: 64px;
    }

    .app-title {
      margin-left: 8px;
      font-size: 1.5rem;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .sidenav-container {
      flex: 1;
      margin-top: 64px;
      height: calc(100vh - 64px);
      overflow: hidden;
    }

    .sidenav {
      width: 250px;
      background-color: #fafafa;
      border-right: 1px solid rgba(0, 0, 0, 0.12);
      overflow: hidden !important;
    }

    /* Force mat-sidenav to not scroll */
    .sidenav ::ng-deep .mat-drawer-inner-container {
      overflow: hidden !important;
    }

    /* Force mat-nav-list to not scroll */
    .sidenav ::ng-deep mat-nav-list {
      overflow: hidden !important;
      height: auto !important;
    }

    .content {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .content-container {
      flex: 1;
      padding: 24px;
      background-color: #f5f5f5;
      overflow-y: auto;
      overflow-x: hidden;
      max-height: 100%;
    }

    .footer {
      background-color: #fafafa;
      padding: 16px 24px;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
      flex-shrink: 0;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-links {
      display: flex;
      gap: 24px;
    }

    .footer-links a {
      color: rgba(0, 0, 0, 0.6);
      text-decoration: none;
      font-size: 14px;
    }

    .footer-links a:hover {
      color: rgba(0, 0, 0, 0.87);
    }

    .active {
      background-color: rgba(0, 0, 0, 0.04);
    }

    @media (max-width: 600px) {
      .sidenav {
        width: 200px;
      }

      .footer-content {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }
    }
  `]
})
export class LayoutComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async logout() {
    try {
      await this.authService.logout();
      await this.router.navigate(['/']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
} 