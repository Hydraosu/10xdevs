import { TestBed } from '@angular/core/testing';
import { DashboardService, DashboardStats, ActivityItem } from './dashboard.service';
import { SupabaseService } from '../supabase.service';
import { of } from 'rxjs';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let mockSupabaseClient: any;

  const mockStats: DashboardStats = {
    totalRecipes: 15,
    totalIngredients: 50,
    totalActiveDays: 5
  };

  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'recipe_added',
      title: 'Nowy przepis dodany: Sałatka grecka',
      timestamp: new Date('2023-01-01T10:00:00Z')
    },
    {
      id: '2',
      type: 'favorite_added',
      title: 'Dodano do ulubionych',
      timestamp: new Date('2023-01-01T09:00:00Z')
    }
  ];

  beforeEach(() => {
    mockSupabaseClient = {
      from: jasmine.createSpy('from'),
      auth: {
        getUser: jasmine.createSpy('getUser').and.returnValue(Promise.resolve({
          data: { user: { id: 'test-user-id' } },
          error: null
        }))
      }
    };

    const supabaseSpy = jasmine.createSpyObj('SupabaseService', [], {
      supabase: mockSupabaseClient
    });

    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        { provide: SupabaseService, useValue: supabaseSpy }
      ]
    });

    service = TestBed.inject(DashboardService);
    mockSupabaseService = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>;
  });

  describe('getStats', () => {
    it('should return dashboard statistics', (done) => {
      let callCount = 0;
      
      // Mock pierwszy query: recipes.select('id').eq('user_id').eq('is_active') 
      const mockRecipesSelectQuery = {
        select: jasmine.createSpy('select').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            eq: jasmine.createSpy('eq').and.returnValue(Promise.resolve({
              data: [{ id: '1' }, { id: '2' }],
              error: null
            }))
          })
        })
      };

      // Mock drugi query: recipe_ingredients count
      const mockRecipeIngredientsQuery = {
        select: jasmine.createSpy('select').and.returnValue({
          in: jasmine.createSpy('in').and.returnValue(Promise.resolve({
            count: 50,
            error: null
          }))
        })
      };

      // Mock trzeci query: recipes.select('created_at').eq('user_id').order().limit().single()
      const mockFirstRecipeQuery = {
        select: jasmine.createSpy('select').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            order: jasmine.createSpy('order').and.returnValue({
              limit: jasmine.createSpy('limit').and.returnValue({
                single: jasmine.createSpy('single').and.returnValue(Promise.resolve({
                  data: { created_at: '2023-01-01T00:00:00Z' },
                  error: null
                }))
              })
            })
          })
        })
      };

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'recipes') {
          callCount++;
          // Pierwszy call zwraca recipes select, drugi call zwraca first recipe query
          return callCount === 1 ? mockRecipesSelectQuery : mockFirstRecipeQuery;
        } else if (table === 'recipe_ingredients') {
          return mockRecipeIngredientsQuery;
        }
        return {};
      });

      service.getStats().subscribe(stats => {
        expect(stats.totalRecipes).toBe(2);
        expect(stats.totalIngredients).toBe(50);
        expect(stats.totalActiveDays).toBeGreaterThanOrEqual(0);
        done();
      });
    });

    it('should handle database errors gracefully', (done) => {
      const mockErrorQuery = {
        select: jasmine.createSpy('select').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            eq: jasmine.createSpy('eq').and.returnValue(Promise.reject(
              new Error('Database connection failed')
            ))
          })
        })
      };

      mockSupabaseClient.from.and.returnValue(mockErrorQuery);

      service.getStats().subscribe({
        next: () => fail('Should have thrown error'),
        error: (error) => {
          expect(error.message).toContain('Database connection failed');
          done();
        }
      });
    });

    it('should handle null counts', (done) => {
      // Mock empty recipes result
      const mockEmptyRecipesQuery = {
        select: jasmine.createSpy('select').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            eq: jasmine.createSpy('eq').and.returnValue(Promise.resolve({
              data: [],
              error: null
            }))
          })
        })
      };

      mockSupabaseClient.from.and.returnValue(mockEmptyRecipesQuery);

      service.getStats().subscribe(stats => {
        expect(stats.totalRecipes).toBe(0);
        expect(stats.totalIngredients).toBe(0);
        expect(stats.totalActiveDays).toBe(0);
        done();
      });
    });
  });

  describe('getActivities', () => {
    it('should return mock activities', (done) => {
      service.getActivities().subscribe(activities => {
        expect(activities).toHaveSize(1);
        expect(activities[0].type).toBe('recipe_added');
        expect(activities[0].title).toBe('Welcome to HealthyMeal');
        expect(activities[0].timestamp).toBeInstanceOf(Date);
        done();
      });
    });
  });

  describe('formatTimestamp', () => {
    it('should format timestamp correctly for recent dates', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const result = service.formatTimestamp(oneHourAgo);
      expect(result).toBe('1 hour ago');
    });

    it('should format timestamp correctly for multiple hours', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      
      const result = service.formatTimestamp(twoHoursAgo);
      expect(result).toBe('2 hours ago');
    });

    it('should format timestamp correctly for older dates', () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      
      const result = service.formatTimestamp(threeDaysAgo);
      expect(result).toBe('3 days ago');
    });

    it('should format timestamp correctly for single day', () => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const result = service.formatTimestamp(oneDayAgo);
      expect(result).toBe('1 day ago');
    });

    it('should format timestamp correctly for minutes', () => {
      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      
      const result = service.formatTimestamp(thirtyMinutesAgo);
      expect(result).toBe('30 minutes ago');
    });

    it('should format timestamp correctly for just now', () => {
      const now = new Date();
      const justNow = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
      
      const result = service.formatTimestamp(justNow);
      expect(result).toBe('Just now');
    });
  });
}); 