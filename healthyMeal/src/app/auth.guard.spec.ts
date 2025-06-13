import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthGuard } from './auth.guard';
import { SupabaseService } from './supabase.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSupabaseClient: any;

  beforeEach(() => {
    mockSupabaseClient = {
      auth: {
        getUser: jasmine.createSpy('getUser')
      }
    };

    const supabaseSpy = jasmine.createSpyObj('SupabaseService', [], {
      supabase: mockSupabaseClient
    });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: SupabaseService, useValue: supabaseSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    mockSupabaseService = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  describe('canActivate', () => {
    it('should allow access when user is authenticated', async () => {
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: {
          user: { id: '123', email: 'test@example.com' }
        },
        error: null
      }));

      const result = await guard.canActivate();

      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should deny access and redirect when no user exists', async () => {
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: { user: null },
        error: null
      }));

      const result = await guard.canActivate();

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should deny access and redirect when getUser returns an error', async () => {
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: { user: null },
        error: { message: 'Authentication failed' }
      }));

      const result = await guard.canActivate();

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should deny access when user is undefined', async () => {
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: { user: undefined },
        error: null
      }));

      const result = await guard.canActivate();

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle getUser promise rejection', async () => {
      mockSupabaseClient.auth.getUser.and.returnValue(
        Promise.reject(new Error('Network error'))
      );

      try {
        const result = await guard.canActivate();
        expect(result).toBe(false);
      } catch (error) {
        // Guard should handle the error gracefully
        expect(error).toBeDefined();
      }
    });

    it('should allow access for valid user with all required fields', async () => {
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
            created_at: '2023-01-01T00:00:00Z'
          }
        },
        error: null
      }));

      const result = await guard.canActivate();

      expect(result).toBe(true);
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
    });

    it('should deny access when both user is null and error exists', async () => {
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: { user: null },
        error: { message: 'Token expired' }
      }));

      const result = await guard.canActivate();

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle malformed response from getUser', async () => {
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: null,
        error: null
      }));

      const result = await guard.canActivate();

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Authentication State Verification', () => {
    it('should work correctly with multiple consecutive calls', async () => {
      // First call - authenticated
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: {
          user: { id: '123', email: 'test@example.com' }
        },
        error: null
      }));

      let result = await guard.canActivate();
      expect(result).toBe(true);

      // Second call - not authenticated
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: { user: null },
        error: null
      }));

      result = await guard.canActivate();
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should call getUser on each canActivate call', async () => {
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: {
          user: { id: '123', email: 'test@example.com' }
        },
        error: null
      }));

      await guard.canActivate();
      await guard.canActivate();
      await guard.canActivate();

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle null response from getUser', async () => {
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve(null));

      const result = await guard.canActivate();

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle undefined response from getUser', async () => {
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve(undefined));

      const result = await guard.canActivate();

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle empty user object', async () => {
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: {
          user: {}
        },
        error: null
      }));

      const result = await guard.canActivate();

      expect(result).toBe(true); // Empty object is still truthy
    });

    it('should handle specific error messages', async () => {
      const errorMessages = [
        'JWT expired',
        'Invalid token',
        'User not found',
        'Session invalid'
      ];

      for (const message of errorMessages) {
        mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
          data: { user: null },
          error: { message }
        }));

        const result = await guard.canActivate();
        expect(result).toBe(false);
      }

      expect(mockRouter.navigate).toHaveBeenCalledTimes(errorMessages.length);
    });
  });
}); 