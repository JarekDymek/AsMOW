# Backend AI dla Asystenta MOW

Ten backend chroni klucz API i udostępnia aplikacji PWA endpointy:

- `GET /health` - sprawdzenie, czy backend działa.
- `GET /api/knowledge` - centralna baza wiedzy z katalogu `backend/knowledge`.
- `POST /api/chat` - rozmowa z asystentem.
- `POST /api/weekly-plan` - bezpieczne pobranie planu z Harmonogram-MOW.
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
- poczta Gmail: `CURRENT_INFO_IMAP_HOST=imap.gmail.com`, `CURRENT_INFO_IMAP_USER`, `CURRENT_INFO_IMAP_PASSWORD`, `CURRENT_INFO_SYNC_TOKEN`

### Link testowy dla wychowawcĂłw

W Renderze ustaw:

- `TEST_ACCESS_TOKENS` - jeden albo kilka kodĂłw testowych po przecinku.
- `TEST_WEEKLY_BACKEND_URL` - adres `/exec` z Apps Script Harmonogram-MOW.
- `TEST_WEEKLY_VIEW_TOKEN` - tylko `VIEW_TOKEN`, nigdy `ADMIN_TOKEN`.
- `TEST_WEEKLY_EDUCATOR=Dymek` albo inne nazwisko do podglÄ…du.

Link dla testera ma format:

```text
https://jarekdymek.github.io/AsMOW/?tester=TU_WKLEJ_KOD_TESTOWY
```

Tester nie widzi tokenĂłw harmonogramu, poczty ani kluczy AI. Przycisk skanowania generatora jest ukryty, a backend wymusza tylko bezpieczny podglÄ…d.

Jeżeli aplikacja PWA jest serwowana z tego samego Rendera, w `index.html` może zostać domyślne `AI_BACKEND_URL='/api/chat'`.
Jeżeli frontend jest na innej domenie, ustaw w przeglądarce albo zmień w kodzie:

```js
localStorage.setItem('mow_ai_backend_url', 'https://twoj-render.onrender.com/api/chat')
```

## Dokumenty MOW

Do katalogu `backend/knowledge` dodaj pliki `.txt`, `.md` albo `.json` z wyciągami z dokumentów MOW.
Backend dołącza je do instrukcji modelu i każe traktować je jako nadrzędne przy procedurach.
