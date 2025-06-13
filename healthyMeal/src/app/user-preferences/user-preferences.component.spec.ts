import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { UserPreferencesComponent } from './user-preferences.component';
import { UserPreferencesService } from '../user-preferences.service';
import { UserPreferencesResponse } from '../../types';

describe('UserPreferencesComponent', () => {
  let component: UserPreferencesComponent;
  let fixture: ComponentFixture<UserPreferencesComponent>;
  let mockUserPreferencesService: jasmine.SpyObj<UserPreferencesService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const mockUserPreferences: UserPreferencesResponse = {
    id: '123',
    daily_calories: 2000,
    protein_percentage: 30,
    carbs_percentage: 40,
    fat_percentage: 30,
    allergens: ['nuts', 'dairy'],
    micro_nutrients: { iron: 18, calcium: 1000 } as any,
    measurement_system: 'metric'
  };

  beforeEach(async () => {
    const userPreferencesServiceSpy = jasmine.createSpyObj('UserPreferencesService', [
      'getUserPreferences',
      'updateUserPreferences',
      'clearPreferencesCache'
    ]);

    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    const mockActivatedRoute = {
      snapshot: {
        paramMap: new Map(),
        queryParamMap: new Map(),
        params: {},
        queryParams: {},
        url: [],
        outlet: 'primary',
        component: null,
        data: {},
        fragment: null,
        root: null,
        parent: null,
        firstChild: null,
        children: [],
        pathFromRoot: [],
        routeConfig: null
      },
      paramMap: { get: () => null },
      queryParamMap: { get: () => null }
    };

    await TestBed.configureTestingModule({
      imports: [
        UserPreferencesComponent,
        NoopAnimationsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: UserPreferencesService, useValue: userPreferencesServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserPreferencesComponent);
    component = fixture.componentInstance;
    mockUserPreferencesService = TestBed.inject(UserPreferencesService) as jasmine.SpyObj<UserPreferencesService>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default loading state', () => {
      expect(component.isLoading).toBe(true);
      expect(component.preferences).toBeNull();
    });

    it('should load user preferences on init', () => {
      mockUserPreferencesService.getUserPreferences.and.returnValue(Promise.resolve(mockUserPreferences));

      component.ngOnInit();

      expect(mockUserPreferencesService.getUserPreferences).toHaveBeenCalled();
    });
  });

  describe('Data Loading', () => {
    it('should update preferences when loaded successfully', fakeAsync(() => {
      mockUserPreferencesService.getUserPreferences.and.returnValue(Promise.resolve(mockUserPreferences));

      fixture.detectChanges(); // Uruchamia ngOnInit
      tick(); // Symuluje wykonanie Promise
      fixture.detectChanges();

      expect(component.preferences).toEqual(mockUserPreferences);
      expect(component.isLoading).toBe(false);
    }));



    it('should show loading state during data fetch', () => {
      mockUserPreferencesService.getUserPreferences.and.returnValue(Promise.resolve(mockUserPreferences));

      expect(component.isLoading).toBe(true);
      
      fixture.detectChanges(); // Uruchamia ngOnInit
      
      expect(component.isLoading).toBe(true); // Nadal loading podczas async operacji
    });

    it('should handle null preferences response', fakeAsync(() => {
      mockUserPreferencesService.getUserPreferences.and.returnValue(Promise.resolve(null as any));

      fixture.detectChanges(); // Uruchamia ngOnInit
      tick(); // Symuluje wykonanie Promise
      fixture.detectChanges();

      expect(component.preferences).toBeNull();
      expect(component.isLoading).toBe(false);
    }));
  });

  describe('Template Rendering', () => {
    beforeEach(async () => {
      mockUserPreferencesService.getUserPreferences.and.returnValue(Promise.resolve(mockUserPreferences));
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    });

    it('should show loading spinner when loading', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner).toBeTruthy();
    });

    it('should display preferences data when loaded', () => {
      expect(component.preferences).toEqual(mockUserPreferences);
    });

    it('should display daily calories correctly', () => {
      expect(component.preferences?.daily_calories).toBe(2000);
    });

    it('should display macronutrient percentages correctly', () => {
      expect(component.preferences?.protein_percentage).toBe(30);
      expect(component.preferences?.carbs_percentage).toBe(40);
      expect(component.preferences?.fat_percentage).toBe(30);
    });

    it('should display measurement system correctly', () => {
      expect(component.preferences?.measurement_system).toBe('metric');
    });

    it('should display allergens when present', () => {
      expect(component.preferences?.allergens).toBeDefined();
      expect(Array.isArray(component.preferences?.allergens)).toBe(true);
    });
  });

  describe('Helper Methods', () => {
    beforeEach(() => {
      component.preferences = mockUserPreferences;
    });

    it('should format allergens correctly when present', () => {
      const result = component.getFormattedAllergens();
      expect(result).toBe('nuts, dairy');
    });

    it('should handle empty allergens array', () => {
      const preferencesWithEmptyAllergens = Object.assign({}, mockUserPreferences);
      preferencesWithEmptyAllergens.allergens = [];
      component.preferences = preferencesWithEmptyAllergens;

      const result = component.getFormattedAllergens();
      expect(result).toBe('Nie określono');
    });

    it('should handle null allergens', () => {
      const preferencesWithNullAllergens = Object.assign({}, mockUserPreferences);
      preferencesWithNullAllergens.allergens = null;
      component.preferences = preferencesWithNullAllergens;

      const result = component.getFormattedAllergens();
      expect(result).toBe('Nie określono');
    });

    it('should format metric measurement system', () => {
      const result = component.getMeasurementSystemText();
      expect(result).toBe('Metryczny');
    });

    it('should format imperial measurement system', () => {
      const preferencesWithImperial = Object.assign({}, mockUserPreferences);
      preferencesWithImperial.measurement_system = 'imperial';
      component.preferences = preferencesWithImperial;

      const result = component.getMeasurementSystemText();
      expect(result).toBe('Imperialny');
    });

    it('should handle null measurement system', () => {
      const preferencesWithNullSystem = Object.assign({}, mockUserPreferences);
      preferencesWithNullSystem.measurement_system = null;
      component.preferences = preferencesWithNullSystem;

      const result = component.getMeasurementSystemText();
      expect(result).toBe('Metryczny');
    });

    it('should handle preferences being null', () => {
      component.preferences = null;

      const allergensResult = component.getFormattedAllergens();
      const systemResult = component.getMeasurementSystemText();

      expect(allergensResult).toBe('Nie określono');
      expect(systemResult).toBe('Metryczny');
    });
  });



  describe('Loading States', () => {
    it('should start with loading state', () => {
      expect(component.isLoading).toBe(true);
    });

    it('should stop loading after successful data fetch', async () => {
      mockUserPreferencesService.getUserPreferences.and.returnValue(Promise.resolve(mockUserPreferences));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isLoading).toBe(false);
    });

    it('should stop loading after error', async () => {
      mockUserPreferencesService.getUserPreferences.and.returnValue(Promise.reject('Error'));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isLoading).toBe(false);
    });
  });

  describe('Component Integration', () => {
    it('should call loadPreferences method in ngOnInit', () => {
      spyOn(component as any, 'loadPreferences');

      component.ngOnInit();

      expect((component as any).loadPreferences).toHaveBeenCalled();
    });

    it('should handle complete preference object', async () => {
      const completePreferences: UserPreferencesResponse = {
        id: '456',
        daily_calories: 2500,
        protein_percentage: 25,
        carbs_percentage: 45,
        fat_percentage: 30,
        allergens: ['gluten', 'soy', 'eggs'],
        micro_nutrients: { iron: 20, calcium: 1200 },
        measurement_system: 'imperial'
      };

      mockUserPreferencesService.getUserPreferences.and.returnValue(Promise.resolve(completePreferences));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.preferences).toEqual(completePreferences);
      expect(component.getFormattedAllergens()).toBe('gluten, soy, eggs');
      expect(component.getMeasurementSystemText()).toBe('Imperialny');
    });
  });
}); 