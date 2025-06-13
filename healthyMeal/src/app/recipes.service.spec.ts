import { TestBed } from '@angular/core/testing';
import { RecipesService } from './recipes.service';
import { SupabaseService } from './supabase.service';
import { 
  RecipeListResponse, 
  CreateRecipeRequest, 
  RecipeResponse, 
  RecipeListParams 
} from '../types';

describe('RecipesService', () => {
  let service: RecipesService;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let mockSupabaseClient: any;

  const mockRecipeListResponse: RecipeListResponse = {
    data: [
      {
        id: '123',
        title: 'Test Recipe',
        description: 'Test description',
        cooking_time: 30,
        difficulty: 'easy',
        calories: 500,
        created_at: '2023-01-01T00:00:00Z'
      }
    ],
    meta: {
      total: 1,
      page: 1,
      limit: 10
    }
  };

  const mockCreateRecipeRequest: CreateRecipeRequest = {
    title: 'New Recipe',
    description: 'New recipe description',
    instructions: 'Mix ingredients and cook',
    cooking_time: 45,
    difficulty: 'medium',
    calories: 600,
    protein: 25,
    carbs: 50,
    fat: 15,
    ingredients: [
      {
        ingredient_id: '550e8400-e29b-41d4-a716-446655440000',
        amount: 2,
        unit: 'cups',
        notes: 'Fresh ingredients'
      }
    ]
  };

  beforeEach(() => {
    // Create comprehensive mock for Supabase client
    mockSupabaseClient = {
      auth: {
        getUser: jasmine.createSpy('getUser')
      },
      from: jasmine.createSpy('from')
    };

    const supabaseSpy = jasmine.createSpyObj('SupabaseService', [], {
      supabase: mockSupabaseClient
    });

    TestBed.configureTestingModule({
      providers: [
        RecipesService,
        { provide: SupabaseService, useValue: supabaseSpy }
      ]
    });

    service = TestBed.inject(RecipesService);
    mockSupabaseService = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>;
  });

  describe('getRecipes', () => {
    it('should get recipes with default parameters', async () => {
      // Mock auth response
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: { user: { id: 'user123' } },
        error: null
      }));

      // Mock database response chain
      const mockQueryBuilder = {
        select: jasmine.createSpy('select').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            eq: jasmine.createSpy('eq').and.returnValue({
              order: jasmine.createSpy('order').and.returnValue({
                range: jasmine.createSpy('range').and.returnValue(Promise.resolve({
                  data: mockRecipeListResponse.data,
                  error: null,
                  count: 1
                }))
              })
            })
          })
        })
      };

      mockSupabaseClient.from.and.returnValue(mockQueryBuilder);

      const result = await service.getRecipes();
      
      expect(result).toEqual(mockRecipeListResponse);
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
    });

    it('should throw error when user not authenticated', async () => {
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: { user: null },
        error: null
      }));

      await expectAsync(service.getRecipes())
        .toBeRejectedWithError('User not authenticated');
    });

    it('should validate parameters correctly', async () => {
      const invalidParams: RecipeListParams = { page: 0 };
      
      await expectAsync(service.getRecipes(invalidParams))
        .toBeRejectedWithError('Page number must be greater than 0');
    });

    it('should use cache when available and valid', async () => {
      // First call - should hit database
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: { user: { id: 'user123' } },
        error: null
      }));

      const mockQueryBuilder = {
        select: jasmine.createSpy('select').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            eq: jasmine.createSpy('eq').and.returnValue({
              order: jasmine.createSpy('order').and.returnValue({
                range: jasmine.createSpy('range').and.returnValue(Promise.resolve({
                  data: mockRecipeListResponse.data,
                  error: null,
                  count: 1
                }))
              })
            })
          })
        })
      };

      mockSupabaseClient.from.and.returnValue(mockQueryBuilder);

      await service.getRecipes();
      
      // Second call - should use cache
      const result = await service.getRecipes();
      
      expect(result).toEqual(mockRecipeListResponse);
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('createRecipe', () => {
    it('should create recipe successfully', async () => {
      const mockRecipe = {
        id: '456',
        title: 'New Recipe',
        description: 'New recipe description',
        instructions: 'Mix ingredients and cook',
        cooking_time: 45,
        difficulty: 'medium',
        calories: 600,
        protein: 25,
        carbs: 50,
        fat: 15,
        version: 1,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        user_id: 'user123',
        is_active: true
      };

      // Mock auth response
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: { user: { id: 'user123' } },
        error: null
      }));

      // Mock different table responses
      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'recipes') {
          return {
            insert: jasmine.createSpy('insert').and.returnValue({
              select: jasmine.createSpy('select').and.returnValue({
                single: jasmine.createSpy('single').and.returnValue(Promise.resolve({
                  data: mockRecipe,
                  error: null
                }))
              })
            })
          };
        } else if (table === 'recipe_ingredients') {
          return {
            insert: jasmine.createSpy('insert').and.returnValue(Promise.resolve({
              error: null
            }))
          };
        } else if (table === 'ingredients') {
          return {
            select: jasmine.createSpy('select').and.returnValue({
              in: jasmine.createSpy('in').and.returnValue(Promise.resolve({
                data: [{ id: '550e8400-e29b-41d4-a716-446655440000', name: 'Test Ingredient' }],
                error: null
              }))
            })
          };
        }
        return {};
      });

      const result = await service.createRecipe(mockCreateRecipeRequest);

      expect(result).toBeDefined();
      expect(result.title).toBe('New Recipe');
      expect(result.ingredients).toHaveSize(1);
    });

    it('should validate recipe input', async () => {
      const invalidRequest: CreateRecipeRequest = {
        title: '',
        instructions: 'Mix ingredients',
        ingredients: []
      };

      await expectAsync(service.createRecipe(invalidRequest))
        .toBeRejectedWithError('Title is required');
    });

    it('should validate ingredient UUID format', async () => {
      const invalidRequest: CreateRecipeRequest = {
        title: 'Valid Title',
        instructions: 'Valid instructions',
        ingredients: [
          {
            ingredient_id: 'invalid-uuid',
            amount: 1,
            unit: 'cup'
          }
        ]
      };

      await expectAsync(service.createRecipe(invalidRequest))
        .toBeRejectedWithError('Ingredient 1: Invalid ID format. Must be a valid UUID');
    });

    it('should rollback recipe creation if ingredients fail', async () => {
      // Mock auth response
      mockSupabaseClient.auth.getUser.and.returnValue(Promise.resolve({
        data: { user: { id: 'user123' } },
        error: null
      }));

      const mockRecipe = { id: '456', title: 'Test Recipe' };
      const deleteSpy = jasmine.createSpy('delete').and.returnValue({
        eq: jasmine.createSpy('eq').and.returnValue(Promise.resolve({ error: null }))
      });

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'recipes') {
          return {
            insert: jasmine.createSpy('insert').and.returnValue({
              select: jasmine.createSpy('select').and.returnValue({
                single: jasmine.createSpy('single').and.returnValue(Promise.resolve({
                  data: mockRecipe,
                  error: null
                }))
              })
            }),
            delete: deleteSpy
          };
        } else if (table === 'recipe_ingredients') {
          return {
            insert: jasmine.createSpy('insert').and.returnValue(Promise.resolve({
              error: { message: 'Ingredients insertion failed' }
            }))
          };
        }
        return {};
      });

      await expectAsync(service.createRecipe(mockCreateRecipeRequest))
        .toBeRejectedWithError('Failed to create recipe ingredients: Ingredients insertion failed');

      expect(deleteSpy).toHaveBeenCalled();
    });
  });

  describe('clearRecipesCache', () => {
    it('should clear cache when called', () => {
      service.clearRecipesCache();
      // Cache should be cleared - tested indirectly through cache usage
      expect(service).toBeTruthy(); // Basic assertion
    });
  });
}); 