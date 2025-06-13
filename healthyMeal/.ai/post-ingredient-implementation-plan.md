# API Endpoint Implementation Plan: POST /ingredients

## 1. Przegląd punktu końcowego
Endpoint służy do tworzenia nowego składnika w systemie. Endpoint przyjmuje nazwę składnika i zwraca utworzony zasób wraz z jego identyfikatorem oraz znacznikami czasowymi utworzenia i aktualizacji.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: `/ingredients`
- Request Body:
```json
{
  "name": "string"
}
```
- Parametry:
  - Wymagane:
    - name: string (nazwa składnika)
  - Opcjonalne: Brak

## 3. Wykorzystywane typy
```typescript
interface CreateIngredientRequest {
  name: string;
}

interface IngredientResponse {
  id: UUID;
  name: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

## 4. Szczegóły odpowiedzi
- Status: 201 Created
- Struktura odpowiedzi:
```json
{
  "id": "uuid",
  "name": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```
- Kody błędów:
  - 400: Nieprawidłowe dane wejściowe
  - 401: Brak autoryzacji
  - 403: Brak uprawnień
  - 409: Składnik o podanej nazwie już istnieje
  - 500: Błąd serwera

## 5. Przepływ danych
1. Odbierz żądanie z danymi składnika
2. Waliduj dane wejściowe:
   - Sprawdź czy nazwa jest podana
   - Sprawdź długość nazwy
   - Sprawdź format nazwy
3. Sprawdź czy składnik o podanej nazwie już istnieje
4. Utwórz nowy składnik w bazie danych
5. Zwróć utworzony zasób

## 6. Względy bezpieczeństwa
- Wymagaj uwierzytelnienia użytkownika
- Implementuj rate limiting (np. 10 żądań na minutę)
- Sanityzuj dane wejściowe
- Waliduj uprawnienia użytkownika
- Używaj prepared statements do zapytań SQL
- Implementuj CORS
- Wymagaj HTTPS

## 7. Obsługa błędów
- 400 Bad Request:
  - Brak nazwy składnika
  - Nieprawidłowa długość nazwy
  - Nieprawidłowy format nazwy
- 401 Unauthorized:
  - Brak tokenu uwierzytelniającego
  - Nieprawidłowy token
- 403 Forbidden:
  - Brak uprawnień do tworzenia składników
- 409 Conflict:
  - Składnik o podanej nazwie już istnieje
- 500 Internal Server Error:
  - Błędy połączenia z bazą danych
  - Nieoczekiwane błędy serwera

## 8. Rozważania dotyczące wydajności
- Implementuj cachowanie wyników zapytań
- Optymalizuj zapytania SQL:
  - Używaj indeksów na kolumnie name
  - Ogranicz liczbę zwracanych kolumn
- Implementuj rate limiting
- Używaj transakcji dla operacji na bazie danych

## 9. Etapy wdrożenia
1. Utwórz nowy kontroler `IngredientsController`
   - Zaimplementuj metodę POST /ingredients
   - Dodaj walidację danych wejściowych
   - Zaimplementuj obsługę błędów

2. Rozszerz serwis `IngredientsService`
   - Dodaj metodę createIngredient
   - Zaimplementuj walidację duplikatów
   - Dodaj obsługę transakcji

3. Zaimplementuj walidację danych
   - Utwórz walidatory dla nazwy składnika
   - Dodaj obsługę błędów walidacji
   - Zaimplementuj sprawdzanie duplikatów

4. Dodaj obsługę bezpieczeństwa
   - Zaimplementuj uwierzytelnianie
   - Dodaj rate limiting
   - Zaimplementuj sanityzację danych

5. Zaimplementuj obsługę błędów
   - Dodaj middleware do obsługi błędów
   - Zaimplementuj logowanie błędów
   - Dodaj odpowiednie kody statusu

6. Dodaj testy
   - Testy jednostkowe
   - Testy integracyjne
   - Testy wydajnościowe

7. Dokumentacja
   - Zaktualizuj dokumentację API
   - Dodaj przykłady użycia
   - Opisz obsługę błędów 