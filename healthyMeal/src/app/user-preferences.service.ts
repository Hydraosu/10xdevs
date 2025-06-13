import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { UserPreferencesResponse, ErrorResponse, UpdateUserPreferencesRequest } from '../types';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private cache: {
    data: UserPreferencesResponse | null;
    timestamp: number;
  } | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  private isCacheValid(): boolean {
    if (!this.cache) return false;
    return Date.now() - this.cache.timestamp < this.CACHE_TTL;
  }

  private clearCache(): void {
    this.cache = null;
  }

  private validatePreferences(request: UpdateUserPreferencesRequest): void {
    // Validate percentages if any are provided
    const percentages = [
      request.protein_percentage,
      request.carbs_percentage,
      request.fat_percentage
    ].filter(p => p !== undefined);

    if (percentages.length > 0) {
      const sum = percentages.reduce((a, b) => a + b, 0);
      if (sum !== 100) {
        throw new Error('Macronutrient percentages must sum to 100');
      }
    }

    // Validate individual percentages
    if (request.protein_percentage !== undefined && (request.protein_percentage < 0 || request.protein_percentage > 100)) {
      throw new Error('Protein percentage must be between 0 and 100');
    }
    if (request.carbs_percentage !== undefined && (request.carbs_percentage < 0 || request.carbs_percentage > 100)) {
      throw new Error('Carbs percentage must be between 0 and 100');
    }
    if (request.fat_percentage !== undefined && (request.fat_percentage < 0 || request.fat_percentage > 100)) {
      throw new Error('Fat percentage must be between 0 and 100');
    }

    // Validate measurement system
    if (request.measurement_system !== undefined && !['metric', 'imperial'].includes(request.measurement_system)) {
      throw new Error('Measurement system must be either "metric" or "imperial"');
    }

    // Validate daily calories
    if (request.daily_calories !== undefined && request.daily_calories < 0) {
      throw new Error('Daily calories must be a positive number');
    }
  }

  async updatePreferences(request: UpdateUserPreferencesRequest): Promise<UserPreferencesResponse> {
    try {
      // Validate input
      this.validatePreferences(request);

      // Get current user
      const { data: { user }, error: authError } = await this.supabaseService.supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        await this.router.navigate(['/login']);
        throw new Error('Please log in to update preferences');
      }

      if (!user) {
        await this.router.navigate(['/login']);
        throw new Error('Please log in to update preferences');
      }

      // First, try to get existing preferences
      const { data: existingPreferences } = await this.supabaseService.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      let preferences;
      if (!existingPreferences) {
        // Create new preferences if they don't exist
        const { data: newPreferences, error: createError } = await this.supabaseService.supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            ...request,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Database error:', createError);
          throw new Error('Failed to create user preferences');
        }

        preferences = newPreferences;
      } else {
        // Update existing preferences
        const { data: updatedPreferences, error: updateError } = await this.supabaseService.supabase
          .from('user_preferences')
          .update({
            ...request,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) {
          console.error('Database error:', updateError);
          throw new Error('Failed to update user preferences');
        }

        preferences = updatedPreferences;
      }

      if (!preferences) {
        throw new Error('Failed to save user preferences');
      }

      // Transform and cache response
      const response: UserPreferencesResponse = {
        id: preferences.id,
        daily_calories: preferences.daily_calories,
        protein_percentage: preferences.protein_percentage,
        carbs_percentage: preferences.carbs_percentage,
        fat_percentage: preferences.fat_percentage,
        allergens: preferences.allergens,
        micro_nutrients: preferences.micro_nutrients,
        measurement_system: preferences.measurement_system
      };

      this.cache = {
        data: response,
        timestamp: Date.now()
      };

      return response;
    } catch (error) {
      console.error('Error in updatePreferences:', error);
      throw error;
    }
  }

  async getUserPreferences(): Promise<UserPreferencesResponse> {
    try {
      // Check cache first
      if (this.isCacheValid() && this.cache?.data) {
        return this.cache.data;
      }

      // Get current user from Supabase
      const { data: { user }, error: authError } = await this.supabaseService.supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        await this.router.navigate(['/login']);
        throw new Error('Please log in to view preferences');
      }

      if (!user) {
        await this.router.navigate(['/login']);
        throw new Error('Please log in to view preferences');
      }

      // Query user preferences
      const { data: preferences, error: dbError } = await this.supabaseService.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to fetch user preferences');
      }

      if (!preferences) {
        throw new Error('User preferences not found');
      }

      // Transform and cache response
      const response: UserPreferencesResponse = {
        id: preferences.id,
        daily_calories: preferences.daily_calories,
        protein_percentage: preferences.protein_percentage,
        carbs_percentage: preferences.carbs_percentage,
        fat_percentage: preferences.fat_percentage,
        allergens: preferences.allergens,
        micro_nutrients: preferences.micro_nutrients,
        measurement_system: preferences.measurement_system
      };

      this.cache = {
        data: response,
        timestamp: Date.now()
      };

      return response;
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      throw error;
    }
  }

  // Method to manually clear cache (e.g., after preferences update)
  clearPreferencesCache(): void {
    this.clearCache();
  }
} 