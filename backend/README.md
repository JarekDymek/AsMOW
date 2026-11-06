# Backend AI dla Asystenta MOW

Ten backend chroni klucz API i udostępnia aplikacji PWA endpointy:

- `GET /health` - sprawdzenie, czy backend działa.
- `GET /api/knowledge` - centralna baza wiedzy z katalogu `backend/knowledge`.
- `GET /api/legal-updates` - status monitorowanych aktów i publikacje do weryfikacji z oficjalnego API ELI; bez użycia AI.
- `POST /api/chat` - rozmowa z asystentem.
- `POST /api/weekly-plan` - **wycofany**; zwraca HTTP 410 i nie łączy się już z Harmonogram-MOW.
- `POST /api/schedule-dashboard` - kanoniczny grafik internatu. Odczytuje aktywny, zweryfikowany grafik przez serwerowe API Mój Plan.
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
- integracja Grafiku i Info: `MOW_PLAN_API_URL`, `MOW_ASYSTENT_INTEGRATION_SECRET` (minimum 32 znaki) i `CURRENT_INFO_SYNC_TOKEN`.
- opcjonalnie `CURRENT_INFO_SYNC_TOKENS` — lista tokenów do bezpiecznej rotacji.

### Link testowy dla wychowawców

W Renderze ustaw:

- `TEST_ACCESS_TOKENS` - jeden albo kilka kodów testowych po przecinku.

Link dla testera ma format:

```text
https://jarekdymek.github.io/AsMOW/?tester=TU_WKLEJ_KOD_TESTOWY
```

Tester nie widzi tokenów poczty ani kluczy AI. Integracja z Harmonogram-MOW została wycofana; Grafik korzysta z serwerowego API Mój Plan.

Jeżeli aplikacja PWA jest serwowana z tego samego Rendera, w `index.html` może zostać domyślne `AI_BACKEND_URL='/api/chat'`.
Jeżeli frontend jest na innej domenie, ustaw w przeglądarce albo zmień w kodzie:

```js
localStorage.setItem('mow_ai_backend_url', 'https://twoj-render.onrender.com/api/chat')
```

## Dokumenty MOW

Do katalogu `backend/knowledge` dodaj pliki `.txt`, `.md` albo `.json` z wyciągami z dokumentów MOW.
Backend dołącza je do instrukcji modelu i każe traktować je jako nadrzędne przy procedurach.

## Źródło MOW — Mój Plan

MOW_PLAN_API_URL=https://mow-moj-plan.vercel.app; MOW_ASYSTENT_INTEGRATION_SECRET jest tym samym serwerowym sekretem co na Mój Plan. Istniejący token CURRENT_INFO_SYNC_TOKEN nadal ogranicza dostęp użytkownika. /api/schedule-dashboard, /api/current-info-mail i /api/current-info-attachment używają wyłącznie adaptera Mój Plan. /api/weekly-plan pozostaje wycofane (410). Stary mechanizm IMAP i jego parser zostały usunięte.
