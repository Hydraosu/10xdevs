import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { IngredientsService } from './ingredients.service';
import { IngredientListResponse } from '../../types';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-ingredients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSortModule
  ],
  template: `
    <div class="ingredients-container">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon class="title-icon">kitchen</mat-icon>
          Zarządzanie Składnikami
        </h1>
        <p class="page-subtitle">Zarządzaj bazą składników do tworzenia przepisów</p>
      </div>

      <div class="content-layout">
        <!-- Main Ingredients List -->
        <div class="ingredients-section">
          <mat-card class="ingredients-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>list</mat-icon>
                Wszystkie Składniki
              </mat-card-title>
              <div class="header-actions">
                <mat-form-field appearance="outline" class="search-field">
                  <mat-label>Szukaj składników</mat-label>
                  <input
                    matInput
                    [(ngModel)]="searchQuery"
                    (ngModelChange)="onSearchChange($event)"
                    placeholder="Wpisz aby szukać..."
                  >
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
              </div>
            </mat-card-header>

            <mat-card-content>
              <!-- Stats Row -->
              <div class="stats-row" *ngIf="!isLoading">
                <div class="stat-item">
                  <mat-icon>inventory</mat-icon>
                  <span class="stat-value">{{ ingredients.meta.total }}</span>
                  <span class="stat-label">Wszystkie Składniki</span>
                </div>
                <div class="stat-item">
                  <mat-icon>search</mat-icon>
                  <span class="stat-value">{{ ingredients.data.length }}</span>
                  <span class="stat-label">Wyświetlane</span>
                </div>
              </div>

              <mat-divider></mat-divider>

              <!-- Table Section -->
              <div class="table-container" *ngIf="!isLoading">
                <table mat-table [dataSource]="ingredients.data" class="ingredients-table" matSort>
                  <!-- Name Column -->
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>
                      <mat-icon>label</mat-icon>
                      Nazwa
                    </th>
                    <td mat-cell *matCellDef="let ingredient">
                      <div class="ingredient-name">
                        <mat-icon class="ingredient-icon">eco</mat-icon>
                        {{ ingredient.name }}
                      </div>
                    </td>
                  </ng-container>

                  <!-- Created Date Column -->
                  <ng-container matColumnDef="created_at">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>
                      <mat-icon>schedule</mat-icon>
                      Dodano
                    </th>
                    <td mat-cell *matCellDef="let ingredient">
                      {{ formatDate(ingredient.created_at) }}
                    </td>
                  </ng-container>

                  <!-- Usage Count Column -->
                  <ng-container matColumnDef="usage_count">
                    <th mat-header-cell *matHeaderCellDef>
                      <mat-icon>trending_up</mat-icon>
                      Użycie
                    </th>
                    <td mat-cell *matCellDef="let ingredient">
                      <div class="usage-badge">
                        {{ ingredient.usage_count || 0 }} przepisów
                      </div>
                    </td>
                  </ng-container>

                  <!-- Actions Column -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>
                      <mat-icon>settings</mat-icon>
                      Akcje
                    </th>
                    <td mat-cell *matCellDef="let ingredient">
                      <div class="action-buttons">
                        <button mat-icon-button color="primary" 
                                matTooltip="Edytuj składnik"
                                (click)="editIngredient(ingredient)">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button color="warn" 
                                matTooltip="Usuń składnik"
                                (click)="deleteIngredient(ingredient)"
                                [disabled]="ingredient.usage_count > 0">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="ingredient-row"></tr>
                </table>

                <!-- Empty State -->
                <div class="empty-state" *ngIf="ingredients.data.length === 0">
                  <mat-icon class="empty-icon">inventory_2</mat-icon>
                  <h3>Nie znaleziono składników</h3>
                  <p>{{ searchQuery ? 'Spróbuj dostosować wyszukiwane frazy' : 'Zacznij od dodania pierwszego składnika' }}</p>
                </div>

                <!-- Pagination -->
                <mat-paginator
                  [length]="ingredients.meta.total"
                  [pageSize]="ingredients.meta.limit"
                  [pageIndex]="ingredients.meta.page - 1"
                  (page)="onPageChange($event)"
                  [pageSizeOptions]="[10, 25, 50, 100]"
                  showFirstLastButtons
                  aria-label="Wybierz stronę">
                </mat-paginator>
              </div>

              <!-- Loading Spinner -->
              <div class="loading-container" *ngIf="isLoading">
                <mat-spinner diameter="50"></mat-spinner>
                <p>Ładowanie składników...</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Add New Ingredient Sidebar -->
        <div class="sidebar-section">
          <mat-card class="add-ingredient-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>add_circle</mat-icon>
                Dodaj Nowy Składnik
              </mat-card-title>
              <mat-card-subtitle>Rozszerz swoją bazę składników</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <form (ngSubmit)="onSubmit()" #ingredientForm="ngForm" class="add-form">
                <mat-form-field appearance="outline" class="name-field">
                  <mat-label>Nazwa Składnika</mat-label>
                  <input
                    matInput
                    [(ngModel)]="ingredientName"
                    name="name"
                    required
                    maxlength="255"
                    #name="ngModel"
                    placeholder="np. Pomidory Ekologiczne"
                  >
                  <mat-icon matSuffix *ngIf="name.valid && ingredientName">check_circle</mat-icon>
                  <mat-error *ngIf="name.invalid && (name.dirty || name.touched)">
                    <span *ngIf="name.errors?.['required']">Nazwa jest wymagana</span>
                    <span *ngIf="name.errors?.['maxlength']">Nazwa nie może przekraczać 255 znaków</span>
                  </mat-error>
                  <mat-hint>Wprowadź opisową nazwę składnika</mat-hint>
                </mat-form-field>

                <button
                  mat-raised-button
                  color="primary"
                  type="submit"
                  [disabled]="ingredientForm.invalid || isSubmitting"
                  class="submit-button"
                >
                  <mat-spinner *ngIf="isSubmitting" diameter="20" class="button-spinner"></mat-spinner>
                  <mat-icon *ngIf="!isSubmitting">add</mat-icon>
                  {{ isSubmitting ? 'Dodawanie...' : 'Dodaj Składnik' }}
                </button>
              </form>

              <mat-divider class="form-divider"></mat-divider>

              <!-- Quick Add Suggestions -->
              <div class="quick-add-section">
                <h4>Szybkie Dodawanie</h4>
                <div class="suggestion-chips">
                  <button mat-stroked-button 
                          *ngFor="let suggestion of quickAddSuggestions"
                          (click)="quickAdd(suggestion)"
                          class="suggestion-chip">
                    <mat-icon>add</mat-icon>
                    {{ suggestion }}
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Statistics Card -->
          <mat-card class="stats-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>analytics</mat-icon>
                Statystyki
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-grid">
                <div class="stat-box">
                  <mat-icon>inventory</mat-icon>
                  <span class="stat-number">{{ ingredients.meta.total }}</span>
                  <span class="stat-text">Wszystkie Składniki</span>
                </div>
                <div class="stat-box">
                  <mat-icon>today</mat-icon>
                  <span class="stat-number">{{ todayAdded }}</span>
                  <span class="stat-text">Dodane Dzisiaj</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ingredients-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 32px;
      text-align: center;
    }

    .page-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 2.5rem;
      font-weight: 300;
      margin: 0 0 8px 0;
      color: #333;
    }

    .title-icon {
      font-size: 2.5rem;
      color: #4caf50;
    }

    .page-subtitle {
      font-size: 1.1rem;
      color: #666;
      margin: 0;
    }

    .content-layout {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 24px;
    }

    @media (max-width: 1024px) {
      .content-layout {
        grid-template-columns: 1fr;
      }
    }

    .ingredients-card {
      min-height: 600px;
    }

    .ingredients-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .ingredients-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.5rem;
    }

    .header-actions {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .search-field {
      width: 300px;
    }

    .stats-row {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #f5f5f5;
      border-radius: 8px;
      flex: 1;
    }

    .stat-item mat-icon {
      color: #4caf50;
    }

    .stat-value {
      font-size: 1.2rem;
      font-weight: 600;
      color: #333;
    }

    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }

    .table-container {
      margin-top: 16px;
    }

    .ingredients-table {
      width: 100%;
    }

    .ingredient-row:hover {
      background-color: rgba(76, 175, 80, 0.04);
    }

    .ingredient-name {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ingredient-icon {
      color: #4caf50;
      font-size: 1.2rem;
    }

    .usage-badge {
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: #666;
    }

    .empty-icon {
      font-size: 4rem;
      color: #ccc;
      margin-bottom: 16px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 300px;
      gap: 16px;
    }

    .sidebar-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .add-ingredient-card, .stats-card {
      height: fit-content;
    }

    .add-ingredient-card mat-card-title,
    .stats-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .add-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .name-field {
      width: 100%;
    }

    .submit-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 48px;
      font-weight: 500;
    }

    .button-spinner {
      margin-right: 8px;
    }

    .form-divider {
      margin: 24px 0;
    }

    .quick-add-section h4 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 1rem;
    }

    .suggestion-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .suggestion-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
    }

    .stats-card .stat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .stat-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .stat-box mat-icon {
      color: #4caf50;
      font-size: 2rem;
      margin-bottom: 8px;
    }

    .stat-number {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
    }

    .stat-text {
      font-size: 0.8rem;
      color: #666;
      margin-top: 4px;
    }

    @media (max-width: 768px) {
      .ingredients-container {
        padding: 16px;
      }

      .page-title {
        font-size: 2rem;
      }

      .search-field {
        width: 100%;
      }

      .stats-row {
        flex-direction: column;
      }

      .header-actions {
        width: 100%;
        margin-top: 16px;
      }

      .ingredients-card mat-card-header {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class IngredientsComponent implements OnInit {
  ingredients: IngredientListResponse = {
    data: [],
    meta: {
      total: 0,
      page: 1,
      limit: 10
    }
  };
  
  displayedColumns: string[] = ['name', 'created_at', 'usage_count', 'actions'];
  searchQuery = '';
  isLoading = false;
  private searchSubject = new Subject<string>();
  ingredientName = '';
  isSubmitting = false;
  todayAdded = 0;
  
  quickAddSuggestions = [
    'Pierś z kurczaka',
    'Ryż brązowy',
    'Brokuły',
    'Oliwa z oliwek',
    'Czosnek',
    'Cebula',
    'Pomidor',
    'Szpinak'
  ];

  constructor(
    private ingredientsService: IngredientsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.loadIngredients(1, this.ingredients.meta.limit, query);
    });
  }

  ngOnInit(): void {
    this.loadIngredients();
    this.calculateTodayAdded();
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onPageChange(event: PageEvent): void {
    this.loadIngredients(
      event.pageIndex + 1,
      event.pageSize,
      this.searchQuery
    );
  }

  private async loadIngredients(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Promise<void> {
    try {
      this.isLoading = true;
      this.ingredients = await this.ingredientsService.getIngredients({
        page,
        limit,
        search
      });
    } catch (error) {
      this.snackBar.open(
        error instanceof Error ? error.message : 'Nie udało się załadować składników',
        'Zamknij',
        { duration: 5000 }
      );
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    try {
      await this.ingredientsService.createIngredient({ name: this.ingredientName });
      this.snackBar.open('Składnik został utworzony pomyślnie', 'Zamknij', { duration: 3000 });
      this.ingredientName = '';
      // Refresh the list
      this.loadIngredients(
        this.ingredients.meta.page,
        this.ingredients.meta.limit,
        this.searchQuery
      );
      this.calculateTodayAdded();
    } catch (error) {
      this.snackBar.open(
        error instanceof Error ? error.message : 'Nie udało się utworzyć składnika',
        'Zamknij',
        { duration: 5000 }
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  quickAdd(ingredientName: string) {
    this.ingredientName = ingredientName;
    this.onSubmit();
  }

  editIngredient(ingredient: any) {
    // TODO: Implement edit functionality
    this.snackBar.open('Funkcja edycji będzie dostępna wkrótce!', 'Zamknij', { duration: 3000 });
  }

  deleteIngredient(ingredient: any) {
    if (ingredient.usage_count > 0) {
      this.snackBar.open('Nie można usunąć składnika używanego w przepisach', 'Zamknij', { duration: 3000 });
      return;
    }
    // TODO: Implement delete functionality
    this.snackBar.open('Funkcja usuwania będzie dostępna wkrótce!', 'Zamknij', { duration: 3000 });
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private calculateTodayAdded() {
    const today = new Date().toDateString();
    this.todayAdded = this.ingredients.data.filter(ingredient => 
      ingredient.created_at && new Date(ingredient.created_at).toDateString() === today
    ).length;
  }
} 