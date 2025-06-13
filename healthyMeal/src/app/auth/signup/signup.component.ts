import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { SignUpRequest, SignUpResponse, ErrorResponse } from '../../../types';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    RouterModule
  ],
  template: `
    <div class="signup-container">
      <div class="signup-content">
        <!-- Logo and Brand -->
        <div class="brand-section">
          <div class="brand-logo">
            <mat-icon class="logo-icon">restaurant</mat-icon>
            <span class="brand-name">HealthyMeal</span>
          </div>
          <p class="brand-subtitle">Utwórz swoje konto</p>
        </div>

        <!-- Signup Form -->
        <mat-card class="signup-card">
          <mat-card-content>
            <form (ngSubmit)="onSubmit()" #signupForm="ngForm" class="signup-form">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Adres email</mat-label>
                <input
                  matInput
                  type="email"
                  name="email"
                  [(ngModel)]="signupData.email"
                  required
                  email
                  #email="ngModel"
                  placeholder="Wprowadź swój email"
                  autocomplete="email"
                />
                <mat-icon matSuffix class="field-icon">email</mat-icon>
                <mat-error *ngIf="email.invalid && (email.dirty || email.touched)">
                  <span *ngIf="email.errors?.['required']">Email jest wymagany</span>
                  <span *ngIf="email.errors?.['email']">Proszę wprowadzić prawidłowy email</span>
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Hasło</mat-label>
                <input
                  matInput
                  type="password"
                  name="password"
                  [(ngModel)]="signupData.password"
                  required
                  minlength="8"
                  #password="ngModel"
                  placeholder="Wprowadź swoje hasło"
                  autocomplete="new-password"
                />
                <mat-icon matSuffix class="field-icon">lock</mat-icon>
                <mat-error *ngIf="password.invalid && (password.dirty || password.touched)">
                  <span *ngIf="password.errors?.['required']">Hasło jest wymagane</span>
                  <span *ngIf="password.errors?.['minlength']">Hasło musi mieć co najmniej 8 znaków</span>
                </mat-error>
                <mat-hint>Hasło powinno mieć co najmniej 8 znaków</mat-hint>
              </mat-form-field>

              <button
                mat-raised-button
                type="submit"
                [disabled]="signupForm.invalid || isLoading"
                class="signup-button"
              >
                <mat-spinner diameter="20" *ngIf="isLoading" class="button-spinner"></mat-spinner>
                <mat-icon *ngIf="!isLoading">person_add</mat-icon>
                <span *ngIf="!isLoading">Zarejestruj się</span>
              </button>
            </form>

            <div class="form-footer">
              <p class="login-link">
                Masz już konto? 
                <a routerLink="/login" class="link">Zaloguj się</a>
              </p>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Back to Home -->
        <div class="back-to-home">
          <a routerLink="/" class="home-link">
            <mat-icon>arrow_back</mat-icon>
            Powrót do strony głównej
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .signup-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="50" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="30" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        pointer-events: none;
      }
    }

    .signup-content {
      width: 100%;
      max-width: 420px;
      position: relative;
      z-index: 1;
    }

    .brand-section {
      text-align: center;
      margin-bottom: 32px;
      color: white;

      .brand-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-bottom: 16px;

        .logo-icon {
          font-size: 3rem;
          width: 3rem;
          height: 3rem;
          color: #ffd54f;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .brand-name {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(45deg, #ffd54f, #ffcc02);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
      }

      .brand-subtitle {
        font-size: 1.1rem;
        opacity: 0.9;
        margin: 0;
        font-weight: 300;
      }
    }

    .signup-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
      }

      mat-card-content {
        padding: 40px;
      }
    }

    .signup-form {
      display: flex;
      flex-direction: column;
      gap: 24px;

      .form-field {
        width: 100%;

        .mat-mdc-form-field-wrapper {
          padding-bottom: 0;
        }

        .mat-mdc-text-field-wrapper {
          border-radius: 12px;
          background-color: #f8f9fa;
          transition: all 0.3s ease;

          &:hover {
            background-color: #e9ecef;
          }
        }

        .mat-mdc-form-field-focus-overlay {
          border-radius: 12px;
        }

        .field-icon {
          color: #667eea;
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }

        &.mat-focused .field-icon {
          opacity: 1;
        }

        .mat-mdc-form-field-label {
          color: #495057;
          font-weight: 500;
        }

        input {
          font-size: 1rem;
          padding: 16px 12px;
        }

        .mat-mdc-form-field-hint {
          color: #6c757d;
          font-size: 0.85rem;
        }
      }
    }

    .signup-button {
      width: 100%;
      height: 56px;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      font-size: 1.1rem;
      font-weight: 600;
      border: none;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #5a6fd8, #6a42a0);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
      }

      .button-spinner {
        margin-right: 8px;
      }

      mat-icon {
        font-size: 1.2rem;
      }
    }

    .form-footer {
      margin-top: 24px;
      text-align: center;

      .login-link {
        margin: 0;
        color: #6c757d;
        font-size: 0.95rem;

        .link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;

          &:hover {
            color: #5a6fd8;
            text-decoration: underline;
          }
        }
      }
    }

    .back-to-home {
      text-align: center;
      margin-top: 32px;

      .home-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: white;
        text-decoration: none;
        font-size: 0.95rem;
        opacity: 0.8;
        transition: all 0.3s ease;
        padding: 8px 16px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);

        &:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        mat-icon {
          font-size: 1.1rem;
        }
      }
    }

    // Responsive Design
    @media (max-width: 768px) {
      .signup-container {
        padding: 16px;
      }

      .signup-content {
        max-width: 100%;
      }

      .brand-section {
        margin-bottom: 24px;

        .brand-logo {
          .logo-icon {
            font-size: 2.5rem;
            width: 2.5rem;
            height: 2.5rem;
          }

          .brand-name {
            font-size: 2rem;
          }
        }

        .brand-subtitle {
          font-size: 1rem;
        }
      }

      .signup-card {
        mat-card-content {
          padding: 24px;
        }
      }

      .signup-form {
        gap: 20px;
      }

      .signup-button {
        height: 48px;
        font-size: 1rem;
      }
    }

    @media (max-width: 480px) {
      .brand-section {
        .brand-logo {
          flex-direction: column;
          gap: 8px;

          .logo-icon {
            font-size: 2rem;
            width: 2rem;
            height: 2rem;
          }

          .brand-name {
            font-size: 1.8rem;
          }
        }
      }

      .signup-card {
        mat-card-content {
          padding: 20px;
        }
      }
    }
  `]
})
export class SignupComponent {
  signupData: SignUpRequest = {
    email: '',
    password: ''
  };
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async onSubmit() {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      const response = await this.authService.signUp(this.signupData);
      
      if (response.error) {
        this.snackBar.open(response.error.message, 'Zamknij', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        return;
      }

      if (response.session) {
        // Store the session tokens
        localStorage.setItem('access_token', response.session.access_token);
        localStorage.setItem('refresh_token', response.session.refresh_token);
        
        this.snackBar.open('Rejestracja pomyślna!', 'Zamknij', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        
        // Redirect to home page or dashboard
        this.router.navigate(['/app/dashboard']);
      }
    } catch (error) {
      this.snackBar.open('Wystąpił nieoczekiwany błąd', 'Zamknij', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }
} 