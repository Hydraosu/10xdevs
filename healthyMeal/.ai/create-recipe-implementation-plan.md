# API Endpoint Implementation Plan: POST /recipes

## 1. Overview
The POST /recipes endpoint allows authenticated users to create new recipes with associated ingredients. This endpoint handles complex data structures and ensures data integrity through transaction management.

## 2. Request Details
- HTTP Method: POST
- URL Pattern: /recipes
- Authentication: Required (Bearer token)
- Request Body:
```typescript
interface CreateRecipeRequest {
  title: string;
  description?: string;
  instructions: string;
  cooking_time?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  ingredients: Array<{
    ingredient_id: UUID;
    amount: number;
    unit: string;
    notes?: string;
  }>;
}
```

## 3. Types Used
- DTOs:
  - CreateRecipeRequest
  - RecipeResponse
  - RecipeIngredientDTO
- Database Types:
  - recipes table schema
  - recipe_ingredients table schema

## 4. Response Details
- Success (201):
```typescript
interface RecipeResponse {
  id: UUID;
  title: string;
  description: string | null;
  instructions: string;
  cooking_time: number | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  version: number;
  created_at: Timestamp;
}
```
- Error Responses:
  - 400: Invalid input data
  - 401: Unauthorized
  - 404: Ingredient not found
  - 500: Server error

## 5. Data Flow
1. Receive POST request with recipe data
2. Validate authentication token
3. Validate request body:
   - Check required fields
   - Validate data types
   - Validate ranges and enums
4. Get current user ID from auth token
5. Start database transaction:
   - Create recipe record
   - Create recipe_ingredient records
   - Commit transaction
6. Return created recipe with version info

## 6. Security Considerations
1. Authentication:
   - Require valid JWT token
   - Verify token expiration
   - Validate user permissions

2. Authorization:
   - Ensure user can only create recipes for themselves
   - Validate ingredient ownership
   - Implement row-level security

3. Input Validation:
   - Sanitize all input fields
   - Validate ingredient IDs
   - Check numeric ranges
   - Validate difficulty enum

4. Data Protection:
   - Use parameterized queries
   - Implement transaction rollback
   - Validate data integrity

## 7. Error Handling
1. Input Validation Errors (400):
   - Missing required fields
   - Invalid data types
   - Invalid ranges
   - Invalid difficulty value

2. Authentication Errors (401):
   - Missing token
   - Invalid token
   - Expired token

3. Resource Errors (404):
   - Ingredient not found
   - Invalid ingredient ID

4. Server Errors (500):
   - Database connection issues
   - Transaction failures
   - Unexpected errors

## 8. Performance Considerations
1. Database Optimization:
   - Use transactions for data integrity
   - Index foreign keys
   - Optimize bulk inserts
   - Use appropriate data types

2. Response Optimization:
   - Return only necessary fields
   - Compress large responses
   - Cache ingredient data

3. Validation Optimization:
   - Early validation of required fields
   - Batch ingredient validation
   - Use database constraints

## 9. Implementation Steps
1. Extend RecipesService:
   - Add createRecipe method
   - Implement transaction handling
   - Add validation logic
   - Add error handling

2. Create RecipeFormComponent:
   - Build form with validation
   - Add ingredient management
   - Implement error display
   - Add loading states

3. Add Route and Guard:
   - Create POST route
   - Implement auth guard
   - Add rate limiting

4. Database Updates:
   - Ensure RLS policies
   - Add necessary indexes
   - Create constraints

5. Testing:
   - Unit tests for service
   - Integration tests
   - Validation tests
   - Error handling tests

6. Documentation:
   - Update API docs
   - Add usage examples
   - Document error cases 