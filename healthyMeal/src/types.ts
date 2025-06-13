import { Database } from '../database.types';

// Base types from database
type User = Database['public']['Tables']['users']['Row'];
type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];
type Recipe = Database['public']['Tables']['recipes']['Row'];
type RecipeVersion = Database['public']['Tables']['recipe_versions']['Row'];
type Ingredient = Database['public']['Tables']['ingredients']['Row'];
type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row'];
type Translation = Database['public']['Tables']['translations']['Row'];

// Common types
export type UUID = string;
export type Timestamp = string;
export type Json = Database['public']['Tables']['user_preferences']['Row']['allergens'];

// Authentication DTOs
export interface SignUpRequest {
  email: string;
  password: string;
}

export interface SignUpResponse {
  user?: {
    id: string;
    email: string;
  };
  session?: {
    access_token: string;
    refresh_token: string;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Pick<User, 'id' | 'email'>;
  session: {
    access_token: string;
    refresh_token: string;
  };
}

// User Preferences DTOs
export interface UserPreferencesResponse {
  id: UUID;
  daily_calories: number | null;
  protein_percentage: number | null;
  carbs_percentage: number | null;
  fat_percentage: number | null;
  allergens: Json;
  micro_nutrients: Json;
  measurement_system: 'metric' | 'imperial' | null;
}

export interface UpdateUserPreferencesRequest {
  daily_calories?: number;
  protein_percentage?: number;
  carbs_percentage?: number;
  fat_percentage?: number;
  allergens?: Json;
  micro_nutrients?: Json;
  measurement_system?: 'metric' | 'imperial';
}

// Recipe DTOs
export interface RecipeListItem {
  id: UUID;
  title: string;
  description: string | null;
  cooking_time: number | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  calories: number | null;
  created_at: Timestamp;
}

export interface RecipeListResponse {
  data: RecipeListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface RecipeIngredientDTO {
  id: UUID;
  name: string;
  amount: number;
  unit: string;
  notes: string | null;
}

export interface RecipeResponse {
  id: UUID;
  title: string;
  description: string | null;
  instructions: string;
  cooking_time: number | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  version: number;
  ingredients: RecipeIngredientDTO[];
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CreateRecipeRequest {
  title: string;
  description?: string;
  instructions: string;
  cooking_time?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  ingredients: Array<{
    ingredient_id: UUID;
    amount: number;
    unit: string;
    notes?: string;
  }>;
}

// Recipe Version DTOs
export interface RecipeVersionListItem {
  id: UUID;
  version: number;
  title: string;
  description: string | null;
  instructions: string;
  cooking_time: number | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  created_at: Timestamp;
}

export interface RecipeVersionsResponse {
  data: RecipeVersionListItem[];
}

// Ingredient DTOs
export interface IngredientListItem {
  id: UUID;
  name: string;
  created_at: Timestamp | null;
  usage_count?: number;
}

export interface IngredientListResponse {
  data: IngredientListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface CreateIngredientRequest {
  name: string;
}

export interface IngredientResponse {
  id: UUID;
  name: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Translation DTOs
export interface TranslationItem {
  field_name: string;
  translated_text: string;
}

export interface TranslationResponse {
  data: TranslationItem[];
}

// Error Response
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Query Parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface RecipeListParams extends PaginationParams {
  sort?: 'created_at' | 'updated_at' | 'title';
  order?: 'asc' | 'desc';
}

export interface IngredientListParams extends PaginationParams {
  search?: string;
}

export interface TranslationParams {
  table_name: string;
  record_id: UUID;
  language_code: string;
} 