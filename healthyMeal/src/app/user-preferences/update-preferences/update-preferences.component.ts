import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserPreferencesService } from '../../user-preferences.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserPreferencesResponse } from '../../../types';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';


@Component({
  selector: 'app-update-preferences',
  templateUrl: './update-preferences.component.html',
  styleUrls: ['./update-preferences.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatIconModule,
    MatTooltipModule,
    MatListModule,
    MatExpansionModule,
    MatStepperModule,
    MatRadioModule
  ],
})
export class UpdatePreferencesComponent implements OnInit {
  preferencesForm: FormGroup;
  isLoading = false;
  currentPreferences: UserPreferencesResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private userPreferencesService: UserPreferencesService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.preferencesForm = this.fb.group({
      daily_calories: [null, [Validators.min(0)]],
      protein_percentage: [null, [Validators.min(0), Validators.max(100)]],
      carbs_percentage: [null, [Validators.min(0), Validators.max(100)]],
      fat_percentage: [null, [Validators.min(0), Validators.max(100)]],
      allergens: [[]],
      micro_nutrients: [{}],
      measurement_system: ['metric', [Validators.pattern(/^(metric|imperial)$/)]]
    });
  }

  ngOnInit(): void {
    this.loadCurrentPreferences();
  }

  private loadCurrentPreferences(): void {
    this.isLoading = true;
    this.userPreferencesService.getUserPreferences()
      .then(preferences => {
        this.currentPreferences = preferences;
        this.preferencesForm.patchValue(preferences);
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

  onSubmit(): void {
    if (this.preferencesForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formValue = this.preferencesForm.value;

    // Filter out undefined values
    const updateData = Object.fromEntries(
      Object.entries(formValue).filter(([_, value]) => value !== undefined)
    );

    this.userPreferencesService.updatePreferences(updateData)
      .then(() => {
        this.snackBar.open('Preferencje zostały zaktualizowane pomyślnie', 'Zamknij', {
          duration: 3000
        });
        this.router.navigate(['/app/preferences']);
      })
      .catch(error => {
        console.error('Error updating preferences:', error);
        this.snackBar.open(error.message || 'Nie udało się zaktualizować preferencji', 'Zamknij', {
          duration: 3000
        });
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
} 