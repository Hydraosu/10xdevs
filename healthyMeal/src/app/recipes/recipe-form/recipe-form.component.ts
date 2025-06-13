import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RecipesService } from '../../recipes.service';
import { CreateRecipeRequest } from '../../../types';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { SupabaseService } from '../../supabase.service';


interface Ingredient {
  id: string; // UUID
  name: string;
}

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatTooltipModule,
    MatListModule,
    MatExpansionModule,
    MatStepperModule,
    MatRadioModule
  ],
  templateUrl: './recipe-form.component.html',
  styleUrls: ['./recipe-form.component.scss']
})
export class RecipeFormComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  
  recipeForm: FormGroup;
  difficulties = ['easy', 'medium', 'hard'];
  isLoading = false;
  availableIngredients: Ingredient[] = [];

  constructor(
    private fb: FormBuilder,
    private recipesService: RecipesService,
    private supabaseService: SupabaseService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.recipeForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      instructions: ['', [Validators.required, Validators.maxLength(5000)]],
      cooking_time: ['', [Validators.required, Validators.min(1)]],
      difficulty: ['', Validators.required],
      calories: ['', [Validators.required, Validators.min(0)]],
      protein: ['', [Validators.required, Validators.min(0)]],
      carbs: ['', [Validators.required, Validators.min(0)]],
      fat: ['', [Validators.required, Validators.min(0)]],
      ingredients: this.fb.array([])
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadIngredients();
    this.addIngredient(); // Add first ingredient row by default
  }

  get ingredients(): FormArray {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  createIngredientGroup(): FormGroup {
    return this.fb.group({
      ingredient_id: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      unit: ['', Validators.required]
    });
  }

  addIngredient(): void {
    this.ingredients.push(this.createIngredientGroup());
    // Scroll to the bottom of the ingredients list
    setTimeout(() => {
      const lastIngredient = document.querySelector('.ingredient-row:last-child');
      lastIngredient?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
  }

  private async loadIngredients(): Promise<void> {
    try {
      // SECURITY: Get current user first
      const { data: { user }, error: authError } = await this.supabaseService.supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: ingredients, error } = await this.supabaseService.supabase
        .from('ingredients')
        .select('id, name')
        .eq('user_id', user.id) // SECURITY: Only user's ingredients
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw error;
      }

      this.availableIngredients = ingredients || [];
      
      // If user has no ingredients, suggest creating some
      if (this.availableIngredients.length === 0) {
        this.snackBar.open('Nie masz jeszcze składników. Dodaj składniki w zakładce Składniki.', 'Zamknij', {
          duration: 8000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['info-snackbar']
        });
      }
    } catch (error) {
      console.error('Error loading ingredients:', error);
      this.snackBar.open('Nie udało się załadować składników. Spróbuj ponownie.', 'Zamknij', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.recipeForm.valid) {
      try {
        this.isLoading = true;
        const recipeData = this.recipeForm.value;

        // Convert instructions text to array and then to JSON string for consistency with AI generator
        const instructionsArray = this.convertInstructionsToArray(recipeData.instructions);
        const processedData = {
          ...recipeData,
          instructions: JSON.stringify(instructionsArray)
        };
        
        console.log('Submitting recipe data:', processedData);
        await this.recipesService.createRecipe(processedData);
      
        this.snackBar.open('Przepis został utworzony pomyślnie!', 'Zamknij', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      
        this.router.navigate(['/app/recipes']);
      } catch (error) {
        console.error('Error creating recipe:', error);
        const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
        this.snackBar.open(`Nie udało się utworzyć przepisu: ${errorMessage}`, 'Zamknij', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched(this.recipeForm);
      this.snackBar.open('Proszę wypełnić wszystkie wymagane pola.', 'Zamknij', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    }
  }

  private findFirstInvalidStep(): number {
    const controls = [
      this.recipeForm.get('title'),
      this.recipeForm.get('cooking_time'),
      this.recipeForm.get('calories'),
      this.recipeForm.get('instructions'),
      this.recipeForm.get('ingredients')
    ];

    for (let i = 0; i < controls.length; i++) {
      if (controls[i]?.invalid) {
        return i;
      }
    }

    return -1;
  }

  private convertInstructionsToArray(instructions: string): string[] {
    if (!instructions || !instructions.trim()) {
      return [];
    }

    // Split by line breaks and clean up
    const lines = instructions
      .split(/\n|\r\n|\r/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // If there's only one line, try to split by numbered steps
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

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(group => {
          if (group instanceof FormGroup) {
            this.markFormGroupTouched(group);
          }
        });
      }
    });
  }
} 