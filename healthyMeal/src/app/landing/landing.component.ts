import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatGridListModule
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  features = [
    {
      icon: 'restaurant_menu',
      title: 'Inteligentne Przepisy',
      description: 'Generuj spersonalizowane przepisy na podstawie Twoich preferencji żywieniowych i dostępnych składników.'
    },
    {
      icon: 'psychology',
      title: 'AI-Powered',
      description: 'Wykorzystujemy sztuczną inteligencję do tworzenia zdrowych i smacznych posiłków dopasowanych do Ciebie.'
    },
    {
      icon: 'favorite',
      title: 'Zdrowe Odżywianie',
      description: 'Wszystkie przepisy są starannie dobrane pod kątem wartości odżywczych i zrównoważonej diety.'
    },
    {
      icon: 'schedule',
      title: 'Oszczędność Czasu',
      description: 'Planuj posiłki z wyprzedzeniem i oszczędzaj czas na codziennym gotowaniu.'
    },
    {
      icon: 'kitchen',
      title: 'Zarządzanie Składnikami',
      description: 'Śledź swoje składniki i otrzymuj sugestie przepisów na podstawie tego, co masz w domu.'
    },
    {
      icon: 'trending_up',
      title: 'Śledzenie Postępów',
      description: 'Monitoruj swoje nawyki żywieniowe i osiągaj cele zdrowotne.'
    }
  ];

  testimonials = [
    {
      name: 'Anna Kowalska',
      text: 'HealthyMeal całkowicie zmieniło moje podejście do gotowania. Teraz tworzę zdrowe posiłki bez stresu!',
      rating: 5
    },
    {
      name: 'Piotr Nowak',
      text: 'Fantastyczna aplikacja! AI generuje przepisy, które są nie tylko zdrowe, ale też naprawdę smaczne.',
      rating: 5
    },
    {
      name: 'Maria Wiśniewska',
      text: 'Oszczędzam mnóstwo czasu na planowaniu posiłków. Polecam każdemu, kto chce jeść zdrowiej.',
      rating: 5
    }
  ];
} 