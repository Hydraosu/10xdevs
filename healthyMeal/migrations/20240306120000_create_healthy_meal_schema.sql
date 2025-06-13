-- Migration: Create HealthyMeal Schema
-- Description: Initial schema creation for HealthyMeal application
-- Tables created: users, user_preferences, user_preferences_history, recipes, recipe_versions, ingredients, recipe_ingredients, translations
-- Security: RLS enabled on all tables with appropriate policies
-- Dependencies: None

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create users table
create table users (
    id uuid primary key default gen_random_uuid(),
    email varchar(255) not null unique,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    last_login_at timestamp with time zone,
    is_active boolean default true
);

-- Enable RLS on users table
alter table users enable row level security;

-- Create RLS policies for users table
-- Policy for authenticated users to view their own data
create policy users_select on users
    for select
    to authenticated
    using (auth.uid() = id);

-- Policy for authenticated users to update their own data
create policy users_update on users
    for update
    to authenticated
    using (auth.uid() = id);

-- Create user_preferences table
create table user_preferences (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    daily_calories integer,
    protein_percentage integer check (protein_percentage between 0 and 100),
    carbs_percentage integer check (carbs_percentage between 0 and 100),
    fat_percentage integer check (fat_percentage between 0 and 100),
    allergens jsonb default '[]'::jsonb,
    micro_nutrients jsonb default '{}'::jsonb,
    measurement_system varchar(10) default 'metric' check (measurement_system in ('metric', 'imperial')),
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    is_active boolean default true
);

-- Enable RLS on user_preferences table
alter table user_preferences enable row level security;

-- Create RLS policies for user_preferences table
-- Policy for authenticated users to view their own preferences
create policy user_preferences_select on user_preferences
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Policy for authenticated users to create their own preferences
create policy user_preferences_insert on user_preferences
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Policy for authenticated users to update their own preferences
create policy user_preferences_update on user_preferences
    for update
    to authenticated
    using (auth.uid() = user_id);

-- Create user_preferences_history table
create table user_preferences_history (
    id uuid primary key default gen_random_uuid(),
    user_preferences_id uuid not null references user_preferences(id) on delete cascade,
    changes jsonb not null,
    changed_at timestamp with time zone default current_timestamp,
    changed_by uuid not null references users(id)
);

-- Enable RLS on user_preferences_history table
alter table user_preferences_history enable row level security;

-- Create RLS policies for user_preferences_history table
-- Policy for authenticated users to view their own preferences history
create policy user_preferences_history_select on user_preferences_history
    for select
    to authenticated
    using (exists (
        select 1 from user_preferences
        where user_preferences.id = user_preferences_history.user_preferences_id
        and user_preferences.user_id = auth.uid()
    ));

-- Create recipes table
create table recipes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    title varchar(255) not null,
    description text,
    instructions text not null,
    cooking_time integer,
    difficulty varchar(20) check (difficulty in ('easy', 'medium', 'hard')),
    calories integer,
    protein integer,
    carbs integer,
    fat integer,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    is_active boolean default true,
    version integer default 1
);

-- Enable RLS on recipes table
alter table recipes enable row level security;

-- Create RLS policies for recipes table
-- Policy for authenticated users to view their own recipes
create policy recipes_select on recipes
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Policy for authenticated users to create recipes
create policy recipes_insert on recipes
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Policy for authenticated users to update their own recipes
create policy recipes_update on recipes
    for update
    to authenticated
    using (auth.uid() = user_id);

-- Policy for authenticated users to delete their own recipes
create policy recipes_delete on recipes
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- Create recipe_versions table
create table recipe_versions (
    id uuid primary key default gen_random_uuid(),
    recipe_id uuid not null references recipes(id) on delete cascade,
    version integer not null,
    title varchar(255) not null,
    description text,
    instructions text not null,
    cooking_time integer,
    difficulty varchar(20) check (difficulty in ('easy', 'medium', 'hard')),
    calories integer,
    protein integer,
    carbs integer,
    fat integer,
    created_at timestamp with time zone default current_timestamp,
    created_by uuid not null references users(id)
);

-- Enable RLS on recipe_versions table
alter table recipe_versions enable row level security;

-- Create RLS policies for recipe_versions table
-- Policy for authenticated users to view versions of their own recipes
create policy recipe_versions_select on recipe_versions
    for select
    to authenticated
    using (exists (
        select 1 from recipes
        where recipes.id = recipe_versions.recipe_id
        and recipes.user_id = auth.uid()
    ));

-- Create ingredients table
create table ingredients (
    id uuid primary key default gen_random_uuid(),
    name varchar(255) not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    is_active boolean default true
);

-- Enable RLS on ingredients table
alter table ingredients enable row level security;

-- Create RLS policies for ingredients table
-- Policy for authenticated users to view ingredients
create policy ingredients_select on ingredients
    for select
    to authenticated
    using (true);

-- Create recipe_ingredients table
create table recipe_ingredients (
    id uuid primary key default gen_random_uuid(),
    recipe_id uuid not null references recipes(id) on delete cascade,
    ingredient_id uuid not null references ingredients(id) on delete cascade,
    amount decimal(10,2) not null,
    unit varchar(50) not null,
    notes text,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp
);

-- Enable RLS on recipe_ingredients table
alter table recipe_ingredients enable row level security;

-- Create RLS policies for recipe_ingredients table
-- Policy for authenticated users to view ingredients of their own recipes
create policy recipe_ingredients_select on recipe_ingredients
    for select
    to authenticated
    using (exists (
        select 1 from recipes
        where recipes.id = recipe_ingredients.recipe_id
        and recipes.user_id = auth.uid()
    ));

-- Create translations table
create table translations (
    id uuid primary key default gen_random_uuid(),
    table_name varchar(50) not null,
    record_id uuid not null,
    language_code varchar(5) not null,
    field_name varchar(50) not null,
    translated_text text not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    unique(table_name, record_id, language_code, field_name)
);

-- Enable RLS on translations table
alter table translations enable row level security;

-- Create RLS policies for translations table
-- Policy for authenticated users to view translations
create policy translations_select on translations
    for select
    to authenticated
    using (true);

-- Create indexes for better query performance
create index idx_users_email on users(email);
create index idx_users_created_at on users(created_at);

create index idx_user_preferences_user_id on user_preferences(user_id);
create index idx_user_preferences_history_user_preferences_id on user_preferences_history(user_preferences_id);
create index idx_user_preferences_history_changed_at on user_preferences_history(changed_at);

create index idx_recipes_user_id on recipes(user_id);
create index idx_recipes_created_at on recipes(created_at);
create index idx_recipes_calories on recipes(calories);
create index idx_recipes_cooking_time on recipes(cooking_time);

create index idx_recipe_versions_recipe_id on recipe_versions(recipe_id);
create index idx_recipe_versions_version on recipe_versions(version);

create index idx_ingredients_name on ingredients(name);

create index idx_recipe_ingredients_recipe_id on recipe_ingredients(recipe_id);
create index idx_recipe_ingredients_ingredient_id on recipe_ingredients(ingredient_id);

create index idx_translations_record on translations(table_name, record_id);
create index idx_translations_language on translations(language_code); 