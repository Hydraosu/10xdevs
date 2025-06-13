# Dokument wymagań produktu (PRD) - HealthyMeal

## 1. Przegląd produktu
HealthyMeal to webowa aplikacja (MVP) pomagająca osobom bez wiedzy dietetycznej planować zdrowe
i smaczne posiłki lub redukcję masy ciała. Wykorzystuje model AI do generowania kompletnych
przepisów dopasowanych do preferencji żywieniowych użytkownika (alergeny, makro/mikro‑składniki,
kaloryczność) albo – w razie braku wskazań – tworzy ogólne, zbilansowane receptury.
Aplikacja od początku mierzy kluczowe wskaźniki za pomocą wbudowanej analityki.

## 2. Problem użytkownika
Dostępne w internecie przepisy wymagają ręcznego dostosowania do indywidualnych potrzeb
(liczenie kalorii, eliminacja alergenów, właściwe makro/mikro‑składniki). Proces ten jest czasochłonny,
wymaga wiedzy dietetycznej i prowadzi do frustracji, zwłaszcza gdy trzeba łączyć wiele źródeł
informacji. Użytkownicy potrzebują prostego narzędzia, które automatycznie tworzy lub modyfikuje
przepisy zgodnie z ich celami i ograniczeniami.

## 3. Wymagania funkcjonalne
1. Generator przepisów AI poprzez wybrany model w openrouter:
   - Uwzględnia kaloryczność, makro/mikro‑składniki, alergeny.
   - Zachowuje prawidłowe proporcje składników.
   - Działa także, gdy użytkownik nie poda preferencji.
2. Profil preferencji użytkownika:
   - Pola opcjonalne: alergeny (lista), dzienny cel kaloryczny, rozkład B/T/W,
     dodatkowe mikro‑składniki (do ustalenia).
   - Edycja i zapisywanie w bazie.
3. CRUD receptur w Supabase Postgres:
   - Zapis, odczyt, przegląd, usunięcie przepisów przypisanych do konta.
4. Autentykacja:
   - Rejestracja i logowanie poprzez e‑mail/hasło (Supabase Auth).
   - Reset hasła przez e‑mail.
5. Interfejs użytkownika (Angular 19):
   - PWA gotowa do użycia mobilnego.
   - Lista „Moje przepisy” z sortowaniem.
   - Formularz preferencji z podpowiedziami (autocomplete alergenów).
6. Analityka i KPI:
   - Zdarzenia: sign_up, profile_completed, recipe_generated, recipe_deleted, recipe_feedback.
   - Integracja Amplitude lub GA4 w pierwszym sprincie.
7. Mechanizm opinii:
   - Thumbs up / thumbs down + opcjonalny komentarz przy każdym przepisie.
8. Soft‑nag:
   - Delikatne powiadomienie zachęcające do uzupełnienia preferencji, gdy profil nie wypełniony.
9. Zgodność z RODO:
   - Polityka prywatności, zgody na przetwarzanie preferencji, usuwanie konta i danych.
10. Bezpieczeństwo i dostęp:
    - Szyfrowanie haseł, rate limiting przy logowaniu, uwierzytelnianie tokenami JWT.

## 4. Granice produktu
### Zakres MVP
- Generator przepisów AI i profil preferencji.
- CRUD tekstowych receptur.
- Podstawowa analityka zdarzeń.
- UI bez importu URL ani multimediów.
- Front‑end Angular 19, back‑end Supabase.

### Poza zakresem MVP
- Import przepisów z URL lub zdjęć.
- Zaawansowane społecznościowe funkcje udostępniania.
- Rozbudowana obsługa multimediów.
- Optymalizacja kosztu posiłku (do rozważenia w kolejnych iteracjach).
- Eksport listy zakupów (CSV/PDF) – wymaga priorytetyzacji.

### Założenia techniczne
- Supabase Postgres hostuje dane oraz obsługa dowolnego modelu ai przy uzyciu openrouter.
- Mikroserwisowa architektura umożliwia łatwe rozszerzenia.

## 5. Historyjki użytkowników

