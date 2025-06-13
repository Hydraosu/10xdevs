import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';
import { LoginResponse, SignUpRequest, SignUpResponse } from '../types';

describe('AuthService', () => {
  let service: AuthService;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let mockSupabaseClient: any;

  beforeEach(() => {
    mockSupabaseClient = {
      auth: {
        signInWithPassword: jasmine.createSpy('signInWithPassword'),
        signUp: jasmine.createSpy('signUp'),
        signOut: jasmine.createSpy('signOut')
      },
      from: jasmine.createSpy('from')
    };

    const supabaseSpy = jasmine.createSpyObj('SupabaseService', [], {
      supabase: mockSupabaseClient
    });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: supabaseSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    mockSupabaseService = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>;
  });

  describe('signUp', () => {
    const validSignUpRequest: SignUpRequest = {
      email: 'test@example.com',
      password: 'Password123'
    };

    it('should successfully sign up with valid credentials', async () => {
      const mockAuthResponse = {
        data: {
          user: { id: '123', email: 'test@example.com' },
          session: { access_token: 'access-token', refresh_token: 'refresh-token' }
        },
        error: null
      };

      const mockDbResponse = {
        data: { id: '123', email: 'test@example.com' },
        error: null
      };

      mockSupabaseClient.auth.signUp.and.returnValue(Promise.resolve(mockAuthResponse));
      mockSupabaseClient.from.and.returnValue({
        insert: jasmine.createSpy('insert').and.returnValue({
          select: jasmine.createSpy('select').and.returnValue({
            single: jasmine.createSpy('single').and.returnValue(Promise.resolve(mockDbResponse))
          })
        })
      });

      const result = await service.signUp(validSignUpRequest);

      expect(result.user).toEqual({
        id: '123',
        email: 'test@example.com'
      });
      expect(result.session).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token'
      });
      expect(result.error).toBeUndefined();
    });

    it('should return error for invalid email format', async () => {
      const invalidRequest: SignUpRequest = {
        email: 'invalid-email',
        password: 'Password123'
      };

      const result = await service.signUp(invalidRequest);

      expect(result.error).toEqual({
        code: 'INVALID_INPUT',
        message: 'Invalid email format'
      });
    });

    it('should return error for weak password', async () => {
      const invalidRequest: SignUpRequest = {
        email: 'test@example.com',
        password: 'weak'
      };

      const result = await service.signUp(invalidRequest);

      expect(result.error).toEqual({
        code: 'INVALID_INPUT',
        message: 'Password must be at least 8 characters long'
      });
    });

    it('should validate password requirements', async () => {
      const testCases = [
        { password: 'password123', expectedError: 'Password must contain at least one uppercase letter' },
        { password: 'PASSWORD123', expectedError: 'Password must contain at least one lowercase letter' },
        { password: 'PasswordABC', expectedError: 'Password must contain at least one number' }
      ];

      for (const testCase of testCases) {
        const request: SignUpRequest = {
          email: 'test@example.com',
          password: testCase.password
        };

        const result = await service.signUp(request);

        expect(result.error?.message).toBe(testCase.expectedError);
      }
    });

    it('should handle existing email error', async () => {
      mockSupabaseClient.auth.signUp.and.returnValue(Promise.resolve({
        data: null,
        error: { message: 'User already registered' }
      }));

      const result = await service.signUp(validSignUpRequest);

      expect(result.error).toEqual({
        code: 'EMAIL_EXISTS',
        message: 'Email already exists'
      });
    });

    it('should handle database creation failure gracefully', async () => {
      const mockAuthResponse = {
        data: {
          user: { id: '123', email: 'test@example.com' },
          session: { access_token: 'access-token', refresh_token: 'refresh-token' }
        },
        error: null
      };

      mockSupabaseClient.auth.signUp.and.returnValue(Promise.resolve(mockAuthResponse));
      mockSupabaseClient.from.and.returnValue({
        insert: jasmine.createSpy('insert').and.returnValue({
          select: jasmine.createSpy('select').and.returnValue({
            single: jasmine.createSpy('single').and.returnValue(Promise.resolve({
              data: null,
              error: { message: 'Database error' }
            }))
          })
        })
      });

      const result = await service.signUp(validSignUpRequest);

      // Should still return success since auth worked
      expect(result.user).toBeDefined();
      expect(result.session).toBeDefined();
    });

    it('should handle unexpected errors', async () => {
      mockSupabaseClient.auth.signUp.and.returnValue(Promise.reject(new Error('Network error')));

      const result = await service.signUp(validSignUpRequest);

      expect(result.error).toEqual({
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred during registration',
        details: jasmine.any(Error)
      });
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse: LoginResponse = {
        user: {
          id: '123',
          email: 'test@example.com'
        },
        session: {
          access_token: 'access-token',
          refresh_token: 'refresh-token'
        }
      };

      mockSupabaseClient.auth.signInWithPassword.and.returnValue(Promise.resolve({
        data: {
          user: { id: '123', email: 'test@example.com' },
          session: { access_token: 'access-token', refresh_token: 'refresh-token' }
        },
        error: null
      }));

      mockSupabaseClient.from.and.returnValue({
        update: jasmine.createSpy('update').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue(Promise.resolve({ error: null }))
        })
      });

      const result = await service.login('test@example.com', 'password123');
      expect(result).toEqual(mockResponse);
    });

    it('should throw error for invalid credentials', async () => {
      mockSupabaseClient.auth.signInWithPassword.and.returnValue(Promise.resolve({
        data: null,
        error: { message: 'Invalid credentials' }
      }));

      await expectAsync(service.login('test@example.com', 'wrong-password'))
        .toBeRejectedWithError('Invalid credentials');
    });

    it('should throw error for missing email or password', async () => {
      await expectAsync(service.login('', 'password123'))
        .toBeRejectedWithError('Email and password are required');
      
      await expectAsync(service.login('test@example.com', ''))
        .toBeRejectedWithError('Email and password are required');
    });

    it('should handle rate limiting', async () => {
      // First 5 attempts should succeed
      for (let i = 0; i < 5; i++) {
        mockSupabaseClient.auth.signInWithPassword.and.returnValue(Promise.resolve({
          data: null,
          error: { message: 'Invalid credentials' }
        }));

        await expectAsync(service.login('test@example.com', 'wrong-password'))
          .toBeRejectedWithError('Invalid credentials');
      }

      // 6th attempt should be rate limited
      await expectAsync(service.login('test@example.com', 'wrong-password'))
        .toBeRejectedWithError('Too many login attempts. Please try again later.');
    });

    it('should reset rate limit on successful login', async () => {
      // Fail 3 times
      for (let i = 0; i < 3; i++) {
        mockSupabaseClient.auth.signInWithPassword.and.returnValue(Promise.resolve({
          data: null,
          error: { message: 'Invalid credentials' }
        }));

        await expectAsync(service.login('test@example.com', 'wrong-password'))
          .toBeRejectedWithError('Invalid credentials');
      }

      // Then succeed
      mockSupabaseClient.auth.signInWithPassword.and.returnValue(Promise.resolve({
        data: {
          user: { id: '123', email: 'test@example.com' },
          session: { access_token: 'token', refresh_token: 'refresh' }
        },
        error: null
      }));

      mockSupabaseClient.from.and.returnValue({
        update: jasmine.createSpy('update').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue(Promise.resolve({ error: null }))
        })
      });

      await service.login('test@example.com', 'correct-password');

      // Rate limit should be reset - this should not throw
      mockSupabaseClient.auth.signInWithPassword.and.returnValue(Promise.resolve({
        data: {
          user: { id: '123', email: 'test@example.com' },
          session: { access_token: 'token', refresh_token: 'refresh' }
        },
        error: null
      }));

      await expectAsync(service.login('test@example.com', 'correct-password'))
        .not.toBeRejected();
    });

    it('should handle last_login_at update failure gracefully', async () => {
      spyOn(console, 'error');

      mockSupabaseClient.auth.signInWithPassword.and.returnValue(Promise.resolve({
        data: {
          user: { id: '123', email: 'test@example.com' },
          session: { access_token: 'token', refresh_token: 'refresh' }
        },
        error: null
      }));

      mockSupabaseClient.from.and.returnValue({
        update: jasmine.createSpy('update').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue(Promise.resolve({
            error: { message: 'Update failed' }
          }))
        })
      });

      const result = await service.login('test@example.com', 'password123');

      expect(console.error).toHaveBeenCalledWith('Failed to update last login:', { message: 'Update failed' });
      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      spyOn(localStorage, 'removeItem');
    });

    it('should successfully logout', async () => {
      mockSupabaseClient.auth.signOut.and.returnValue(Promise.resolve({ error: null }));

      await service.logout();

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
    });

    it('should handle logout errors', async () => {
      mockSupabaseClient.auth.signOut.and.returnValue(Promise.resolve({
        error: { message: 'Logout failed' }
      }));

      await expectAsync(service.logout())
        .toBeRejectedWithError('Logout failed');
    });

    it('should clean up local storage even on error', async () => {
      mockSupabaseClient.auth.signOut.and.returnValue(Promise.resolve({
        error: { message: 'Logout failed' }
      }));

      try {
        await service.logout();
      } catch (error) {
        // Expected to fail
      }

      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('Rate Limiting', () => {
    it('should track login attempts per email', async () => {
      // Test rate limiting is email-specific
      mockSupabaseClient.auth.signInWithPassword.and.returnValue(Promise.resolve({
        data: null,
        error: { message: 'Invalid credentials' }
      }));

      // 5 failed attempts for first email
      for (let i = 0; i < 5; i++) {
        await expectAsync(service.login('user1@example.com', 'wrong'))
          .toBeRejectedWithError('Invalid credentials');
      }

      // Should be blocked
      await expectAsync(service.login('user1@example.com', 'wrong'))
        .toBeRejectedWithError('Too many login attempts. Please try again later.');

      // But different email should still work
      await expectAsync(service.login('user2@example.com', 'wrong'))
        .toBeRejectedWithError('Invalid credentials');
    });
  });
}); 