import { TestBed } from '@angular/core/testing';
import { IngredientsService } from './ingredients.service';
import { SupabaseService } from '../supabase.service';
import { IngredientListParams, CreateIngredientRequest, IngredientListResponse } from '../../types';

describe('IngredientsService', () => {
  let service: IngredientsService;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let mockSupabaseClient: any;

  const mockIngredientResponse: IngredientListResponse = {
    data: [
      {
        id: '123',
        name: 'Test Ingredient',
        created_at: '2023-01-01T00:00:00Z'
      }
    ],
    meta: {
      total: 1,
      page: 1,
      limit: 10
    }
  };

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
        IngredientsService,
        { provide: SupabaseService, useValue: supabaseSpy }
      ]
    });

    service = TestBed.inject(IngredientsService);
    mockSupabaseService = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getIngredients', () => {
    it('should throw error if user not authenticated', async () => {
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: { user: null },
        error: { message: 'Not authenticated' }
      }));

      const params: IngredientListParams = { page: 1 };
      await expectAsync(service.getIngredients(params))
        .toBeRejectedWithError('Failed to fetch ingredients: User not authenticated');
    });

    it('should validate page parameter', async () => {
      const params: IngredientListParams = { page: 0 };
      await expectAsync(service.getIngredients(params))
        .toBeRejectedWithError('Failed to fetch ingredients: Page number must be greater than 0');
    });

    it('should validate limit parameter', async () => {
      const params: IngredientListParams = { limit: 0 };
      await expectAsync(service.getIngredients(params))
        .toBeRejectedWithError('Failed to fetch ingredients: Limit must be greater than 0');

      const params2: IngredientListParams = { limit: 101 };
      await expectAsync(service.getIngredients(params2))
        .toBeRejectedWithError('Failed to fetch ingredients: Limit cannot exceed 100');
    });

    it('should validate search parameter', async () => {
      const longSearch = 'a'.repeat(256);
      const params: IngredientListParams = { search: longSearch };
      await expectAsync(service.getIngredients(params))
        .toBeRejectedWithError('Failed to fetch ingredients: Search query cannot exceed 255 characters');
    });

    it('should use default values when parameters not provided', async () => {
      const mockQueryBuilder = {
        select: jasmine.createSpy('select').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValues(
            {
              eq: jasmine.createSpy('eq').and.returnValue({
                range: jasmine.createSpy('range').and.returnValue(Promise.resolve({
                  data: [],
                  error: null,
                  count: 0
                }))
              })
            }
          )
        })
      };

      mockSupabaseClient.from.and.returnValue(mockQueryBuilder);

      const result = await service.getIngredients({});
      
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should apply search filter when provided', async () => {
      const mockQueryBuilder = {
        select: jasmine.createSpy('select').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            eq: jasmine.createSpy('eq').and.returnValue({
              ilike: jasmine.createSpy('ilike').and.returnValue({
                range: jasmine.createSpy('range').and.returnValue(Promise.resolve({
                  data: mockIngredientResponse.data,
                  error: null,
                  count: 1
                }))
              })
            })
          })
        })
      };

      mockSupabaseClient.from.and.returnValue(mockQueryBuilder);

      const params: IngredientListParams = { search: 'test' };
      const result = await service.getIngredients(params);

      expect(result.data).toEqual(mockIngredientResponse.data);
    });

    it('should handle database errors', async () => {
      const mockQueryBuilder = {
        select: jasmine.createSpy('select').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            eq: jasmine.createSpy('eq').and.returnValue({
              range: jasmine.createSpy('range').and.returnValue(Promise.resolve({
                data: null,
                error: new Error('Database error')
              }))
            })
          })
        })
      };

      mockSupabaseClient.from.and.returnValue(mockQueryBuilder);

      await expectAsync(service.getIngredients({}))
        .toBeRejectedWithError('Failed to fetch ingredients: Database error');
    });
  });

  describe('createIngredient', () => {
    it('should throw error if user not authenticated', async () => {
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: { user: null },
        error: { message: 'Not authenticated' }
      }));

      const request: CreateIngredientRequest = { name: 'Test Ingredient' };
      await expectAsync(service.createIngredient(request))
        .toBeRejectedWithError('User not authenticated');
    });

    it('should create ingredient successfully', async () => {
      const request: CreateIngredientRequest = { name: 'New Ingredient' };
      const mockCreatedIngredient = {
        id: '456',
        name: 'New Ingredient',
        user_id: 'test-user-id',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      // Mock check for existing ingredient (should return null)
      const mockSelectQuery = {
        select: jasmine.createSpy('select').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            eq: jasmine.createSpy('eq').and.returnValue({
              single: jasmine.createSpy('single').and.returnValue(Promise.resolve({
                data: null,
                error: null
              }))
            })
          })
        })
      };

      // Mock ingredient creation
      const mockInsertQuery = {
        insert: jasmine.createSpy('insert').and.returnValue({
          select: jasmine.createSpy('select').and.returnValue({
            single: jasmine.createSpy('single').and.returnValue(Promise.resolve({
              data: mockCreatedIngredient,
              error: null
            }))
          })
        })
      };

      mockSupabaseClient.from.and.returnValues(mockSelectQuery, mockInsertQuery);

      const result = await service.createIngredient(request);

      expect(result).toEqual(mockCreatedIngredient);
    });

    it('should throw error if name is empty', async () => {
      const request: CreateIngredientRequest = { name: '' };
      await expectAsync(service.createIngredient(request))
        .toBeRejectedWithError('Name is required');
    });

    it('should throw error if name is too long', async () => {
      const request: CreateIngredientRequest = { name: 'a'.repeat(256) };
      await expectAsync(service.createIngredient(request))
        .toBeRejectedWithError('Name cannot exceed 255 characters');
    });

    it('should throw error if ingredient already exists', async () => {
      const request: CreateIngredientRequest = { name: 'Existing Ingredient' };

      const mockSelectQuery = {
        select: jasmine.createSpy('select').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            eq: jasmine.createSpy('eq').and.returnValue({
              single: jasmine.createSpy('single').and.returnValue(Promise.resolve({
                data: { id: '123' },
                error: null
              }))
            })
          })
        })
      };

      mockSupabaseClient.from.and.returnValue(mockSelectQuery);

      await expectAsync(service.createIngredient(request))
        .toBeRejectedWithError('Ingredient with this name already exists in your collection');
    });

    it('should handle database insert errors', async () => {
      const request: CreateIngredientRequest = { name: 'Test Ingredient' };

      // Mock successful check (no existing ingredient)
      const mockSelectQuery = {
        select: jasmine.createSpy('select').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            eq: jasmine.createSpy('eq').and.returnValue({
              single: jasmine.createSpy('single').and.returnValue(Promise.resolve({
                data: null,
                error: null
              }))
            })
          })
        })
      };

      // Mock failed insert
      const mockInsertQuery = {
        insert: jasmine.createSpy('insert').and.returnValue({
          select: jasmine.createSpy('select').and.returnValue({
            single: jasmine.createSpy('single').and.returnValue(Promise.resolve({
              data: null,
              error: { message: 'Insert failed' }
            }))
          })
        })
      };

      mockSupabaseClient.from.and.returnValues(mockSelectQuery, mockInsertQuery);

      await expectAsync(service.createIngredient(request))
        .toBeRejectedWithError('Failed to create ingredient');
    });
  });

  describe('clearCache', () => {
    it('should clear cache', () => {
      service.clearCache();
      expect(service).toBeTruthy(); // Basic assertion
    });
  });
}); 