| ID | Tytuł | Opis | Kryteria akceptacji |
|----|-------|------|---------------------|
| US‑001 | Rejestracja konta | Jako nowy użytkownik chcę zarejestrować konto e‑mail/hasło, aby móc zapisywać przepisy. | • Formularz rejestracji przyjmuje poprawny e‑mail i silne hasło. <br>• Po zatwierdzeniu wysyłany jest e‑mail weryfikacyjny. <br>• Konto pojawia się w Supabase z unikalnym ID. |
| US‑002 | Logowanie | Jako użytkownik chcę się zalogować, aby uzyskać dostęp do moich przepisów. | • Poprawne dane → token JWT ważny 60 min. <br>• Błędne dane → komunikat o błędzie bez ujawniania, które pole jest niepoprawne. |
| US‑003 | Reset hasła | Jako zapominalski użytkownik chcę zresetować hasło, aby odzyskać dostęp. | • Link resetu wysyłany e‑mailem. <br>• Nowe hasło spełnia reguły złożoności. |
| US‑004 | Uzupełnienie preferencji | Jako użytkownik chcę określić alergeny, kalorie i makro, aby otrzymywać dopasowane przepisy. | • Formularz zapisuje dane w bazie. <br>• Zdarzenie profile_completed rejestrowane po zapisie ≥ 1 pola. |
| US‑005 | Edycja preferencji | Jako użytkownik chcę edytować moje preferencje, aby aktualizować cele żywieniowe. | • Zmiany zapisywane w bazie. <br>• Potwierdzenie sukcesu widoczne w UI. |
| US‑006 | Generowanie przepisu z preferencjami | Jako użytkownik chcę otrzymać przepis zgodny z moimi preferencjami. | • Klik „Generuj” → AI zwraca przepis uwzględniający wszystkie zaznaczone preferencje. <br>• Kaloryczność nie przekracza celu ±10 %. |
| US‑007 | Generowanie przepisu bez preferencji | Jako użytkownik bez profilu chcę uzyskać uniwersalny przepis. | • Brak preferencji → AI generuje ogólny, zbilansowany przepis. |
| US‑008 | Zapis przepisu | Jako użytkownik chcę zapisać wygenerowany przepis, aby wrócić do niego później. | • Przepis zapisany w bazie z datą utworzenia. |
| US‑009 | Przegląd moich przepisów | Jako użytkownik chcę przeglądać listę zapisanych przepisów. | • Lista zwraca wszystkie przepisy powiązane z moim kontem. <br>• Można sortować po dacie. |
| US‑010 | Usunięcie przepisu | Jako użytkownik chcę usunąć przepis, gdy nie jest mi już potrzebny. | • Po potwierdzeniu rekord usuwa się z bazy. |
| US‑011 | Feedback do przepisu | Jako użytkownik chcę ocenić przepis, aby pomóc poprawić AI. | • Widoczne przyciski thumbs up/down. <br>• Zdarzenie recipe_feedback rejestrowane z oceną. |
| US‑012 | Soft‑nag o preferencjach | Jako użytkownik bez profilu widzę sugestię uzupełnienia danych dla lepszych wyników. | • Powiadomienie pojawia się maks. 1 raz/dzień do czasu wypełnienia profilu. |
| US‑013 | Bezpieczne przechowywanie danych | Jako właściciel danych chcę mieć pewność, że moje dane są przechowywane bezpiecznie. | • Hasła są haszowane (bcrypt). <br>• Dane przesyłane przez HTTPS. |
| US‑014 | Wylogowanie | Jako użytkownik chcę się wylogować, aby zakończyć sesję. | • Token unieważniony po wylogowaniu. |
| US‑015 | Zdarzenia analityczne | Jako właściciel produktu chcę rejestrować kluczowe zdarzenia, aby śledzić KPI. | • Każde zdarzenie zdefiniowane w sekcji KPI wysyła payload do Amplitude/GA4. |

## 6. Metryki sukcesu

| KPI | Definicja | Cel MVP | Sposób pomiaru |
|-----|-----------|---------|----------------|
| Wypełnienie profilu | Użytkownik zapisał min. 1 pole preferencji | ≥ 90 % | event profile_completed / sign_up |
| Aktywność AI | ≥ 1 recipe_generated / 7 dni na użytkownika | ≥ 75 % | rolling 7‑day window na event recipe_generated |
| Retencja 4‑tyg | Użytkownik wraca w czwartym tygodniu i generuje przepis | ≥ 40 % | cohort analysis w Amplitude |
| Pozytywny feedback | Thumbs up ÷ (thumbs up + down) | ≥ 80 % | event recipe_feedback |
| Czas wygenerowania przepisu | Średni czas od kliknięcia do otrzymania przepisu | ≤ 5 s | front‑end perf logs |
| Uptime usługi | Dostępność API w skali miesiąca | ≥ 99,5 % | monitoring Supabase |