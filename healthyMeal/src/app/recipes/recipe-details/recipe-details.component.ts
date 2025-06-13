import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SupabaseService } from '../../supabase.service';
import { RecipeResponse } from '../../../types';

@Component({
  selector: 'app-recipe-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="recipe-details-container">
      <div class="loading-container" *ngIf="isLoading">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!isLoading && recipe" class="recipe-content">
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ recipe.title }}</mat-card-title>
            <mat-card-subtitle>{{ recipe.description }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="recipe-meta">
              <div class="meta-item">
                <span class="label">Czas Gotowania</span>
                <span class="value">{{ formatTime(recipe.cooking_time) }}</span>
              </div>
              <div class="meta-item">
                <span class="label">Trudność</span>
                <span class="value">{{ getDifficultyText(recipe.difficulty) }}</span>
              </div>
              <div class="meta-item">
                <span class="label">Utworzono</span>
                <span class="value">{{ formatDate(recipe.created_at) }}</span>
              </div>
            </div>

            <div class="nutrition-info">
              <div class="nutrition-item">
                <span class="label">Kalorie</span>
                <span class="value">{{ recipe.calories || '-' }}</span>
              </div>
              <div class="nutrition-item">
                <span class="label">Białko</span>
                <span class="value">{{ recipe.protein || '-' }}g</span>
              </div>
              <div class="nutrition-item">
                <span class="label">Węglowodany</span>
                <span class="value">{{ recipe.carbs || '-' }}g</span>
              </div>
              <div class="nutrition-item">
                <span class="label">Tłuszcze</span>
                <span class="value">{{ recipe.fat || '-' }}g</span>
              </div>
            </div>

            <div class="section">
              <h3>Składniki</h3>
              <ul class="ingredients-list">
                <li *ngFor="let ingredient of recipe.ingredients">
                  {{ ingredient.amount }} {{ ingredient.unit }} {{ ingredient.name }}
                  <span *ngIf="ingredient.notes" class="notes">({{ ingredient.notes }})</span>
                </li>
              </ul>
            </div>

            <div class="section">
              <h3>Instrukcje</h3>
              <ol class="instructions-list">
                <li *ngFor="let instruction of parsedInstructions">
                  {{ instruction }}
                </li>
              </ol>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="!isLoading && !recipe" class="not-found">
        <mat-card>
          <mat-card-content>
            <p>Przepis nie został znaleziony</p>
            <button mat-raised-button color="primary" (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              Powrót do Przepisów
            </button>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .recipe-details-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .recipe-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .recipe-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin: 16px 0;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .meta-item .label {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .meta-item .value {
      font-size: 1.25rem;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }

    .nutrition-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
      margin: 16px 0;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .nutrition-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .nutrition-item .label {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .nutrition-item .value {
      font-size: 1.25rem;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }

    .section {
      margin: 24px 0;
    }

    .section h3 {
      margin-bottom: 16px;
      color: rgba(0, 0, 0, 0.87);
    }

    .ingredients-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .ingredients-list li {
      padding: 8px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }

    .ingredients-list .notes {
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.875rem;
      margin-left: 8px;
    }

    .instructions-list {
      margin: 0;
      padding-left: 24px;
    }

    .instructions-list li {
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .not-found {
      text-align: center;
      padding: 48px;
    }

    .not-found button {
      margin-top: 16px;
    }

    @media (max-width: 600px) {
      .recipe-details-container {
        padding: 16px;
      }

      .recipe-meta,
      .nutrition-info {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class RecipeDetailsComponent implements OnInit {
  recipe: RecipeResponse | null = null;
  isLoading = false;
  parsedInstructions: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadRecipe();
  }

  async loadRecipe() {
    try {
      this.isLoading = true;
      const recipeId = this.route.snapshot.paramMap.get('id');
      
      if (!recipeId) {
        throw new Error('Recipe ID not provided');
      }

      // SECURITY: Get current user first to filter by user_id
      const { data: { user }, error: authError } = await this.supabaseService.supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: recipe, error } = await this.supabaseService.supabase
        .from('recipes')
        .select(`
          *,
          ingredients:recipe_ingredients(
            id,
            amount,
            unit,
            notes,
            ingredient:ingredients(name)
          )
        `)
        .eq('id', recipeId)
        .eq('user_id', user.id)  // SECURITY: Only show user's own recipes
        .single();

      if (error) throw error;

      if (recipe) {
        // Transform the ingredients data to match RecipeResponse interface
        this.recipe = {
          ...recipe,
          ingredients: recipe.ingredients.map((ri: any) => ({
            id: ri.id,
            name: ri.ingredient.name,
            amount: ri.amount,
            unit: ri.unit,
            notes: ri.notes
          }))
        };
        
        // Parse instructions - handle both JSON array and plain text formats
        this.parsedInstructions = this.parseInstructions(recipe.instructions);
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
      this.snackBar.open('Nie udało się załadować przepisu. Spróbuj ponownie.', 'Zamknij', {
        duration: 5000
      });
    } finally {
      this.isLoading = false;
    }
  }

  formatTime(minutes: number | null): string {
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

  parseInstructions(instructions: string | null): string[] {
    if (!instructions) return [];

    // First try to parse as JSON array (from AI generator)
    try {
      const parsed = JSON.parse(instructions);
      if (Array.isArray(parsed)) {
        return parsed.filter(instruction => instruction && instruction.trim());
      }
    } catch (e) {
      // Not valid JSON, treat as plain text
    }

    // Handle as plain text (from manual form)
    // Split by common delimiters and clean up
    const lines = instructions
      .split(/\n|\\n|\r\n|\r/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // If no line breaks, try splitting by numbered steps
    if (lines.length === 1) {
      const numberedSteps = instructions
        .split(/\d+\.\s*/)
        .map(step => step.trim())
        .filter(step => step.length > 0);
      
      if (numberedSteps.length > 1) {
        return numberedSteps;
      }
    }

    return lines.length > 0 ? lines : [instructions.trim()];
  }

  goBack() {
          this.router.navigate(['/app/recipes']);
  }
} 