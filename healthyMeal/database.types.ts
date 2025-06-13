export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ingredients: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          ingredient_id: string
          notes: string | null
          recipe_id: string
          unit: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          ingredient_id: string
          notes?: string | null
          recipe_id: string
          unit: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          ingredient_id?: string
          notes?: string | null
          recipe_id?: string
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_versions: {
        Row: {
          calories: number | null
          carbs: number | null
          cooking_time: number | null
          created_at: string | null
          created_by: string
          description: string | null
          difficulty: string | null
          fat: number | null
          id: string
          instructions: string
          protein: number | null
          recipe_id: string
          title: string
          version: number
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          cooking_time?: number | null
          created_at?: string | null
          created_by: string
          description?: string | null
          difficulty?: string | null
          fat?: number | null
          id?: string
          instructions: string
          protein?: number | null
          recipe_id: string
          title: string
          version: number
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          cooking_time?: number | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          difficulty?: string | null
          fat?: number | null
          id?: string
          instructions?: string
          protein?: number | null
          recipe_id?: string
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_versions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          calories: number | null
          carbs: number | null
          cooking_time: number | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          fat: number | null
          id: string
          instructions: string
          is_active: boolean | null
          protein: number | null
          title: string
          updated_at: string | null
          user_id: string
          version: number | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          cooking_time?: number | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          fat?: number | null
          id?: string
          instructions: string
          is_active?: boolean | null
          protein?: number | null
          title: string
          updated_at?: string | null
          user_id: string
          version?: number | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          cooking_time?: number | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          fat?: number | null
          id?: string
          instructions?: string
          is_active?: boolean | null
          protein?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          created_at: string | null
          field_name: string
          id: string
          language_code: string
          record_id: string
          table_name: string
          translated_text: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          field_name: string
          id?: string
          language_code: string
          record_id: string
          table_name: string
          translated_text: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          field_name?: string
          id?: string
          language_code?: string
          record_id?: string
          table_name?: string
          translated_text?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          allergens: Json | null
          carbs_percentage: number | null
          created_at: string | null
          daily_calories: number | null
          fat_percentage: number | null
          id: string
          is_active: boolean | null
          measurement_system: string | null
          micro_nutrients: Json | null
          protein_percentage: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allergens?: Json | null
          carbs_percentage?: number | null
          created_at?: string | null
          daily_calories?: number | null
          fat_percentage?: number | null
          id?: string
          is_active?: boolean | null
          measurement_system?: string | null
          micro_nutrients?: Json | null
          protein_percentage?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allergens?: Json | null
          carbs_percentage?: number | null
          created_at?: string | null
          daily_calories?: number | null
          fat_percentage?: number | null
          id?: string
          is_active?: boolean | null
          measurement_system?: string | null
          micro_nutrients?: Json | null
          protein_percentage?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences_history: {
        Row: {
          changed_at: string | null
          changed_by: string
          changes: Json
          id: string
          user_preferences_id: string
        }
        Insert: {
          changed_at?: string | null
          changed_by: string
          changes: Json
          id?: string
          user_preferences_id: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string
          changes?: Json
          id?: string
          user_preferences_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_history_user_preferences_id_fkey"
            columns: ["user_preferences_id"]
            isOneToOne: false
            referencedRelation: "user_preferences"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
