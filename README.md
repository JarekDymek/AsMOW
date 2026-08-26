# Asystent MOW

Prywatna aplikacja PWA wspierająca pracę wychowawcy MOW nr 1 w Malborku. Łączy rozkład dnia, procedury, stopnie uspołecznienia, bazę prawa i wiedzy, bieżące komunikaty dyrekcji, grafik internatu oraz opcjonalny czat AI.

Aktualna wersja PWA: **2.5.0**

Aktualna wersja backendu: **1.4.0**

Ostatni pełny audyt: **26 sierpnia 2026**

- aplikacja: [jarekdymek.github.io/AsMOW](https://jarekdymek.github.io/AsMOW/)
- backend: [asmow.onrender.com/health](https://asmow.onrender.com/health)
- repozytorium: [JarekDymek/AsMOW](https://github.com/JarekDymek/AsMOW)

## Najważniejsze funkcje

- rozkład dnia i szybkie procedury reagowania;
- stopnie uspołecznienia i lokalne notatki;
- centralna oraz lokalna baza wiedzy z kontrolą aktualności aktów ELI;
- archiwum wiadomości dyrekcji i bezpieczne pobieranie załączników;
- dwa niezależne źródła grafiku: lokalny indeks DOCX z poczty oraz indywidualny plan z Harmonogramu MOW;
- kopia i przywracanie danych zapisanych na urządzeniu;
- instalacja jako PWA, praca offline i kontrolowana aktualizacja app shell.

## Jak przepływają dane grafiku

### Lokalny indeks poczty

Frontend wysyła token poczty do endpointu `POST /api/current-info-mail`. Backend łączy się z IMAP, pobiera pasujące wiadomości, odczytuje załączniki DOCX przez Mammoth i zwraca znormalizowane rekordy:

```text
data + osoba + grupa + godzina od + godzina do + dokument źródłowy
```

Indeks jest przechowywany wyłącznie w pamięci przeglądarki. Korekty są nakładane na dokument bazowy, a odpowiedź dla nazwiska zawsze pokazuje źródło. Tryb szkolny rozpoznaje grupy `I`–`VIII` także wtedy, gdy komórka zawiera wyłącznie cyfrę rzymską. Wiersz `NOC` zachowuje własną etykietę.

Parser oznacza dokument jako niejednoznaczny, gdy:

- nie udało się przypisać komórki z godziną do daty lub osoby;
- przedział czasu jest nieprawidłowy;
- jednej osobie przypisano ponad 24 godziny w ciągu dnia;
- liczba rekordów jest nietypowo duża.

### Plan z Harmonogramu MOW

`POST /api/weekly-plan` działa jako pośrednik do wdrożenia Google Apps Script. Adres `/exec` oraz token nie są wpisane do repozytorium. Asystent zachowuje odebrane tygodnie w `localStorage`, klasyfikuje je jako poprzedni, bieżący i przyszłe oraz niezależnie ostrzega, gdy pojedynczy dzień przekracza 24 godziny.

Ta warstwa jest celowo niezależna od lokalnego indeksu poczty. Awaria jednego źródła nie usuwa wcześniej zapisanych danych drugiego źródła.

## Walidacja i bezpieczeństwo

- sekrety AI, IMAP i tokeny Harmonogramu nie mogą trafić do frontendu, repozytorium ani logów;
- token poczty jest porównywany stałoczasowo z konfiguracją Render;
- synchronizacja poczty ma ograniczenia liczby żądań, rozmiaru załączników i zakresu dat;
- dokumenty zespołu diagnostyczno-terapeutycznego są odrzucane przez parser grafiku internatu;
- treści przekazywane do AI mają ograniczony rozmiar i zakres;
- service worker usuwa wyłącznie cache z prefiksem `asmow-private-` i nie dotyka innych aplikacji w domenie GitHub Pages;
- zależności backendu są kontrolowane przez `npm audit`; SheetJS jest instalowany z oficjalnego wydania `0.20.3`, ponieważ publiczny rejestr npm udostępnia nieaktualne `0.18.5`.

## Uruchomienie lokalne

Frontend nie wymaga budowania:

```powershell
python -m http.server 4173
```

Następnie otwórz `http://127.0.0.1:4173/`.

Backend:

```powershell
cd backend
npm.cmd ci
npm.cmd test
npm.cmd start
```

Zmienne środowiskowe i tokeny opisano w [backend/README.md](backend/README.md). Nie zapisuj pliku `.env` w repozytorium.

## Testy

Pełna kontrola frontendu i danych:

```powershell
npm.cmd run check
```

Test parsera DOCX i szkolnego grafiku:

```powershell
cd backend
npm.cmd test
npm.cmd audit
```

`npm.cmd run check` obejmuje zasoby app shell, identyfikatory HTML, składnię kodu, bank odpowiedzi, warstwy bezpieczeństwa, dane ELI i bazę wiedzy. Kontrola składni pomija `backend/node_modules`, aby badała kod projektu, a nie tysiące plików dostawców.

## Publikacja

### GitHub Pages

Frontend jest publikowany z gałęzi `main`. Przy każdej zmianie app shell:

1. zwiększ numer widoczny w `index.html` i `assets/js/help.js`;
2. zwiększ `CACHE` w `sw.js`;
3. uruchom `npm.cmd run check`;
4. po scaleniu sprawdź zakończenie workflow Pages;
5. otwórz publiczną aplikację, zaakceptuj komunikat **Dostępna nowa wersja** i potwierdź numer w nagłówku lub pomocy;
6. sprawdź widok przy szerokości telefonu oraz działanie offline po pierwszym pełnym załadowaniu.

### Render

Backend jest wdrażany z tego samego repozytorium. Po zmianie katalogu `backend`:

1. uruchom `npm.cmd ci`, `npm.cmd test` i `npm.cmd audit`;
2. scal zmianę do `main`;
3. poczekaj na zakończenie wdrożenia Render;
4. sprawdź `/health` — wersja musi odpowiadać `BACKEND_VERSION`;
5. wykonaj kontrolowaną synchronizację poczty i potwierdź, że nowy tydzień pojawia się w selektorze grafiku.

## Aktualizacja PWA bez utraty danych

Nie używaj czyszczenia danych jako pierwszego sposobu aktualizacji.

1. uruchom aplikację z internetem i pozostaw otwartą przez kilka sekund;
2. gdy pojawi się komunikat **Dostępna nowa wersja**, wybierz **Odśwież**;
3. jeżeli komunikatu nie ma, zamknij wszystkie okna PWA i otwórz ją ponownie;
4. dopiero po wykonaniu kopii danych rozważ wyczyszczenie pamięci witryny.

## Zmiany wersji 2.5.0 / backendu 1.4.0

- dodano test i obsługę szkolnego grafiku z grupami I–VIII;
- poprawiono etykietę i rekordy dyżurów nocnych;
- dodano walidację ponad 24 godzin w pojedynczym dniu w obu źródłach grafiku;
- poprawiono układ tygodniowych kart na telefonie i skrócono dolną etykietę do czytelnego **Grafik**;
- odizolowano czyszczenie cache od pozostałych PWA w tej samej domenie;
- usunięto pięć podatności zależności oraz zaktualizowano SheetJS do oficjalnego wydania 0.20.3;
- kontrola składni nie skanuje już `node_modules`.

## Znane ograniczenia

- parser DOCX zależy od układu tabeli; każdy nowy wariant grafiku wymaga osobnego przypadku testowego;
- testy lokalne nie zastępują próby z prawdziwym kontem IMAP, wdrożeniem Apps Script i telefonem;
- lokalny indeks istnieje osobno na każdym urządzeniu i wymaga skonfigurowanego tokenu poczty;
- PWA nie powinna być traktowana jako jedyne źródło decyzji kadrowej — przy ostrzeżeniu zawsze otwórz dokument źródłowy.
