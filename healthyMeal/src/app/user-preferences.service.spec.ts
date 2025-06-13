import { TestBed } from '@angular/core/testing';
import { UserPreferencesService } from './user-preferences.service';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';
import { UserPreferencesResponse } from '../types';

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSupabaseClient: any;

  const mockPreferences: UserPreferencesResponse = {
    id: '123',
    daily_calories: 2000,
    protein_percentage: 30,
    carbs_percentage: 40,
    fat_percentage: 30,
    allergens: ['nuts', 'dairy'],
    micro_nutrients: { iron: 18, calcium: 1000 },
    measurement_system: 'metric'
  };

  beforeEach(() => {
    mockSupabaseClient = {
      auth: {
        getUser: jasmine.createSpy('getUser')
      },
      from: jasmine.createSpy('from')
    };

    const supabaseSpy = jasmine.createSpyObj('SupabaseService', [], {
      supabase: mockSupabaseClient
    });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        UserPreferencesService,
        { provide: SupabaseService, useValue: supabaseSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(UserPreferencesService);
    mockSupabaseService = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    // Setup default router mock behavior
    mockRouter.navigate.and.returnValue(Promise.resolve(true));
  });

  describe('getUserPreferences', () => {
    it('should return user preferences when authenticated', async () => {
      // Mock auth response
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: { user: { id: '123' } },
        error: null
      }));

      // Mock database response
      const mockQueryBuilder = {
        select: jasmine.createSpy('select').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            single: jasmine.createSpy('single').and.returnValue(Promise.resolve({
              data: mockPreferences,
              error: null
            }))
          })
        })
      };

      mockSupabaseClient.from.and.returnValue(mockQueryBuilder);

      const result = await service.getUserPreferences();
      expect(result).toEqual(mockPreferences);
    });

    it('should throw error when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: { user: null },
        error: null
      }));

      await expectAsync(service.getUserPreferences())
        .toBeRejectedWithError('Please log in to view preferences');
        
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should throw error when preferences not found', async () => {
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: { user: { id: '123' } },
        error: null
      }));

      const mockQueryBuilder = {
        select: jasmine.createSpy('select').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            single: jasmine.createSpy('single').and.returnValue(Promise.resolve({
              data: null,
              error: null
            }))
          })
        })
      };

      mockSupabaseClient.from.and.returnValue(mockQueryBuilder);

      await expectAsync(service.getUserPreferences())
        .toBeRejectedWithError('User preferences not found');
    });

    it('should use cache when available and valid', async () => {
      // Set up cache
      (service as any).cache = {
        data: mockPreferences,
        timestamp: Date.now()
      };

      const result = await service.getUserPreferences();
      expect(result).toEqual(mockPreferences);
      expect(mockSupabaseClient.auth.getUser).not.toHaveBeenCalled();
    });

    it('should clear cache when requested', () => {
      // Set up cache
      (service as any).cache = {
        data: mockPreferences,
        timestamp: Date.now()
      };

      service.clearPreferencesCache();
      expect((service as any).cache).toBeNull();
    });
  });
}); 