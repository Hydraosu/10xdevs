-- Migration: Add user_id to ingredients table
-- Description: Make ingredients private per user instead of global
-- Dependencies: 20240306120000_create_healthy_meal_schema.sql

-- Add user_id column to ingredients table
ALTER TABLE ingredients 
ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Update existing ingredients to assign them to the first user (if any exist)
-- This is a one-time operation for existing data
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get the first user ID
    SELECT id INTO first_user_id FROM users LIMIT 1;
    
    -- If there are users and ingredients, assign existing ingredients to first user
    IF first_user_id IS NOT NULL THEN
        UPDATE ingredients 
        SET user_id = first_user_id 
        WHERE user_id IS NULL;
    END IF;
END $$;

-- Make user_id NOT NULL after setting values
ALTER TABLE ingredients 
ALTER COLUMN user_id SET NOT NULL;

-- Drop existing RLS policies for ingredients
DROP POLICY IF EXISTS ingredients_select ON ingredients;

-- Create new RLS policies for user-specific ingredients
-- Policy for authenticated users to view their own ingredients
CREATE POLICY ingredients_select ON ingredients
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy for authenticated users to create their own ingredients
CREATE POLICY ingredients_insert ON ingredients
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy for authenticated users to update their own ingredients
CREATE POLICY ingredients_update ON ingredients
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy for authenticated users to delete their own ingredients
CREATE POLICY ingredients_delete ON ingredients
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Update index to include user_id for better performance
CREATE INDEX idx_ingredients_user_id ON ingredients(user_id);
CREATE INDEX idx_ingredients_user_id_name ON ingredients(user_id, name);

-- Add some default ingredients for each existing user
DO $$
DECLARE
    user_record RECORD;
    default_ingredients TEXT[] := ARRAY[
        'Pierś z kurczaka',
        'Ryż brązowy',
        'Brokuły',
        'Oliwa z oliwek',
        'Czosnek',
        'Cebula',
        'Pomidor',
        'Szpinak',
        'Jajka',
        'Mleko',
        'Ser mozzarella',
        'Papryka czerwona',
        'Marchewka',
        'Ziemniaki'
    ];
    ingredient_name TEXT;
BEGIN
    -- For each user, add default ingredients
    FOR user_record IN SELECT id FROM users LOOP
        FOREACH ingredient_name IN ARRAY default_ingredients LOOP
            INSERT INTO ingredients (name, user_id, created_at, updated_at, is_active)
            VALUES (
                ingredient_name,
                user_record.id,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP,
                true
            )
            ON CONFLICT DO NOTHING; -- Skip if already exists
        END LOOP;
    END LOOP;
END $$; 