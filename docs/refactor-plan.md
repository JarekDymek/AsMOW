# Refaktoryzacja AsMOW

## Stan po etapie 1-3

- `index.html` zawiera strukturę widoków i odwołania do zasobów.
- `assets/css/app.css` zawiera style aplikacji.
- `assets/js/data.js` zawiera stałe dane: harmonogram dnia, procedury, stopnie, szybkie pytania i podstawy prawne.
- `assets/js/state.js` zawiera wspólny stan i klucze `localStorage`.
- `assets/js/ui.js` zawiera nawigację, zegar, harmonogram dnia, render procedur, stopni i podstaw prawnych.
- `assets/js/notes.js` zawiera notatnik dyżuru.
- `assets/js/ai.js` zawiera czat AI, głos, historię, retry i wspólne czytanie plików.
- `assets/js/harmonogram.js` zawiera lokalne wgrywanie i analizę harmonogramu z pliku/screena.
- `assets/js/weekly-plan.js` zawiera integrację z generatorem Harmonogram-MOW.
- `assets/js/knowledge-base.js` zawiera bazę wiedzy, wzory dokumentów i zmiany czasowe.
- `assets/js/pwa.js` zawiera instalację PWA i rejestrację service workera.
- `assets/js/app.js` zawiera inicjalizację aplikacji.
- `backend/server.js` serwuje pliki z katalogu `assets`.
- `sw.js` zapisuje nowe zasoby w cache PWA.

## Następne bezpieczne etapy

1. Wydzielić CSS na `base.css`, `components.css`, `screens.css` i `mobile.css`.
2. Uporządkować `ai.js`: osobno czat, pliki, dyktowanie głosowe i kontekst odpowiedzi.
3. Dodać prosty tryb diagnostyczny dla harmonogramu tygodniowego.
4. Dodać test sprawdzający obecność wszystkich zasobów z `index.html` i `sw.js`.
5. Rozważyć migrację na moduły ES dopiero po pełnym przetestowaniu klasycznego podziału.

## Zasada utrzymania

Każdy etap powinien być osobnym commitem i po każdym etapie trzeba sprawdzić:

- składnię JavaScript,
- uruchamianie aplikacji,
- połączenie AI,
- pobieranie harmonogramu tygodniowego,
- działanie bazy wiedzy,
- aktualizację cache PWA.
