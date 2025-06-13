import { Routes } from '@angular/router';
import { SignupComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';
import { UserPreferencesComponent } from './user-preferences/user-preferences.component';
import { UpdatePreferencesComponent } from './user-preferences/update-preferences/update-preferences.component';
import { AuthGuard } from './auth.guard';
import { RecipesListComponent } from './recipes/recipes-list/recipes-list.component';
import { RecipeFormComponent } from './recipes/recipe-form/recipe-form.component';
import { IngredientsComponent } from './ingredients/ingredients.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RecipeGeneratorComponent } from './recipes/recipe-generator/recipe-generator.component';
import { RecipeDetailsComponent } from './recipes/recipe-details/recipe-details.component';
import { LandingComponent } from './landing/landing.component';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    title: 'HealthyMeal - Twórz Zdrowe Przepisy z AI'
  },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'app',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Dashboard'
      },
      { 
        path: 'preferences', 
        component: UserPreferencesComponent 
      },
      { 
        path: 'preferences/edit', 
        component: UpdatePreferencesComponent 
      },
      {
        path: 'recipes',
        component: RecipesListComponent
      },
      {
        path: 'recipes/generate',
        component: RecipeGeneratorComponent,
        title: 'Generate Recipe'
      },
      {
        path: 'recipes/create',
        component: RecipeFormComponent
      },
      {
        path: 'recipes/:id',
        component: RecipeDetailsComponent,
        title: 'Recipe Details'
      },
      {
        path: 'ingredients',
        component: IngredientsComponent,
        title: 'Ingredients'
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
  // ... existing routes ...
];
