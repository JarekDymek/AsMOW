# Refaktoryzacja AsMOW

## Stan po etapie 1-6

- `index.html` zawiera strukturę widoków i odwołania do zasobów.
- `assets/css/base.css` zawiera reset, podstawy i zmienne kolorystyczne.
- `assets/css/layout.css` zawiera nagłówek, dolną nawigację i główne układy ekranów.
- `assets/css/components.css` zawiera wspólne komponenty: karty, przyciski, listy, chat AI, notatnik i widoki szczegółów.
- `assets/css/harmonogram.css` zawiera style wgrywania harmonogramu, podglądu obrazu, planu tygodniowego i bazy wiedzy.
- `assets/css/utilities.css` zawiera style pomocnicze, responsywność i style arkusza notatnika.
- Dane aplikacji są rozdzielone na `data-schedule.js`, `data-procedures.js`, `data-social-levels.js`, `data-quick-actions.js`, `data-chat-pills.js` i `data-laws.js`; `data.js` pozostaje małym plikiem informacyjnym.
- `assets/js/state.js` zawiera wspólny stan i klucze `localStorage`.
- `assets/js/navigation.js`, `clock.js`, `day-schedule.js`, `main-actions.js`, `procedures.js`, `social-levels.js`, `law.js` i `tab-ai.js` zawierają funkcje interfejsu podzielone według obszarów aplikacji.
- `assets/js/notes.js` zawiera notatnik dyżuru.
- `assets/js/utils.js` zawiera wspólne funkcje formatowania i escapowania tekstu.
- `assets/js/files.js` zawiera wspólne czytanie TXT, Word, Excel i obrazów.
- `assets/js/ai-config.js` zawiera konfigurację backendu AI i budowanie kontekstu odpowiedzi.
- `assets/js/ai-chat.js` zawiera czat AI, historię, retry i załączniki czatu.
- `assets/js/ai-voice.js` zawiera dyktowanie głosowe.
- `assets/js/ai.js` pozostaje małym plikiem informacyjnym po podziale AI.
- `assets/js/ui.js` pozostaje małym plikiem informacyjnym po podziale interfejsu.
- `assets/js/harmonogram.js` zawiera lokalne wgrywanie i analizę harmonogramu z pliku/screena.
- `assets/js/weekly-plan.js` zawiera integrację z generatorem Harmonogram-MOW.
- `assets/js/knowledge-base.js` zawiera bazę wiedzy, wzory dokumentów i zmiany czasowe.
- `assets/js/pwa.js` zawiera instalację PWA i rejestrację service workera.
- `assets/js/app.js` zawiera inicjalizację aplikacji.
- `backend/server.js` serwuje pliki z katalogu `assets`.
- `sw.js` zapisuje nowe zasoby w cache PWA.
- 2026-06-19: rozdzielono duży plik danych na pliki tematyczne.

## Następne bezpieczne etapy

1. Dodać prosty tryb diagnostyczny dla harmonogramu tygodniowego.
2. Rozważyć dalszy podział `ui.js` na procedury, stopnie i prawo.
3. Rozważyć migrację na moduły ES dopiero po pełnym przetestowaniu klasycznego podziału.

## Zasada utrzymania

Każdy etap powinien być osobnym commitem i po każdym etapie trzeba sprawdzić:

- składnię JavaScript,
- uruchamianie aplikacji,
- połączenie AI,
- pobieranie harmonogramu tygodniowego,
- działanie bazy wiedzy,
- aktualizację cache PWA.
