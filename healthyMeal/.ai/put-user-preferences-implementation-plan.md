# API Endpoint Implementation Plan: PUT /user-preferences

## 1. Overview
The PUT /user-preferences endpoint allows authenticated users to update their dietary and measurement preferences. This endpoint supports partial updates, meaning users can update any subset of their preferences without affecting unchanged fields.

## 2. Request Details
- HTTP Method: PUT
- URL Pattern: /user-preferences
- Authentication: Required (Bearer token)
- Request Body:
```typescript
interface UpdateUserPreferencesRequest {
  daily_calories?: number;
  protein_percentage?: number;
  carbs_percentage?: number;
  fat_percentage?: number;
  allergens?: Json;
  micro_nutrients?: Json;
  measurement_system?: 'metric' | 'imperial';
}
```

## 3. Types Used
- DTOs:
  - UpdateUserPreferencesRequest
  - UserPreferencesResponse
  - ErrorResponse
- Database Types:
  - user_preferences table schema

## 4. Response Details
- Success (200):
```typescript
interface UserPreferencesResponse {
  id: UUID;
  daily_calories: number | null;
  protein_percentage: number | null;
  carbs_percentage: number | null;
  fat_percentage: number | null;
  allergens: Json;
  micro_nutrients: Json;
  measurement_system: 'metric' | 'imperial' | null;
}
```
- Error Responses:
  - 400: Invalid input data
  - 401: Unauthorized
  - 404: Preferences not found
  - 500: Server error

## 5. Data Flow
1. Receive PUT request with update data
2. Validate authentication token
3. Validate request body:
   - Check data types
   - Validate percentage sums
   - Validate measurement system
4. Get current user ID from auth token
5. Update preferences in database
6. Return updated preferences

## 6. Security Considerations
1. Authentication:
   - Require valid JWT token
   - Verify token expiration
   - Validate user permissions

2. Authorization:
   - Ensure user can only update own preferences
   - Implement row-level security in database

3. Input Validation:
   - Validate all input fields
   - Sanitize JSON inputs
   - Check percentage constraints
   - Validate measurement system values

4. Rate Limiting:
   - Implement per-user rate limiting
   - Track update frequency

## 7. Error Handling
1. Input Validation Errors (400):
   - Invalid data types
   - Percentage sum not 100
   - Invalid measurement system
   - Malformed JSON

2. Authentication Errors (401):
   - Missing token
   - Invalid token
   - Expired token

3. Resource Errors (404):
   - Preferences not found for user

4. Server Errors (500):
   - Database connection issues
   - Unexpected errors

## 8. Performance Considerations
1. Caching:
   - Cache user preferences
   - Invalidate cache on update
   - Set appropriate TTL

2. Database Optimization:
   - Use partial updates
   - Index user_id field
   - Optimize JSON operations

3. Response Optimization:
   - Return only updated fields
   - Compress large JSON responses

## 9. Implementation Steps
1. Update UserPreferencesService:
   - Add updatePreferences method
   - Implement validation logic
   - Add error handling
   - Update caching mechanism

2. Create Update Preferences Component:
   - Build form with validation
   - Add error handling
   - Implement loading states
   - Add success notifications

3. Add Route and Guard:
   - Create PUT route
   - Implement auth guard
   - Add rate limiting

4. Database Updates:
   - Ensure RLS policies
   - Add necessary indexes
   - Update triggers if needed

5. Testing:
   - Unit tests for service
   - Integration tests
   - Security tests
   - Performance tests

6. Documentation:
   - Update API docs
   - Add usage examples
   - Document error cases 