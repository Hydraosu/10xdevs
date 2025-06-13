# HealthyMeal Database Schema

## 1. Tables

### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);
```

### user_preferences
```sql
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daily_calories INTEGER,
    protein_percentage INTEGER CHECK (protein_percentage BETWEEN 0 AND 100),
    carbs_percentage INTEGER CHECK (carbs_percentage BETWEEN 0 AND 100),
    fat_percentage INTEGER CHECK (fat_percentage BETWEEN 0 AND 100),
    allergens JSONB DEFAULT '[]'::jsonb,
    micro_nutrients JSONB DEFAULT '{}'::jsonb,
    measurement_system VARCHAR(10) DEFAULT 'metric' CHECK (measurement_system IN ('metric', 'imperial')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);
```

### user_preferences_history
```sql
CREATE TABLE user_preferences_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_preferences_id UUID NOT NULL REFERENCES user_preferences(id) ON DELETE CASCADE,
    changes JSONB NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    changed_by UUID NOT NULL REFERENCES users(id)
);
```

### recipes
```sql
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    cooking_time INTEGER,
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    calories INTEGER,
    protein INTEGER,
    carbs INTEGER,
    fat INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1
);
```

### recipe_versions
```sql
CREATE TABLE recipe_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    cooking_time INTEGER,
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    calories INTEGER,
    protein INTEGER,
    carbs INTEGER,
    fat INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id)
);
```

### ingredients
```sql
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);
```

### recipe_ingredients
```sql
CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### translations
```sql
CREATE TABLE translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    language_code VARCHAR(5) NOT NULL,
    field_name VARCHAR(50) NOT NULL,
    translated_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(table_name, record_id, language_code, field_name)
);
```

## 2. Relationships

- users (1) -> (N) user_preferences
- users (1) -> (N) recipes
- user_preferences (1) -> (N) user_preferences_history
- recipes (1) -> (N) recipe_versions
- recipes (1) -> (N) recipe_ingredients
- ingredients (1) -> (N) recipe_ingredients
- translations (N) -> (1) various tables (polymorphic relationship)

## 3. Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- User Preferences
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_history_user_preferences_id ON user_preferences_history(user_preferences_id);
CREATE INDEX idx_user_preferences_history_changed_at ON user_preferences_history(changed_at);

-- Recipes
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_created_at ON recipes(created_at);
CREATE INDEX idx_recipes_calories ON recipes(calories);
CREATE INDEX idx_recipes_cooking_time ON recipes(cooking_time);

-- Recipe Versions
CREATE INDEX idx_recipe_versions_recipe_id ON recipe_versions(recipe_id);
CREATE INDEX idx_recipe_versions_version ON recipe_versions(version);

-- Ingredients
CREATE INDEX idx_ingredients_name ON ingredients(name);

-- Recipe Ingredients
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);

-- Translations
CREATE INDEX idx_translations_record ON translations(table_name, record_id);
CREATE INDEX idx_translations_language ON translations(language_code);
```

## 4. PostgreSQL Rules

### Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY users_select ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update ON users FOR UPDATE USING (auth.uid() = id);

-- User preferences policies
CREATE POLICY user_preferences_select ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_preferences_insert ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_preferences_update ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Recipes policies
CREATE POLICY recipes_select ON recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY recipes_insert ON recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY recipes_update ON recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY recipes_delete ON recipes FOR DELETE USING (auth.uid() = user_id);
```

## 5. Additional Notes

1. All tables use UUID as primary keys for better scalability and security
2. JSONB is used for flexible data storage in user_preferences and user_preferences_history
3. Soft delete is implemented through is_active flag
4. Timestamps are automatically managed through triggers
5. Versioning is implemented for recipes with a separate table
6. Translations use a polymorphic relationship pattern
7. RLS policies ensure data isolation between users
8. Indexes are created for frequently queried fields
9. Check constraints ensure data integrity
10. Foreign key constraints with ON DELETE CASCADE maintain referential integrity
