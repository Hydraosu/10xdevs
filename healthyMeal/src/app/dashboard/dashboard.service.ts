import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface DashboardStats {
  totalRecipes: number;
  totalIngredients: number; // Distinct ingredients used by user
  totalActiveDays: number; // Days since first recipe (was totalUsers)
}

export interface ActivityItem {
  id: string;
  type: 'recipe_added' | 'favorite_added';
  title: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private statsSubject = new BehaviorSubject<DashboardStats>({
    totalRecipes: 0,
    totalIngredients: 0,
    totalActiveDays: 0
  });

  private activitiesSubject = new BehaviorSubject<ActivityItem[]>([]);

  constructor(private supabase: SupabaseService) {}

  getStats(): Observable<DashboardStats> {
    return from(this.fetchStats()).pipe(
      map(stats => {
        this.statsSubject.next(stats);
        return stats;
      }),
      catchError(error => {
        console.error('Error fetching dashboard stats:', error);
        throw error;
      })
    );
  }

  getActivities(): Observable<ActivityItem[]> {
    return from(this.fetchActivities()).pipe(
      map(activities => {
        this.activitiesSubject.next(activities);
        return activities;
      }),
      catchError(error => {
        console.error('Error fetching activities:', error);
        throw error;
      })
    );
  }

  private async fetchStats(): Promise<DashboardStats> {
    // Get current user first for security filtering
    const { data: { user }, error: authError } = await this.supabase.supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // First get user's recipe IDs
    const { data: userRecipes, error: recipesError } = await this.supabase.supabase
      .from('recipes')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (recipesError) {
      throw new Error('Failed to fetch user recipes');
    }

    const userRecipeIds = userRecipes?.map(r => r.id) || [];
    const recipesCount = userRecipes?.length || 0;

    // Count distinct ingredients used in user's recipes
    let ingredientsUsedCount = 0;
    if (userRecipeIds.length > 0) {
      const { count } = await this.supabase.supabase
        .from('recipe_ingredients')
        .select('ingredient_id', { count: 'exact', head: true })
        .in('recipe_id', userRecipeIds);
      
      ingredientsUsedCount = count || 0;
    }

    // Calculate days since first recipe
    let activeDays = 0;
    if (userRecipes && userRecipes.length > 0) {
      const { data: firstRecipe } = await this.supabase.supabase
        .from('recipes')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      
      if (firstRecipe) {
        const firstDate = new Date(firstRecipe.created_at);
        const today = new Date();
        activeDays = Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
      }
    }

    return {
      totalRecipes: recipesCount,
      totalIngredients: ingredientsUsedCount,
      totalActiveDays: activeDays
    };
  }

  private async fetchActivities(): Promise<ActivityItem[]> {
    // Return mock activities since 'activities' table doesn't exist yet
    // This can be implemented later when the table is created
    return [
      {
        id: '1',
        type: 'recipe_added',
        title: 'Welcome to HealthyMeal',
        timestamp: new Date()
      }
    ];
  }

  // Helper method to format timestamp
  formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else {
      return 'Just now';
    }
  }
} 