# Asystent MOW

PWA dla wychowawcy MOW nr 1 w Malborku: dyzur, procedury, stopnie, prawo, harmonogram tygodniowy, baza wiedzy, biezace informacje i czat AI.

## Szybkie sprawdzenie

```bash
npm run check
```

Sprawdzenie obejmuje:
- brakujace zasoby z `index.html`,
- cache PWA w `sw.js`,
- funkcje uzyte w HTML,
- powtorzone identyfikatory HTML,
- skladnie JavaScript w frontendzie, backendzie i service workerze.

## Backend

Backend znajduje sie w katalogu `backend` i chroni klucze API. Obsluguje AI, pobieranie planu z Harmonogram-MOW, biezace informacje z poczty oraz odczyt plikow do analizy.

## Dane lokalne

Aplikacja korzysta z pamieci przegladarki dla ustawien urzadzenia, historii czatu, lokalnej bazy wiedzy i harmonogramu. W aplikacji jest dostepna kopia/przywracanie danych lokalnych.
