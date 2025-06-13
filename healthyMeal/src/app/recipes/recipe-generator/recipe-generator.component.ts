import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { OpenRouterService, RecipeGenerationResponse } from '../../core/openrouter.service';
import { UserPreferencesService } from '../../user-preferences.service';
import { SupabaseService } from '../../supabase.service';
import { UserPreferencesResponse, Json } from '../../../types';


@Component({
  selector: 'app-recipe-generator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="recipe-generator-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Generuj Przepis</mat-card-title>
          <mat-card-subtitle>Powiedz nam, co chciałbyś zjeść, a stworzymy dla Ciebie przepis!</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="recipeForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Co chciałbyś zjeść?</mat-label>
              <textarea
                matInput
                formControlName="prompt"
                placeholder="np. Chcę zdrowy wegetariański obiad z dużą ilością białka"
                rows="3"
              ></textarea>
              <mat-error *ngIf="recipeForm.get('prompt')?.hasError('required')">
                Proszę opisać, co chciałbyś zjeść
              </mat-error>
            </mat-form-field>

            <div class="preferences-section" *ngIf="userPreferences">
              <h3>Twoje Preferencje</h3>
              <div class="preferences-info">
                <p *ngIf="userPreferences.daily_calories">
                  <strong>Dzienne Kalorie:</strong> {{ userPreferences.daily_calories }}
                </p>
                <div *ngIf="parsedAllergens.length > 0">
                  <h3>Alergeny do Unikania:</h3>
                  <mat-chip-listbox>
                    <mat-chip-row *ngFor="let allergen of parsedAllergens">
                      {{ allergen }}
                    </mat-chip-row>
                  </mat-chip-listbox>
                </div>
              </div>
            </div>

            <div class="actions">
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="recipeForm.invalid || isGenerating"
              >
                <mat-spinner
                  *ngIf="isGenerating"
                  diameter="20"
                  class="spinner"
                ></mat-spinner>
                Generuj Przepis
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="generatedRecipe" class="recipe-card">
        <mat-card-header>
          <mat-card-title>{{ generatedRecipe.recipe.title }}</mat-card-title>
          <mat-card-subtitle>{{ generatedRecipe.recipe.description }}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="nutrition-info">
            <div class="nutrition-item">
              <span class="label">Kalorie</span>
              <span class="value">{{ generatedRecipe.recipe.nutrition.calories }}</span>
            </div>
            <div class="nutrition-item">
              <span class="label">Białko</span>
              <span class="value">{{ generatedRecipe.recipe.nutrition.protein }}g</span>
            </div>
            <div class="nutrition-item">
              <span class="label">Węglowodany</span>
              <span class="value">{{ generatedRecipe.recipe.nutrition.carbs }}g</span>
            </div>
            <div class="nutrition-item">
              <span class="label">Tłuszcze</span>
              <span class="value">{{ generatedRecipe.recipe.nutrition.fat }}g</span>
            </div>
          </div>

          <h3>Składniki</h3>
          <ul class="ingredients-list">
            <li *ngFor="let ingredient of generatedRecipe.recipe.ingredients">
              {{ ingredient.amount }} {{ ingredient.unit }} {{ ingredient.name }}
            </li>
          </ul>

          <h3>Instrukcje</h3>
          <ol class="instructions-list">
            <li *ngFor="let instruction of generatedRecipe.recipe.instructions">
              {{ instruction }}
            </li>
          </ol>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .recipe-generator-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .full-width {
      width: 100%;
    }

    .preferences-section {
      margin: 24px 0;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .preferences-section h3 {
      margin-bottom: 16px;
      color: rgba(0, 0, 0, 0.87);
    }

    .preferences-info {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .preferences-info p {
      margin: 0;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .spinner {
      display: inline-block;
      margin-right: 8px;
    }

    .recipe-card {
      margin-top: 24px;
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

    .ingredients-list {
      list-style: none;
      padding: 0;
      margin: 16px 0;
    }

    .ingredients-list li {
      padding: 8px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }

    .instructions-list {
      margin: 16px 0;
      padding-left: 24px;
    }

    .instructions-list li {
      margin-bottom: 16px;
      line-height: 1.5;
    }

    @media (max-width: 600px) {
      .recipe-generator-container {
        padding: 16px;
      }

      .nutrition-info {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class RecipeGeneratorComponent implements OnInit {
  recipeForm: FormGroup;
  isGenerating = false;
  generatedRecipe: RecipeGenerationResponse | null = null;
  userPreferences: UserPreferencesResponse | null = null;
  parsedAllergens: string[] = [];

  constructor(
    private fb: FormBuilder,
    private openRouterService: OpenRouterService,
    private userPreferencesService: UserPreferencesService,
    private supabaseService: SupabaseService,
    private snackBar: MatSnackBar
  ) {
    this.recipeForm = this.fb.group({
      prompt: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  async ngOnInit() {
    await this.loadUserPreferences();
  }

  private async loadUserPreferences() {
    try {
      const preferences = await this.userPreferencesService.getUserPreferences();
      this.userPreferences = preferences;
      this.parsedAllergens = this.parseAllergens(preferences.allergens);
    } catch (error) {
      console.error('Error loading user preferences:', error);
              this.snackBar.open('Nie udało się załadować preferencji użytkownika. Proszę najpierw zaktualizować swoje preferencje.', 'Zamknij', {
          duration: 5000
        });
    }
  }

  private parseAllergens(allergens: Json): string[] {
    if (Array.isArray(allergens)) {
      return allergens.filter((a): a is string => typeof a === 'string');
    }
    return [];
  }

  onSubmit() {
    if (this.recipeForm.valid) {
      this.isGenerating = true;
      const formValue = this.recipeForm.value;

      const request = {
        prompt: formValue.prompt,
        preferences: {
          calories: this.userPreferences?.daily_calories || undefined,
          allergens: this.parsedAllergens
        }
      };

      this.openRouterService.generateRecipe(request).subscribe({
        next: async (response) => {
          this.generatedRecipe = response;
          try {
            await this.saveRecipeAndIngredients(response);
            this.snackBar.open('Przepis i składniki zostały zapisane pomyślnie!', 'Zamknij', {
              duration: 3000
            });
          } catch (error) {
            console.error('Error saving recipe and ingredients:', error);
            this.snackBar.open('Nie udało się zapisać przepisu i składników. Spróbuj ponownie.', 'Zamknij', {
              duration: 5000
            });
          }
          this.isGenerating = false;
        },
        error: (error) => {
          console.error('Error generating recipe:', error);
          this.snackBar.open('Nie udało się wygenerować przepisu. Spróbuj ponownie.', 'Zamknij', {
            duration: 5000
          });
          this.isGenerating = false;
        }
      });
    }
  }

  private async saveRecipeAndIngredients(recipeResponse: RecipeGenerationResponse) {
    try {
      console.log('Starting to save recipe and ingredients...');
      
      const { data: { user } } = await this.supabaseService.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      console.log('User authenticated:', user.id);

      // Start a transaction
      console.log('Saving recipe:', recipeResponse.recipe.title);
      const { data: recipe, error: recipeError } = await this.supabaseService.supabase
        .from('recipes')
        .insert([
          {
            title: recipeResponse.recipe.title,
            description: recipeResponse.recipe.description,
            instructions: JSON.stringify(recipeResponse.recipe.instructions),
            cooking_time: recipeResponse.recipe.cooking_time,
            difficulty: recipeResponse.recipe.difficulty,
            calories: recipeResponse.recipe.nutrition.calories,
            protein: recipeResponse.recipe.nutrition.protein,
            carbs: recipeResponse.recipe.nutrition.carbs,
            fat: recipeResponse.recipe.nutrition.fat,
            created_at: new Date().toISOString(),
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (recipeError) {
        console.error('Error saving recipe:', recipeError);
        throw recipeError;
      }
      console.log('Recipe saved successfully:', recipe);

      // Save ingredients
      console.log('Starting to save ingredients...');
      const ingredientPromises = recipeResponse.recipe.ingredients.map(async (ingredient) => {
        console.log('Processing ingredient:', ingredient.name);
        
        // Parse the amount from the ingredient string
        const amountMatch = ingredient.amount.match(/^(\d+(?:\.\d+)?)/);
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
        
        // First, check if ingredient exists in user's collection
        const { data: existingIngredient } = await this.supabaseService.supabase
          .from('ingredients')
          .select('id')
          .ilike('name', ingredient.name)
          .eq('user_id', user.id) // SECURITY: Only check user's ingredients
          .single();

        if (existingIngredient) {
          console.log('Ingredient exists:', existingIngredient.id);
          // If ingredient exists, create recipe_ingredients entry
          const { error: recipeIngredientError } = await this.supabaseService.supabase
            .from('recipe_ingredients')
            .insert({
              recipe_id: recipe.id,
              ingredient_id: existingIngredient.id,
              amount: amount,
              unit: ingredient.unit
            });
          
          if (recipeIngredientError) {
            console.error('Error saving recipe ingredient:', recipeIngredientError);
            throw recipeIngredientError;
          }
          console.log('Recipe ingredient saved successfully');
        } else {
          console.log('Creating new ingredient:', ingredient.name);
          // If ingredient doesn't exist in user's collection, create it
          const { data: newIngredient, error: newIngredientError } = await this.supabaseService.supabase
            .from('ingredients')
            .insert({
              name: ingredient.name,
              user_id: user.id, // SECURITY: Assign to current user
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (newIngredientError) {
            console.error('Error creating new ingredient:', newIngredientError);
            throw newIngredientError;
          }
          console.log('New ingredient created:', newIngredient.id);

          // Then create recipe_ingredients entry
          const { error: recipeIngredientError } = await this.supabaseService.supabase
            .from('recipe_ingredients')
            .insert({
              recipe_id: recipe.id,
              ingredient_id: newIngredient.id,
              amount: amount,
              unit: ingredient.unit
            });

          if (recipeIngredientError) {
            console.error('Error saving recipe ingredient:', recipeIngredientError);
            throw recipeIngredientError;
          }
          console.log('Recipe ingredient saved successfully');
        }
      });

      await Promise.all(ingredientPromises);
      console.log('All ingredients saved successfully');
    } catch (error) {
      console.error('Error in saveRecipeAndIngredients:', error);
      throw error;
    }
  }
} 