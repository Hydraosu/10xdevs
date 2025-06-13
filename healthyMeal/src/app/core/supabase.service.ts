import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public client: SupabaseClient;

  constructor() {
    this.client = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  // Helper method to handle errors
  handleError(error: any): never {
    console.error('Supabase error:', error);
    throw new Error(error.message || 'An error occurred while accessing the database');
  }
} 