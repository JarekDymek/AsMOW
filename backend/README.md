# Backend AI dla Asystenta MOW

Ten backend chroni klucz API i udostępnia aplikacji PWA endpointy:

- `GET /health` - sprawdzenie, czy backend działa.
- `GET /api/knowledge` - centralna baza wiedzy z katalogu `backend/knowledge`.
- `GET /api/legal-updates` - status monitorowanych aktów i publikacje do weryfikacji z oficjalnego API ELI; bez użycia AI.
- `POST /api/chat` - rozmowa z asystentem.
- `POST /api/weekly-plan` - **wycofany**; zwraca HTTP 410 i nie łączy się już z Harmonogram-MOW.
- `POST /api/schedule-dashboard` - kanoniczny grafik internatu. Dla każdego tygodnia wybiera wyłącznie najnowszy dokument z poczty IMAP, bez scalania ze starszymi wersjami.
- `POST /api/current-info-mail` - synchronizacja bieżących informacji z poczty.
- `POST /api/current-info-attachment` - pobranie wybranego załącznika z wiadomości dyrektora.
- `POST /api/extract-file` - odczyt tekstu z plików przekazanych do analizy.
- `GET /` - podgląd `index.html` z katalogu głównego projektu.

## Render

Ustawienia usługi Web Service:

- Root Directory: `backend`
- Build Command: puste albo `npm install`
- Start Command: `npm start`
- Environment: Node

Zmienne środowiskowe dla Google Gemini:

- `LLM_PROVIDER=gemini`
- `GEMINI_API_KEY=...`
- `GEMINI_MODEL=gemini-2.5-flash-lite`
- opcjonalnie `ALLOWED_ORIGINS=https://twoja-domena.pl`
- opcjonalnie `LEGAL_UPDATES_CACHE_MS=21600000` - czas pamięci kontroli ELI, domyślnie 6 godzin.
- poczta Gmail: `CURRENT_INFO_IMAP_HOST=imap.gmail.com`, `CURRENT_INFO_IMAP_USER`, `CURRENT_INFO_IMAP_PASSWORD`, `CURRENT_INFO_SYNC_TOKEN`
  - opcjonalnie `CURRENT_INFO_SYNC_TOKENS` - lista aktywnych tokenów oddzielonych przecinkiem, przydatna podczas bezpiecznej wymiany starego tokenu na nowy.
  - token synchronizacji jest niezależny od tokenów testerów; nie wpisuj go do linku ani nie udostępniaj innym osobom.

### Link testowy dla wychowawców

W Renderze ustaw:

- `TEST_ACCESS_TOKENS` - jeden albo kilka kodów testowych po przecinku.
- `TEST_WEEKLY_EDUCATOR=Dymek` albo inne nazwisko do podglądu.

Link dla testera ma format:

```text
https://jarekdymek.github.io/AsMOW/?tester=TU_WKLEJ_KOD_TESTOWY
```

Tester nie widzi tokenów poczty ani kluczy AI. Integracja z Harmonogram-MOW została wycofana; Grafik korzysta z własnego indeksu poczty.

Jeżeli aplikacja PWA jest serwowana z tego samego Rendera, w `index.html` może zostać domyślne `AI_BACKEND_URL='/api/chat'`.
Jeżeli frontend jest na innej domenie, ustaw w przeglądarce albo zmień w kodzie:

```js
localStorage.setItem('mow_ai_backend_url', 'https://twoj-render.onrender.com/api/chat')
```

## Dokumenty MOW

Do katalogu `backend/knowledge` dodaj pliki `.txt`, `.md` albo `.json` z wyciągami z dokumentów MOW.
Backend dołącza je do instrukcji modelu i każe traktować je jako nadrzędne przy procedurach.

## Wiadomości dyrektora — przekazywanie z poczty służbowej

`CURRENT_INFO_FROM=dariusz.gorski@mowmalbork.pl`
`CURRENT_INFO_FORWARDER=dymek.jaroslaw@mowmalbork.pl`

Zachowaj aktualne dane logowania IMAP do Gmaila. Backend rozpoznaje dokładny adres bezpośredniego nadawcy albo pole Od/From z datą w wiadomości przekazanej z zaufanego konta. Obsługuje tekst i HTML, również wielokrotne przekazania. Pobieranie załączników używa identycznej reguły; starsze załączniki mają oddzielną, ograniczoną datą zgodność archiwalną.

## Źródło MOW — Mój Plan

MOW_PLAN_API_URL=https://mow-moj-plan.vercel.app; MOW_ASYSTENT_INTEGRATION_SECRET jest tym samym serwerowym sekretem co na Mój Plan. Istniejący token CURRENT_INFO_SYNC_TOKEN nadal ogranicza dostęp użytkownika. /api/schedule-dashboard, /api/current-info-mail i /api/current-info-attachment używają wyłącznie adaptera Mój Plan. /api/weekly-plan pozostaje wycofane (410). Stary IMAP nie uruchamia się podczas startu ani w aktywnych trasach.
