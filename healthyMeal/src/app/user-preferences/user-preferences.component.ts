import { Component, OnInit } from '@angular/core';
import { UserPreferencesService } from '../user-preferences.service';
import { UserPreferencesResponse } from '../../types';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-user-preferences',
  templateUrl: './user-preferences.component.html',
  styleUrls: ['./user-preferences.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ],
})
export class UserPreferencesComponent implements OnInit {
  preferences: UserPreferencesResponse | null = null;
  isLoading = true;

  constructor(
    private userPreferencesService: UserPreferencesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPreferences();
  }

  private loadPreferences(): void {
    this.isLoading = true;
    this.userPreferencesService.getUserPreferences()
      .then(preferences => {
        this.preferences = preferences;
      })
      .catch(error => {
        console.error('Error loading preferences:', error);
        this.snackBar.open('Nie udało się załadować preferencji', 'Zamknij', {
          duration: 3000
        });
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  getFormattedAllergens(): string {
    if (!this.preferences?.allergens) {
      return 'Nie określono';
    }
    const allergens = this.preferences.allergens as string[];
    return allergens.length > 0 
      ? allergens.join(', ')
      : 'Nie określono';
  }

  getMeasurementSystemText(): string {
    if (!this.preferences?.measurement_system) {
      return 'Metryczny';
    }
    return this.preferences.measurement_system === 'metric' ? 'Metryczny' : 'Imperialny';
  }
} 