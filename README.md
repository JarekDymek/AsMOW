# Asystent MOW

Prywatna aplikacja PWA wspierająca pracę wychowawcy MOW nr 1 w Malborku. Łączy rozkład dnia, procedury, stopnie uspołecznienia, bazę prawa i wiedzy, bieżące komunikaty dyrekcji, grafik internatu oraz opcjonalny czat AI.

Aktualna wersja PWA: **2.5.7**

Aktualna wersja backendu: **1.5.2**

Ostatni pełny audyt: **26 sierpnia 2026**

- aplikacja: [jarekdymek.github.io/AsMOW](https://jarekdymek.github.io/AsMOW/)
- backend: [asmow.onrender.com/health](https://asmow.onrender.com/health)
- repozytorium: [JarekDymek/AsMOW](https://github.com/JarekDymek/AsMOW)

## Najważniejsze funkcje

- rozkład dnia i szybkie procedury reagowania;
- stopnie uspołecznienia i lokalne notatki;
- centralna oraz lokalna baza wiedzy z kontrolą aktualności aktów ELI;
- archiwum wiadomości dyrekcji i bezpieczne pobieranie załączników;
- kanoniczny plan tygodniowy z backendu Render/IMAP, współdzielony z Harmonogram-MOW, oraz lokalne archiwum dokumentów DOCX do audytu;
- kopia i przywracanie danych zapisanych na urządzeniu;
- instalacja jako PWA, praca offline i kontrolowana aktualizacja app shell.

## Jak przepływają dane grafiku

### Lokalny indeks poczty

Frontend wysyła token poczty do endpointu `POST /api/current-info-mail`. Backend łączy się z IMAP, pobiera pasujące wiadomości, odczytuje załączniki DOCX przez Mammoth i zwraca znormalizowane rekordy:

```text
data + osoba + grupa + godzina od + godzina do + dokument źródłowy
```

Indeks jest przechowywany wyłącznie w pamięci przeglądarki jako archiwum dokumentów. Nie wyznacza już planu przez scalanie korekt z bazą. Dla każdego tygodnia aktywny jest wyłącznie najnowszy dokument grafiku internatu; odpowiedź dla nazwiska pokazuje to jedno źródło. Tryb szkolny rozpoznaje grupy `I`–`VIII` także wtedy, gdy komórka zawiera wyłącznie cyfrę rzymską. Wiersz `NOC` zachowuje własną etykietę.

Parser oznacza dokument jako niejednoznaczny, gdy:

- nie udało się przypisać komórki z godziną do daty lub osoby;
- przedział czasu jest nieprawidłowy;
- jednej osobie przypisano ponad 24 godziny w ciągu dnia;
- liczba rekordów jest nietypowo duża.

### Kanoniczny plan tygodniowy

Zakładka **Grafik** wywołuje bezpośrednio `POST /api/schedule-dashboard` na Renderze. Ten sam endpoint jest źródłem dla aplikacji Harmonogram MOW.

Reguła danych jest celowo rygorystyczna:

1. wiadomości są przypisywane do tygodnia, którego dotyczy załączony grafik internatu;
2. dla każdego tygodnia dokumenty są sortowane według czasu oryginalnej wiadomości, UID i kolejności załącznika;
3. **obowiązuje dokładnie jeden najnowszy dokument grafiku internatu dla tego tygodnia**;
4. starszy dokument nie uzupełnia, nie naprawia i nie scala się z nowszym;
5. jeżeli najnowszy dokument jest niepełny albo nieczytelny, aplikacja pokazuje ostrzeżenie zamiast przywracać starszy grafik;
6. błąd Rendera pozostawia ostatnią poprawnie zapisaną wersję i nie uruchamia Apps Script jako fallbacku;
7. historia jest skanowana od stałej daty archiwum, więc stary tydzień nie znika wraz z upływem czasu.

Odpowiedź zawiera `schedulePolicyRevision`, `scheduleRevision` i `sourceVersion` każdego tygodnia. Dzięki temu ten sam tydzień jest niezmienny, dopóki nie pojawi się nowszy dokument dotyczący właśnie tego tygodnia.

## Walidacja i bezpieczeństwo

- sekrety AI i IMAP nie mogą trafić do frontendu, repozytorium ani logów; token Harmonogramu nie może trafić do repozytorium ani logów;
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

## Zmiany wersji 2.5.1 / backendu 1.4.1

- Skrzynka IMAP pozostaje dotychczasowym Gmailem. Nowy nadawca źródłowy: `dariusz.gorski@mowmalbork.pl`; zaufany przekazujący: `dymek.jaroslaw@mowmalbork.pl`.
- Obsługiwane są wiadomości bezpośrednie i wielokrotnie przekazane, z adresem dyrektora w polu Od/From oraz datą oryginału. Sama wzmianka o adresie nie wystarcza.
- Info, załączniki i indeks DOCX korzystają z tej samej kwalifikacji wiadomości. Powtórzenia rozpoznaje skrót oryginalnej treści, daty, tematu i zawartości wszystkich załączników.
- Pierwsza synchronizacja po aktualizacji ponownie sprawdza pocztę od początku skonfigurowanego okresu. Archiwum urządzenia pozostaje zachowane.
- Stary adres usunięto z aktywnego filtra i konfiguracji. Wyłącznie pobieranie historycznych załączników zachowuje zgodność przez odcisk nadawcy i datę dostarczenia sprzed 16 września 2026; ta reguła nie importuje nowych wiadomości.
- Nie obcinamy listy załączników do dwunastu; dotychczasowy limit rozmiaru pojedynczego pliku nadal obowiązuje.
- Zaktualizowano zgodne wersje zależności parserów poczty/XML wskazane przez kontrolę bezpieczeństwa; `npm audit` nie zgłasza podatności.

## Zmiany 2.5.2 / 1.4.2

Grafik w Asystencie korzysta bezpośrednio z synchronizacji IMAP zakładki Info, bez starego wdrożenia Apps Script. Odczyt zapisuje zakres komórek korekty: dzień/grupa lub dzień/osoba, także dni wolne. Korekta usuwa poprzednie wpisy w tym zakresie, więc zmiana osoby lub wyzerowanie dyżuru nie przywraca starszego planu. Kolejność uwzględnia datę i godzinę wiadomości oryginalnej, a nie kolejnego przekazania. Ostrzeżenia parsera pozostają widoczne. Zestawienie pokazuje godziny faktyczne; nadgodzin nie wylicza bez indywidualnego wymiaru pracy.


## Zmiany 2.5.3

- przywrócono Harmonogram-MOW jako nadrzędne źródło planu tygodniowego w zakładce Grafik;
- wejście do zakładki Grafik automatycznie odświeża plan przez istniejący proxy `/api/weekly-plan`;
- synchronizacja Info/IMAP nie nadpisuje już planu tygodniowego z Harmonogram-MOW;
- lokalny indeks DOCX pozostaje pomocniczy do wyszukiwania dokumentów i innych wychowawców;
- ustawiono aktualny adres wdrożenia Apps Script jako domyślny backend Harmonogram-MOW;
- na GitHub Pages Asystent może odczytać zapisany `VIEW_TOKEN` i adres backendu z danych Harmonogram-MOW w tym samym origin (`localStorage`), bez ponownego wpisywania tokenu;
- podbito cache PWA, aby urządzenia pobrały poprawioną wersję plików.


## Zmiany 2.5.4 / backend 1.4.3

- dodano `POST /api/schedule-dashboard`, który buduje plan bezpośrednio z IMAP na backendzie Render;
- przy każdym odświeżeniu backend ponownie ocenia dokument bazowy oraz nowsze korekty według czasu oryginalnej wiadomości;
- Asystent używa źródła pocztowego jako podstawowego, a Apps Script tylko jako fallback;
- plan nie zależy już od lokalnego indeksu dokumentów ani sprawności mostu iframe/JSONP do Apps Script;
- podbito cache PWA do v64.


## Poprawka grafiku 1.4.4 — 20 września 2026

- ponownie włączono historyczny adres dyrektora `dgorski5@wp.pl` dla wiadomości sprzed migracji na adres służbowy;
- każdy z trzech dozwolonych kanałów poczty jest wyszukiwany osobno w IMAP i dopiero potem wyniki są scalane;
- skrót `zast.` jest usuwany przed rozpoznaniem nazwiska, więc `zast. Dymek` oznacza pracownika Dymek, a nie fikcyjną osobę „zast Dymek”;
- najnowszy pełny grafik danego tygodnia jest traktowany jako kompletna migawka i zastępuje wszystkie starsze pełne wersje;
- tylko nowsza niepełna korekta może zostać nałożona na najnowszą pełną migawkę.


## Zmiany 2.5.5 / backend 1.5.0 — kanoniczny grafik

- jedna reguła źródła dla Asystenta MOW i Harmonogram-MOW: najnowszy dokument grafiku internatu dla konkretnego tygodnia;
- usunięto scalanie dokumentu bazowego z korektami w warstwie aktywnego planu;
- usunięto Apps Script jako fallback zakładki Grafik;
- usunięto łączenie z rekordami poprzedniego tygodnia oraz z grafikami innych zespołów;
- zakres archiwum grafiku jest stały od 2026-01-01, a nie ruchomy względem bieżącej daty;
- błędny/niedostępny backend nie nadpisuje ostatniego poprawnego planu;
- dodano rewizje źródła i polityki oraz wymuszono jednorazową przebudowę starego indeksu;
- cache PWA v65 wymusza pobranie nowej logiki na zainstalowanych urządzeniach.


## Poprawka 2.5.6 / backend 1.5.1 — stabilność godzin

- parser wiąże zapis `zast. Nazwisko` wyłącznie z bezpośrednio poprzedzającym go przedziałem czasu; zastępstwo nie może przejść na następny dyżur;
- adnotacja `zastępstwo za pracownika nocnego` nie usuwa nazwiska wychowawcy;
- rekord zastępstwa zachowuje metadane `substitution` i `replacesPerson`;
- zakładka Grafik nie dubluje tych samych tygodni z pól `weeks` i `history`;
- automatyczne odświeżenie Grafiku używa tokenu źródła pocztowego Render, a nie starego tokenu Apps Script;
- zapisany lokalnie plan o starej polityce źródła jest odrzucany zamiast przywracany po ponownym uruchomieniu.


## Poprawka 2.5.7 / backend 1.5.2 — niezmienność tygodnia

- `sourceVersion` zależy wyłącznie od dokumentu źródłowego i jego treściowej tożsamości, nie od wyniku parsera;
- ponowne odczytanie tego samego DOCX nie może zmienić zapisanego tygodnia;
- lokalnie zapisany tydzień jest zastępowany tylko przez faktycznie nowszy dokument/korektę;
- tygodnie nieobecne chwilowo w odpowiedzi nie są automatycznie kasowane z zapisanej historii;
- polityka `latest-document-per-week-v2` wymusza jednokrotną migrację ze starego, niestabilnego cache.
