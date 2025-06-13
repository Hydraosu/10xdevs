import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { IngredientListParams, IngredientListResponse, CreateIngredientRequest, IngredientResponse } from '../../types';

interface CacheEntry {
  data: IngredientListResponse;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class IngredientsService {
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_LIMIT = 10;
  private readonly MAX_LIMIT = 100;
  private readonly MAX_SEARCH_LENGTH = 255;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private cache: Map<string, CacheEntry> = new Map();

  constructor(private readonly supabaseService: SupabaseService) {}

  private getCacheKey(params: IngredientListParams): string {
    return JSON.stringify({
      page: params.page || this.DEFAULT_PAGE,
      limit: params.limit || this.DEFAULT_LIMIT,
      search: params.search || ''
    });
  }

  private isCacheValid(cacheKey: string): boolean {
    const entry = this.cache.get(cacheKey);
    if (!entry) return false;
    return Date.now() - entry.timestamp < this.CACHE_TTL;
  }

  private validateParams(params: IngredientListParams): void {
    if (params.page !== undefined && params.page < 1) {
      throw new Error('Page number must be greater than 0');
    }

    if (params.limit !== undefined) {
      if (params.limit < 1) {
        throw new Error('Limit must be greater than 0');
      }
      if (params.limit > this.MAX_LIMIT) {
        throw new Error(`Limit cannot exceed ${this.MAX_LIMIT}`);
      }
    }

    if (params.search && params.search.length > this.MAX_SEARCH_LENGTH) {
      throw new Error(`Search query cannot exceed ${this.MAX_SEARCH_LENGTH} characters`);
    }
  }

  async getIngredients(params: IngredientListParams): Promise<IngredientListResponse> {
    try {
      // Validate input parameters
      this.validateParams(params);

      // Check cache
      const cacheKey = this.getCacheKey(params);
      if (this.isCacheValid(cacheKey)) {
        return this.cache.get(cacheKey)!.data;
      }

      // SECURITY: Get current user first
      const { data: { user }, error: authError } = await this.supabaseService.supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Set default values
      const page = params.page || this.DEFAULT_PAGE;
      const limit = params.limit || this.DEFAULT_LIMIT;
      const offset = (page - 1) * limit;

      // Build query with user_id filtering
      let query = this.supabaseService.supabase
        .from('ingredients')
        .select('id, name, created_at', { count: 'exact' })
        .eq('is_active', true)
        .eq('user_id', user.id); // SECURITY: Only user's ingredients

      // Add search filter if provided
      if (params.search) {
        query = query.ilike('name', `%${params.search}%`);
      }

      // Add pagination
      query = query.range(offset, offset + limit - 1);

      // Execute query
      const { data: ingredients, error, count } = await query;

      if (error) {
        throw error;
      }

      // Transform response
      const response: IngredientListResponse = {
        data: ingredients.map(ingredient => ({
          id: ingredient.id,
          name: ingredient.name,
          created_at: ingredient.created_at
        })),
        meta: {
          total: count || 0,
          page,
          limit
        }
      };

      // Update cache
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });

      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch ingredients: ${error.message}`);
      }
      throw new Error('Failed to fetch ingredients: Unknown error occurred');
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  async createIngredient(request: CreateIngredientRequest): Promise<IngredientResponse> {
    // Validate input
    if (!request.name || request.name.trim().length === 0) {
      throw new Error('Name is required');
    }

    if (request.name.length > 255) {
      throw new Error('Name cannot exceed 255 characters');
    }

    // SECURITY: Get current user first
    const { data: { user }, error: authError } = await this.supabaseService.supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Check for duplicate name within user's ingredients
    const { data: existingIngredient } = await this.supabaseService.supabase
      .from('ingredients')
      .select('id')
      .eq('name', request.name.trim())
      .eq('user_id', user.id) // Only check user's own ingredients
      .single();

    if (existingIngredient) {
      throw new Error('Ingredient with this name already exists in your collection');
    }

    // Create new ingredient with user_id
    const { data: newIngredient, error } = await this.supabaseService.supabase
      .from('ingredients')
      .insert([
        {
          name: request.name.trim(),
          user_id: user.id, // SECURITY: Assign to current user
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create ingredient');
    }

    // Clear cache to force refresh
    this.clearCache();

    return newIngredient as IngredientResponse;
  }
} 