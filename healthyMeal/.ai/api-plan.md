# HealthyMeal REST API Plan

## 1. Resources

### Users
- Table: `users`
- Primary operations: CRUD
- Authentication: Supabase Auth

### User Preferences
- Table: `user_preferences`
- Primary operations: CRUD
- Related to: Users (1:1)

### User Preferences History
- Table: `user_preferences_history`
- Primary operations: Read
- Related to: User Preferences (1:N)

### Recipes
- Table: `recipes`
- Primary operations: CRUD
- Related to: Users (1:N)

### Recipe Versions
- Table: `recipe_versions`
- Primary operations: CRUD
- Related to: Recipes (1:N)

### Ingredients
- Table: `ingredients`
- Primary operations: CRUD
- Related to: Recipes (N:M via recipe_ingredients)

### Translations
- Table: `translations`
- Primary operations: CRUD
- Related to: All tables (polymorphic)

## 2. Endpoints

### Authentication

#### POST /auth/signup
- Description: Register a new user
- Request Body:
```json
{
  "email": "string",
  "password": "string"
}
```
- Response (201):
```json
{
  "user": {
    "id": "uuid",
    "email": "string"
  },
  "session": {
    "access_token": "string",
    "refresh_token": "string"
  }
}
```

#### POST /auth/login
- Description: Authenticate user
- Request Body:
```json
{
  "email": "string",
  "password": "string"
}
```
- Response (200):
```json
{
  "user": {
    "id": "uuid",
    "email": "string"
  },
  "session": {
    "access_token": "string",
    "refresh_token": "string"
  }
}
```

### User Preferences

#### GET /user-preferences
- Description: Get current user preferences
- Response (200):
```json
{
  "id": "uuid",
  "daily_calories": "integer",
  "protein_percentage": "integer",
  "carbs_percentage": "integer",
  "fat_percentage": "integer",
  "allergens": "array",
  "micro_nutrients": "object",
  "measurement_system": "string"
}
```

#### PUT /user-preferences
- Description: Update user preferences
- Request Body:
```json
{
  "daily_calories": "integer",
  "protein_percentage": "integer",
  "carbs_percentage": "integer",
  "fat_percentage": "integer",
  "allergens": "array",
  "micro_nutrients": "object",
  "measurement_system": "string"
}
```
- Response (200): Same as GET response

### Recipes

#### GET /recipes
- Description: List user's recipes
- Query Parameters:
  - `page`: integer (default: 1)
  - `limit`: integer (default: 10)
  - `sort`: string (created_at, updated_at, title)
  - `order`: string (asc, desc)
- Response (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "cooking_time": "integer",
      "difficulty": "string",
      "calories": "integer",
      "created_at": "timestamp"
    }
  ],
  "meta": {
    "total": "integer",
    "page": "integer",
    "limit": "integer"
  }
}
```

#### POST /recipes
- Description: Create a new recipe
- Request Body:
```json
{
  "title": "string",
  "description": "string",
  "instructions": "string",
  "cooking_time": "integer",
  "difficulty": "string",
  "calories": "integer",
  "protein": "integer",
  "carbs": "integer",
  "fat": "integer",
  "ingredients": [
    {
      "ingredient_id": "uuid",
      "amount": "decimal",
      "unit": "string",
      "notes": "string"
    }
  ]
}
```
- Response (201):
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "instructions": "string",
  "cooking_time": "integer",
  "difficulty": "string",
  "calories": "integer",
  "protein": "integer",
  "carbs": "integer",
  "fat": "integer",
  "version": "integer",
  "created_at": "timestamp"
}
```

#### GET /recipes/{id}
- Description: Get recipe details
- Response (200):
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "instructions": "string",
  "cooking_time": "integer",
  "difficulty": "string",
  "calories": "integer",
  "protein": "integer",
  "carbs": "integer",
  "fat": "integer",
  "version": "integer",
  "ingredients": [
    {
      "id": "uuid",
      "name": "string",
      "amount": "decimal",
      "unit": "string",
      "notes": "string"
    }
  ],
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### PUT /recipes/{id}
- Description: Update recipe
- Request Body: Same as POST
- Response (200): Same as GET response

#### DELETE /recipes/{id}
- Description: Delete recipe
- Response (204): No content

### Recipe Versions

#### GET /recipes/{id}/versions
- Description: List recipe versions
- Response (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "version": "integer",
      "title": "string",
      "description": "string",
      "instructions": "string",
      "cooking_time": "integer",
      "difficulty": "string",
      "calories": "integer",
      "protein": "integer",
      "carbs": "integer",
      "fat": "integer",
      "created_at": "timestamp"
    }
  ]
}
```

### Ingredients

#### GET /ingredients
- Description: List ingredients
- Query Parameters:
  - `search`: string
  - `page`: integer
  - `limit`: integer
- Response (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string"
    }
  ],
  "meta": {
    "total": "integer",
    "page": "integer",
    "limit": "integer"
  }
}
```

#### POST /ingretients
- Description: POST recipe details
- Response (200):
```json
{
  "id": "uuid",
  "name": "string",
  "amount": "decimal",
  "unit": "string",
  "notes": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Translations

#### GET /translations
- Description: Get translations for a record
- Query Parameters:
  - `table_name`: string
  - `record_id`: uuid
  - `language_code`: string
- Response (200):
```json
{
  "data": [
    {
      "field_name": "string",
      "translated_text": "string"
    }
  ]
}
```

## 3. Authentication and Authorization

### Authentication
- Supabase Auth for user authentication
- JWT tokens for API access
- Token refresh mechanism

### Authorization
- Row Level Security (RLS) policies in database
- User can only access their own data
- Public access for ingredients and translations

## 4. Validation and Business Logic

### Validation Rules

#### User Preferences
- Protein, carbs, and fat percentages must sum to 100
- Daily calories must be positive
- Measurement system must be 'metric' or 'imperial'

#### Recipes
- Cooking time must be positive
- Difficulty must be one of: easy, medium, hard
- Calories, protein, carbs, and fat must be positive
- Title is required
- Instructions are required

#### Recipe Ingredients
- Amount must be positive
- Unit is required
- Ingredient must exist

### Business Logic

#### Recipe Generation
- AI-powered recipe generation based on user preferences
- Nutritional calculations based on ingredients
- Version tracking for recipe modifications

#### User Preferences
- History tracking for preference changes
- Automatic conversion between measurement systems
- Allergen and micro-nutrient validation

### Error Handling

#### Common Error Responses
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object"
  }
}
```

#### Error Codes
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Unprocessable Entity
- 429: Too Many Requests
- 500: Internal Server Error 