# API Endpoint Implementation Plan: GET /ingredients

## 1. Przegląd punktu końcowego
Endpoint służy do pobierania listy składników z możliwością wyszukiwania i paginacji. Endpoint zwraca paginowaną listę składników wraz z metadanymi dotyczącymi paginacji.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: `/ingredients`
- Parametry:
  - Wymagane: Brak
  - Opcjonalne:
    - `search`: string (filtrowanie po nazwie)
    - `page`: integer (numer strony)
    - `limit`: integer (liczba elementów na stronę)

## 3. Wykorzystywane typy
```typescript
interface IngredientListItem {
  id: UUID;
  name: string;
}

interface IngredientListResponse {
  data: IngredientListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

interface IngredientListParams {
  search?: string;
  page?: number;
  limit?: number;
}
```

## 4. Szczegóły odpowiedzi
- Status: 200 OK
- Struktura odpowiedzi:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string"
    }
  ],
  "meta": {
    "total": "integer",
    "page": "integer",
    "limit": "integer"
  }
}
```

## 5. Przepływ danych
1. Odbierz żądanie z parametrami wyszukiwania i paginacji
2. Waliduj parametry wejściowe
3. Przygotuj zapytanie do bazy danych:
   - Użyj SupabaseService do wykonania zapytania
   - Zastosuj filtrowanie po nazwie jeśli podano parametr search
   - Zastosuj paginację
4. Przetwórz wyniki do formatu DTO
5. Zwróć odpowiedź z danymi i metadanymi

## 6. Względy bezpieczeństwa
- Wymagaj uwierzytelnienia użytkownika
- Sanityzuj parametr search przed użyciem w zapytaniu
- Implementuj rate limiting
- Waliduj uprawnienia użytkownika
- Używaj prepared statements do zapytań SQL

## 7. Obsługa błędów
- 400 Bad Request:
  - Nieprawidłowe parametry paginacji
  - Nieprawidłowy format parametru search
- 401 Unauthorized:
  - Brak tokenu uwierzytelniającego
  - Nieprawidłowy token
- 403 Forbidden:
  - Brak uprawnień do dostępu
- 500 Internal Server Error:
  - Błędy połączenia z bazą danych
  - Nieoczekiwane błędy serwera

## 8. Rozważania dotyczące wydajności
- Implementuj cachowanie wyników
- Optymalizuj zapytania SQL:
  - Używaj indeksów na kolumnie name
  - Ogranicz liczbę zwracanych kolumn
- Ustaw rozsądne limity dla parametrów:
  - Maksymalna długość parametru search
  - Maksymalna wartość parametru limit
- Implementuj paginację po stronie serwera

## 9. Etapy wdrożenia
1. Utwórz nowy kontroler `IngredientsController`
   - Zaimplementuj metodę GET /ingredients
   - Dodaj walidację parametrów
   - Zaimplementuj obsługę błędów

2. Utwórz serwis `IngredientsService`
   - Zaimplementuj logikę pobierania składników
   - Dodaj obsługę wyszukiwania
   - Zaimplementuj paginację

3. Zaimplementuj walidację danych
   - Utwórz walidatory dla parametrów
   - Dodaj obsługę błędów walidacji

4. Dodaj obsługę bezpieczeństwa
   - Zaimplementuj uwierzytelnianie
   - Dodaj rate limiting
   - Zaimplementuj sanityzację danych

5. Zaimplementuj optymalizacje wydajności
   - Dodaj cachowanie
   - Zoptymalizuj zapytania SQL
   - Ustaw limity parametrów

6. Dodaj testy
   - Testy jednostkowe
   - Testy integracyjne
   - Testy wydajnościowe

7. Dokumentacja
   - Zaktualizuj dokumentację API
   - Dodaj przykłady użycia
   - Opisz obsługę błędów 