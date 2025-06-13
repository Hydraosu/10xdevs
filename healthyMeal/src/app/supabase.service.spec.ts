import { TestBed } from '@angular/core/testing';

import { SupabaseService } from './supabase.service';

describe('SupabaseService', () => {
  let service: SupabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have supabase client initialized', () => {
    expect(service.supabase).toBeTruthy();
    expect(service.supabase.auth).toBeTruthy();
    expect(service.supabase.from).toBeTruthy();
  });

  it('should have correct supabase configuration', () => {
    // Test if service is properly configured with environment variables
    expect(service.supabase).toBeDefined();
    expect(typeof service.supabase.from).toBe('function');
    expect(typeof service.supabase.auth.signUp).toBe('function');
    expect(typeof service.supabase.auth.signInWithPassword).toBe('function');
    expect(typeof service.supabase.auth.signOut).toBe('function');
  });

  it('should provide access to auth methods', () => {
    expect(service.supabase.auth.getUser).toBeDefined();
    expect(service.supabase.auth.getSession).toBeDefined();
    expect(service.supabase.auth.onAuthStateChange).toBeDefined();
  });

  it('should provide access to database methods', () => {
    const usersTable = service.supabase.from('users');
    expect(usersTable).toBeDefined();
    expect(usersTable.select).toBeDefined();
    expect(usersTable.insert).toBeDefined();
    expect(usersTable.update).toBeDefined();
    expect(usersTable.delete).toBeDefined();
  });
});
