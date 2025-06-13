import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RecipeListItem } from '../../../types';
import { SupabaseService } from '../../supabase.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-recipes-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="recipes-container">
          <mat-card>
        <mat-card-header>
          <mat-card-title>Moje Przepisy</mat-card-title>
          <div class="header-actions">
            <button mat-raised-button color="primary" routerLink="/app/recipes/generate">
              <mat-icon>auto_awesome</mat-icon>
              Generuj Przepis
            </button>
          </div>
        </mat-card-header>

      <mat-card-content>
        <div class="loading-container" *ngIf="isLoading">
          <mat-spinner></mat-spinner>
        </div>

        <div *ngIf="!isLoading">
          <table mat-table [dataSource]="dataSource" matSort (matSortChange)="onSortChange($event)">
            <!-- Title Column -->
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Tytuł</th>
              <td mat-cell *matCellDef="let recipe">{{recipe.title}}</td>
            </ng-container>

            <!-- Description Column -->
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Opis</th>
              <td mat-cell *matCellDef="let recipe">{{recipe.description || '-'}}</td>
            </ng-container>

            <!-- Cooking Time Column -->
            <ng-container matColumnDef="cooking_time">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Czas Gotowania</th>
              <td mat-cell *matCellDef="let recipe">{{formatTime(recipe.cooking_time)}}</td>
            </ng-container>

            <!-- Difficulty Column -->
            <ng-container matColumnDef="difficulty">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Trudność</th>
              <td mat-cell *matCellDef="let recipe">{{getDifficultyText(recipe.difficulty)}}</td>
            </ng-container>

            <!-- Calories Column -->
            <ng-container matColumnDef="calories">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Kalorie</th>
              <td mat-cell *matCellDef="let recipe">{{recipe.calories || '-'}}</td>
            </ng-container>

            <!-- Created At Column -->
            <ng-container matColumnDef="created_at">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Data Utworzenia</th>
              <td mat-cell *matCellDef="let recipe">{{formatDate(recipe.created_at)}}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="onRowClick(row)" class="clickable-row"></tr>
          </table>

            <mat-paginator 
              [pageSizeOptions]="[5, 10, 25, 100]" 
              [pageSize]="10"
              (page)="onPageChange($event)"
              aria-label="Select page of recipes">
            </mat-paginator>
        </div>
      </mat-card-content>
    </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 24px;
    }

    mat-card {
      margin-bottom: 24px;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header-actions {
      display: flex;
      gap: 16px;
    }

    .header-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    table {
      width: 100%;
    }

    .mat-mdc-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .mat-mdc-header-row {
      background-color: #f5f5f5;
    }

    .mat-mdc-cell {
      padding: 16px;
    }

    .mat-mdc-header-cell {
      font-weight: 500;
    }

    mat-paginator {
      margin-top: 16px;
    }

    .clickable-row {
      cursor: pointer;
    }

    .clickable-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `]
})
export class RecipesListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['title', 'description', 'cooking_time', 'difficulty', 'calories', 'created_at'];
  dataSource: RecipeListItem[] = [];
  isLoading = false;
  totalCount = 0;
  currentPage = 0;
  pageSize = 10;
  currentSort: { column: string; direction: 'asc' | 'desc' } = { column: 'created_at', direction: 'desc' };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<RecipeListItem>;

  constructor(
    private supabaseService: SupabaseService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadRecipes();
  }

  ngAfterViewInit() {
    // Set initial sort
    this.sort.sort({
      id: this.currentSort.column,
      start: this.currentSort.direction,
      disableClear: false
    });
  }

  async loadRecipes() {
    try {
      this.isLoading = true;
      
      const { data: { user } } = await this.supabaseService.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get total count
      const { count } = await this.supabaseService.supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      this.totalCount = count || 0;

      // Get paginated and sorted data
      const { data: recipes, error } = await this.supabaseService.supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .order(this.currentSort.column, { ascending: this.currentSort.direction === 'asc' })
        .range(this.currentPage * this.pageSize, (this.currentPage + 1) * this.pageSize - 1);

      if (error) throw error;

      this.dataSource = recipes || [];
    } catch (error) {
      console.error('Error loading recipes:', error);
      this.snackBar.open('Nie udało się załadować przepisów. Spróbuj ponownie.', 'Zamknij', {
        duration: 5000
      });
    } finally {
      this.isLoading = false;
    }
  }

  onSortChange(event: any) {
    this.currentSort = {
      column: event.active,
      direction: event.direction
    };
    this.loadRecipes();
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadRecipes();
  }

  formatTime(minutes: number): string {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pl-PL');
  }

  getDifficultyText(difficulty: string | null): string {
    if (!difficulty) return '-';
    switch (difficulty) {
      case 'easy': return 'Łatwy';
      case 'medium': return 'Średni';
      case 'hard': return 'Trudny';
      default: return difficulty;
    }
  }

  onRowClick(recipe: RecipeListItem) {
    this.router.navigate(['/app/recipes', recipe.id]);
  }
} 