import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { RecipeListResponse, RecipeListParams, CreateRecipeRequest, RecipeResponse } from '../types';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  private cache: {
    data: RecipeListResponse | null;
    params: RecipeListParams;
    timestamp: number;
  } | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private supabaseService: SupabaseService) {}

  private isCacheValid(params: RecipeListParams): boolean {
    if (!this.cache) return false;
    if (Date.now() - this.cache.timestamp > this.CACHE_TTL) return false;
    
    // Check if cached params match current params
    return JSON.stringify(this.cache.params) === JSON.stringify(params);
  }

  private clearCache(): void {
    this.cache = null;
  }

  private validateParams(params: RecipeListParams): void {
    if (params.page !== undefined && params.page < 1) {
      throw new Error('Page number must be greater than 0');
    }
    if (params.limit !== undefined && params.limit < 1) {
      throw new Error('Limit must be greater than 0');
    }
    if (params.sort !== undefined && !['created_at', 'updated_at', 'title'].includes(params.sort)) {
      throw new Error('Invalid sort field');
    }
    if (params.order !== undefined && !['asc', 'desc'].includes(params.order)) {
      throw new Error('Invalid order value');
    }
  }

  async getRecipes(params: RecipeListParams = {}): Promise<RecipeListResponse> {
    try {
      // Validate input parameters
      this.validateParams(params);

      // Set default values
      const page = params.page || 1;
      const limit = params.limit || 10;
      const sort = params.sort || 'created_at';
      const order = params.order || 'desc';

      // Check cache
      if (this.isCacheValid({ page, limit, sort, order })) {
        return this.cache!.data!;
      }

      // Get current user
      const { data: { user }, error: authError } = await this.supabaseService.supabase.auth.getUser();
      
      if (authError) {
        throw new Error('Authentication error: ' + authError.message);
      }

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Calculate offset
      const offset = (page - 1) * limit;

      // Query recipes with pagination and sorting
      const { data: recipes, error: recipesError, count } = await this.supabaseService.supabase
        .from('recipes')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order(sort, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1);

      if (recipesError) {
        throw new Error('Database error: ' + recipesError.message);
      }

      // Transform response
      const response: RecipeListResponse = {
        data: recipes.map(recipe => ({
          id: recipe.id,
          title: recipe.title,
          description: recipe.description,
          cooking_time: recipe.cooking_time,
          difficulty: recipe.difficulty,
          calories: recipe.calories,
          created_at: recipe.created_at
        })),
        meta: {
          total: count || 0,
          page,
          limit
        }
      };

      // Update cache
      this.cache = {
        data: response,
        params: { page, limit, sort, order },
        timestamp: Date.now()
      };

      return response;
    } catch (error) {
      console.error('Error in getRecipes:', error);
      throw error;
    }
  }

  // Method to manually clear cache (e.g., after recipe update)
  clearRecipesCache(): void {
    this.clearCache();
  }

  private validateRecipeInput(request: CreateRecipeRequest): void {
    // Validate required fields
    if (!request.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!request.instructions?.trim()) {
      throw new Error('Instructions are required');
    }
    if (!request.ingredients?.length) {
      throw new Error('At least one ingredient is required');
    }

    // Validate difficulty
    if (request.difficulty && !['easy', 'medium', 'hard'].includes(request.difficulty)) {
      throw new Error('Invalid difficulty value');
    }

    // Validate numeric ranges
    if (request.cooking_time !== undefined && request.cooking_time < 0) {
      throw new Error('Cooking time must be positive');
    }
    if (request.calories !== undefined && request.calories < 0) {
      throw new Error('Calories must be positive');
    }
    if (request.protein !== undefined && request.protein < 0) {
      throw new Error('Protein must be positive');
    }
    if (request.carbs !== undefined && request.carbs < 0) {
      throw new Error('Carbs must be positive');
    }
    if (request.fat !== undefined && request.fat < 0) {
      throw new Error('Fat must be positive');
    }

    // Validate ingredients
    request.ingredients.forEach((ingredient, index) => {
      if (!ingredient.ingredient_id) {
        throw new Error(`Ingredient ${index + 1}: ID is required`);
      }
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(ingredient.ingredient_id)) {
        throw new Error(`Ingredient ${index + 1}: Invalid ID format. Must be a valid UUID`);
      }

      if (!ingredient.amount || ingredient.amount <= 0) {
        throw new Error(`Ingredient ${index + 1}: Amount must be positive`);
      }
      if (!ingredient.unit?.trim()) {
        throw new Error(`Ingredient ${index + 1}: Unit is required`);
      }
    });
  }

  async createRecipe(request: CreateRecipeRequest): Promise<RecipeResponse> {
    try {
      // Validate input
      this.validateRecipeInput(request);

      // Get current user
      const { data: { user }, error: authError } = await this.supabaseService.supabase.auth.getUser();
      
      if (authError) {
        throw new Error('Authentication error: ' + authError.message);
      }

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Start transaction
      const { data: recipe, error: recipeError } = await this.supabaseService.supabase
        .from('recipes')
        .insert({
          user_id: user.id,
          title: request.title,
          description: request.description,
          instructions: request.instructions,
          cooking_time: request.cooking_time,
          difficulty: request.difficulty,
          calories: request.calories,
          protein: request.protein,
          carbs: request.carbs,
          fat: request.fat,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          version: 1
        })
        .select()
        .single();

      if (recipeError) {
        throw new Error('Failed to create recipe: ' + recipeError.message);
      }

      if (!recipe) {
        throw new Error('Failed to create recipe: No data returned');
      }

      // Create recipe ingredients
      const recipeIngredients = request.ingredients.map(ingredient => ({
        recipe_id: recipe.id,
        ingredient_id: ingredient.ingredient_id,
        amount: ingredient.amount,
        unit: ingredient.unit,
        notes: ingredient.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: ingredientsError } = await this.supabaseService.supabase
        .from('recipe_ingredients')
        .insert(recipeIngredients);

      if (ingredientsError) {
        // Rollback recipe creation if ingredient creation fails
        await this.supabaseService.supabase
          .from('recipes')
          .delete()
          .eq('id', recipe.id);
        
        throw new Error('Failed to create recipe ingredients: ' + ingredientsError.message);
      }

      // Get ingredient names
      const ingredientIds = request.ingredients.map(ing => ing.ingredient_id);
      const { data: ingredientData, error: ingredientNameError } = await this.supabaseService.supabase
        .from('ingredients')
        .select('id, name')
        .in('id', ingredientIds);

      if (ingredientNameError) {
        throw new Error('Failed to fetch ingredient names: ' + ingredientNameError.message);
      }

      // Create a map of ingredient IDs to names
      const ingredientMap = new Map(ingredientData?.map(ing => [ing.id, ing.name]) || []);

      // Clear cache since we've added a new recipe
      this.clearCache();

      // Transform and return response
      return {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        instructions: recipe.instructions,
        cooking_time: recipe.cooking_time,
        difficulty: recipe.difficulty,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
        version: recipe.version,
        created_at: recipe.created_at,
        updated_at: recipe.updated_at,
        ingredients: request.ingredients.map(ing => ({
          id: ing.ingredient_id,
          name: ingredientMap.get(ing.ingredient_id) || '',
          amount: ing.amount,
          unit: ing.unit,
          notes: ing.notes || null
        }))
      };
    } catch (error) {
      console.error('Error in createRecipe:', error);
      throw error;
    }
  }
} 