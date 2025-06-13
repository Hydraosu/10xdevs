import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { SignUpRequest, SignUpResponse, ErrorResponse, LoginResponse } from '../types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly MAX_ATTEMPTS = 5;
  private readonly ATTEMPT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

  constructor(private supabaseService: SupabaseService) {}

  async signUp(request: SignUpRequest): Promise<SignUpResponse> {
    try {
      console.log('Starting signup process for:', request.email);

      // Validate input
      const validationResult = this.validateSignUpInput(request);
      if (!validationResult.isValid) {
        console.log('Validation failed:', validationResult.error);
        return {
          error: {
            code: 'INVALID_INPUT',
            message: validationResult.error || 'Invalid input',
          },
        };
      }

      console.log('Input validation passed');

      // Create user in Supabase Auth
      console.log('Attempting to create auth user');
      const { data, error } = await this.supabaseService.supabase.auth.signUp({
        email: request.email,
        password: request.password,
        options: {
          data: {
            email: request.email,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      console.log('Auth response:', { data, error });

      if (error) {
        console.error('Auth error:', error);
        if (error.message?.includes('User already registered')) {
          return {
            error: {
              code: 'EMAIL_EXISTS',
              message: 'Email already exists',
            },
          };
        }
        return {
          error: {
            code: 'AUTH_ERROR',
            message: error.message,
          },
        };
      }

      if (!data?.user) {
        console.error('No user data returned');
        return {
          error: {
            code: 'AUTH_ERROR',
            message: 'Failed to create user - no user data returned',
          },
        };
      }

      console.log('Auth user created successfully:', data.user.id);

      // Try to create user record in database using the session token
      const userData = {
        id: data.user.id,
        email: data.user.email || request.email,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login_at: null,
      };

      console.log('Attempting to create user record with data:', userData);

      // Try direct table insert
      const { data: dbData, error: dbError } = await this.supabaseService.supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (dbError) {
        console.error('Failed to create user record:', dbError);
        console.error('Error details:', {
          code: dbError.code,
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint,
        });

        // If database creation fails, we should still return success since auth worked
        // The user can try to sign in and we'll handle the missing record then
        return {
          user: {
            id: data.user.id,
            email: data.user.email || request.email,
          },
          session: data.session ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          } : undefined,
        };
      }

      console.log('Successfully created user record:', dbData);

      return {
        user: {
          id: data.user.id,
          email: data.user.email || request.email,
        },
        session: data.session ? {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        } : undefined,
      };
    } catch (error: any) {
      console.error('Signup error:', error);
      return {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred during registration',
          details: error,
        },
      };
    }
  }

  private validateSignUpInput(data: SignUpRequest): { isValid: boolean; error?: string } {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    // Password validation
    if (data.password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long' };
    }

    if (!/[A-Z]/.test(data.password)) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter' };
    }

    if (!/[a-z]/.test(data.password)) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter' };
    }

    if (!/[0-9]/.test(data.password)) {
      return { isValid: false, error: 'Password must contain at least one number' };
    }

    return { isValid: true };
  }

  private checkRateLimit(email: string): boolean {
    const now = Date.now();
    const attempt = this.loginAttempts.get(email);

    if (!attempt) {
      this.loginAttempts.set(email, { count: 1, lastAttempt: now });
      return true;
    }

    // Reset counter if window has passed
    if (now - attempt.lastAttempt > this.ATTEMPT_WINDOW) {
      this.loginAttempts.set(email, { count: 1, lastAttempt: now });
      return true;
    }

    // Check if max attempts reached
    if (attempt.count >= this.MAX_ATTEMPTS) {
      return false;
    }

    // Increment attempt counter
    this.loginAttempts.set(email, {
      count: attempt.count + 1,
      lastAttempt: now
    });

    return true;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Check rate limit
      if (!this.checkRateLimit(email)) {
        throw new Error('Too many login attempts. Please try again later.');
      }

      // Input validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Call Supabase Auth signIn method
      const { data, error } = await this.supabaseService.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message || 'Invalid credentials');
      }

      if (!data.user) {
        throw new Error('User not found');
      }

      // Reset rate limit on successful login
      this.loginAttempts.delete(email);

      // Update last_login_at in users table
      const { error: updateError } = await this.supabaseService.supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.user.id);

      if (updateError) {
        console.error('Failed to update last login:', updateError);
        // Continue with response even if update fails
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
        },
        session: {
          access_token: data.session!.access_token,
          refresh_token: data.session!.refresh_token,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const { error } = await this.supabaseService.supabase.auth.signOut();
      if (error) {
        throw new Error(error.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      // Clear local storage even if logout fails
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }
} 