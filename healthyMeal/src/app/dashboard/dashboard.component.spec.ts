import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { DashboardService, DashboardStats, ActivityItem } from './dashboard.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockDashboardService: jasmine.SpyObj<DashboardService>;

  const mockStats: DashboardStats = {
    totalRecipes: 15,
    totalIngredients: 50,
    totalActiveDays: 5
  };

  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'recipe_added',
      title: 'Nowy przepis dodany: Sałatka grecka',
      timestamp: new Date('2023-01-01T10:00:00Z')
    },
    {
      id: '2',
      type: 'favorite_added',
      title: 'Dodano do ulubionych',
      timestamp: new Date('2023-01-01T09:00:00Z')
    }
  ];

  beforeEach(async () => {
    const dashboardServiceSpy = jasmine.createSpyObj('DashboardService', [
      'getStats',
      'getActivities',
      'formatTimestamp'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        NoopAnimationsModule,
        RouterModule.forRoot([])
      ],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    mockDashboardService = TestBed.inject(DashboardService) as jasmine.SpyObj<DashboardService>;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.stats).toEqual({
        totalRecipes: 0,
        totalIngredients: 0,
        totalActiveDays: 0
      });
      expect(component.activities).toEqual([]);
      expect(component.loading).toBe(true);
    });

    it('should load dashboard data on init', () => {
      mockDashboardService.getStats.and.returnValue(of(mockStats));
      mockDashboardService.getActivities.and.returnValue(of(mockActivities));
      mockDashboardService.formatTimestamp.and.returnValue('1 hour ago');

      component.ngOnInit();

      expect(mockDashboardService.getStats).toHaveBeenCalled();
      expect(mockDashboardService.getActivities).toHaveBeenCalled();
    });
  });

  describe('Data Loading', () => {
    it('should update stats when loaded successfully', () => {
      mockDashboardService.getStats.and.returnValue(of(mockStats));
      mockDashboardService.getActivities.and.returnValue(of(mockActivities));
      mockDashboardService.formatTimestamp.and.returnValue('1 hour ago');

      fixture.detectChanges();

      expect(component.stats).toEqual(mockStats);
    });

    it('should update activities when loaded successfully', () => {
      mockDashboardService.getStats.and.returnValue(of(mockStats));
      mockDashboardService.getActivities.and.returnValue(of(mockActivities));
      mockDashboardService.formatTimestamp.and.returnValue('1 hour ago');

      fixture.detectChanges();

      expect(component.activities).toEqual(mockActivities);
      expect(component.loading).toBe(false);
    });

    it('should handle stats loading errors', () => {
      spyOn(console, 'error');
      mockDashboardService.getStats.and.returnValue(throwError('Stats error'));
      mockDashboardService.getActivities.and.returnValue(of(mockActivities));
      mockDashboardService.formatTimestamp.and.returnValue('1 hour ago');

      fixture.detectChanges();

      expect(console.error).toHaveBeenCalledWith('Error loading dashboard stats:', 'Stats error');
    });

    it('should handle activities loading errors', () => {
      spyOn(console, 'error');
      mockDashboardService.getStats.and.returnValue(of(mockStats));
      mockDashboardService.getActivities.and.returnValue(throwError('Activities error'));
      mockDashboardService.formatTimestamp.and.returnValue('1 hour ago');

      fixture.detectChanges();

      expect(console.error).toHaveBeenCalledWith('Error loading activities:', 'Activities error');
      expect(component.loading).toBe(false);
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      mockDashboardService.getStats.and.returnValue(of(mockStats));
      mockDashboardService.getActivities.and.returnValue(of(mockActivities));
      mockDashboardService.formatTimestamp.and.returnValue('1 hour ago');
      fixture.detectChanges();
    });

    it('should display dashboard title', () => {
      const titleElement = fixture.debugElement.query(By.css('.dashboard-title'));
      expect(titleElement.nativeElement.textContent.trim()).toBe('Witaj w HealthyMeal');
    });

    it('should display stats correctly', () => {
      const statValues = fixture.debugElement.queryAll(By.css('.stat-value'));
      
      expect(statValues[0].nativeElement.textContent.trim()).toBe('15');
      expect(statValues[1].nativeElement.textContent.trim()).toBe('50');
      expect(statValues[2].nativeElement.textContent.trim()).toBe('5');
    });

    it('should display stat labels correctly', () => {
      const statLabels = fixture.debugElement.queryAll(By.css('.stat-label'));
      
      expect(statLabels[0].nativeElement.textContent.trim()).toBe('Wszystkie Przepisy');
      expect(statLabels[1].nativeElement.textContent.trim()).toBe('Składniki');
      expect(statLabels[2].nativeElement.textContent.trim()).toBe('Dni Aktywności');
    });

    it('should display quick action cards', () => {
      const actionCards = fixture.debugElement.queryAll(By.css('.action-card'));
      
      expect(actionCards).toHaveSize(4);
      expect(actionCards[0].attributes['ng-reflect-router-link']).toBe('/app/recipes/create');
      expect(actionCards[1].attributes['ng-reflect-router-link']).toBe('/app/recipes/generate');
      expect(actionCards[2].attributes['ng-reflect-router-link']).toBe('/app/ingredients');
      expect(actionCards[3].attributes['ng-reflect-router-link']).toBe('/app/preferences');
    });

    it('should display activities when available', () => {
      const activityItems = fixture.debugElement.queryAll(By.css('.activity-item'));
      
      expect(activityItems).toHaveSize(2);
      
      const firstActivityTitle = activityItems[0].query(By.css('.activity-title'));
      expect(firstActivityTitle.nativeElement.textContent.trim())
        .toBe('Nowy przepis dodany: Sałatka grecka');
    });

    it('should show loading spinner when loading', () => {
      component.loading = true;
      fixture.detectChanges();
      
      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner).toBeTruthy();
    });

    it('should show no activities message when activities array is empty', () => {
      component.activities = [];
      component.loading = false;
      fixture.detectChanges();
      
      const noActivitiesMessage = fixture.debugElement.query(By.css('.no-activities'));
      expect(noActivitiesMessage.nativeElement.textContent.trim())
        .toBe('Brak ostatniej aktywności');
    });
  });

  describe('Helper Methods', () => {
    it('should get correct activity icon for recipe_added', () => {
      const icon = component.getActivityIcon('recipe_added');
      expect(icon).toBe('add_circle');
    });

    it('should get correct activity icon for meal_plan_updated', () => {
      const icon = component.getActivityIcon('meal_plan_updated');
      expect(icon).toBe('edit');
    });

    it('should get correct activity icon for favorite_added', () => {
      const icon = component.getActivityIcon('favorite_added');
      expect(icon).toBe('favorite');
    });

    it('should get default activity icon for unknown type', () => {
      const icon = component.getActivityIcon('unknown_type');
      expect(icon).toBe('info');
    });

    it('should format timestamp by calling service method', () => {
      const testDate = new Date('2023-01-01T10:00:00Z');
      mockDashboardService.formatTimestamp.and.returnValue('2 hours ago');

      const result = component.formatTimestamp(testDate);

      expect(mockDashboardService.formatTimestamp).toHaveBeenCalledWith(testDate);
      expect(result).toBe('2 hours ago');
    });
  });

  describe('Component Lifecycle', () => {
    it('should clean up subscriptions on destroy', () => {
      const destroySpy = spyOn(component['destroy$'], 'next');
      const completeSpy = spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should unsubscribe from observables on destroy', () => {
      mockDashboardService.getStats.and.returnValue(of(mockStats));
      mockDashboardService.getActivities.and.returnValue(of(mockActivities));
      
      fixture.detectChanges();
      
      const destroySpy = spyOn(component['destroy$'], 'next');
      component.ngOnDestroy();
      
      expect(destroySpy).toHaveBeenCalled();
    });
  });


}); 