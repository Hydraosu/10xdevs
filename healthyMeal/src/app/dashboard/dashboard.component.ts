import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService, DashboardStats, ActivityItem } from './dashboard.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dashboard-container">
      <h1 class="dashboard-title">Witaj w HealthyMeal</h1>
      
      <!-- Quick Stats -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">restaurant</mat-icon>
              <div class="stat-info">
                <span class="stat-value">{{ stats.totalRecipes }}</span>
                <span class="stat-label">Wszystkie Przepisy</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">kitchen</mat-icon>
              <div class="stat-info">
                <span class="stat-value">{{ stats.totalIngredients }}</span>
                <span class="stat-label">Składniki</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">calendar_today</mat-icon>
              <div class="stat-info">
                <span class="stat-value">{{ stats.totalActiveDays }}</span>
                <span class="stat-label">Dni Aktywności</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Szybkie Akcje</h2>
        <div class="actions-grid">
                      <mat-card class="action-card" routerLink="/app/recipes/create">
              <mat-card-content>
                <mat-icon>add_circle</mat-icon>
                <span>Nowy Przepis</span>
              </mat-card-content>
            </mat-card>

            <mat-card class="action-card" routerLink="/app/recipes/generate">
              <mat-card-content>
                <mat-icon>auto_awesome</mat-icon>
                <span>Generuj Przepis AI</span>
              </mat-card-content>
            </mat-card>

            <mat-card class="action-card" routerLink="/app/ingredients">
              <mat-card-content>
                <mat-icon>kitchen</mat-icon>
                <span>Zarządzaj Składnikami</span>
              </mat-card-content>
            </mat-card>

            <mat-card class="action-card" routerLink="/app/preferences">
              <mat-card-content>
                <mat-icon>settings</mat-icon>
                <span>Preferencje</span>
              </mat-card-content>
            </mat-card>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity">
        <h2>Ostatnia Aktywność</h2>
        <mat-card>
          <mat-card-content>
            <div *ngIf="loading" class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
            <div *ngIf="!loading" class="activity-list">
              <div *ngFor="let activity of activities" class="activity-item">
                <mat-icon>{{ getActivityIcon(activity.type) }}</mat-icon>
                <div class="activity-info">
                  <span class="activity-title">{{ activity.title }}</span>
                  <span class="activity-time">{{ formatTimestamp(activity.timestamp) }}</span>
                </div>
              </div>
              <div *ngIf="activities.length === 0" class="no-activities">
                Brak ostatniej aktywności
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .dashboard-title {
      margin-bottom: 32px;
      font-size: 2rem;
      color: rgba(0, 0, 0, 0.87);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      background-color: white;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      color: #3f51b5;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }

    .stat-label {
      color: rgba(0, 0, 0, 0.6);
    }

    .quick-actions {
      margin-bottom: 32px;
    }

    .quick-actions h2 {
      margin-bottom: 16px;
      font-size: 1.5rem;
      color: rgba(0, 0, 0, 0.87);
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .action-card {
      cursor: pointer;
      transition: transform 0.2s;
    }

    .action-card:hover {
      transform: translateY(-2px);
    }

    .action-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
    }

    .action-card mat-icon {
      color: #3f51b5;
    }

    .recent-activity h2 {
      margin-bottom: 16px;
      font-size: 1.5rem;
      color: rgba(0, 0, 0, 0.87);
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 0;
    }

    .activity-info {
      display: flex;
      flex-direction: column;
    }

    .activity-title {
      color: rgba(0, 0, 0, 0.87);
    }

    .activity-time {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 24px;
    }

    .no-activities {
      text-align: center;
      padding: 24px;
      color: rgba(0, 0, 0, 0.6);
    }

    @media (max-width: 600px) {
      .dashboard-container {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats = {
    totalRecipes: 0,
    totalIngredients: 0,
    totalActiveDays: 0
  };
  activities: ActivityItem[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData() {
    this.loading = true;
    
    this.dashboardService.getStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Error loading dashboard stats:', error);
        }
      });

    this.dashboardService.getActivities()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (activities) => {
          this.activities = activities;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading activities:', error);
          this.loading = false;
        }
      });
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'recipe_added':
        return 'add_circle';
      case 'meal_plan_updated':
        return 'edit';
      case 'favorite_added':
        return 'favorite';
      default:
        return 'info';
    }
  }

  formatTimestamp(date: Date): string {
    return this.dashboardService.formatTimestamp(date);
  }
} 