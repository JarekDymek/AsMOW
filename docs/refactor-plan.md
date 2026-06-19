# Refaktoryzacja AsMOW

## Stan po etapie 1-2

- `index.html` zawiera strukturę widoków i odwołania do zasobów.
- `assets/css/app.css` zawiera style aplikacji.
- `assets/js/data.js` zawiera stałe dane: harmonogram dnia, procedury, stopnie, szybkie pytania i podstawy prawne.
- `assets/js/app.js` zawiera logikę aplikacji.
- `backend/server.js` serwuje pliki z katalogu `assets`.
- `sw.js` zapisuje nowe zasoby w cache PWA.

## Następne bezpieczne etapy

1. Wydzielić `assets/js/ai.js`: czat AI, historia, retry, głos i załączniki.
2. Wydzielić `assets/js/weekly-plan.js`: pobieranie i renderowanie planu tygodniowego.
3. Wydzielić `assets/js/knowledge-base.js`: baza wiedzy, wzory dokumentów i zmiany czasowe.
4. Wydzielić `assets/js/files.js`: odczyt TXT, Word, Excel i obrazów.
5. Wydzielić `assets/js/pwa.js`: instalacja PWA i kontrola offline.

## Zasada utrzymania

Każdy etap powinien być osobnym commitem i po każdym etapie trzeba sprawdzić:

- składnię JavaScript,
- uruchamianie aplikacji,
- połączenie AI,
- pobieranie harmonogramu tygodniowego,
- działanie bazy wiedzy,
- aktualizację cache PWA.
