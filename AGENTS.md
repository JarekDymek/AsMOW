# MOW | ASYSTENT — AsMOW (produkcja)

## Tożsamość projektu
- Projekt nadrzędny: **MOW | ASYSTENT**
- Wariant: **AsMOW — obecna produkcja**
- Kod: **ASMOW-PROD**
- Repozytorium: `JarekDymek/AsMOW`
- Status: **CURRENT PRODUCTION / MAINTENANCE**

## Granice
- Nie myl z `AsMOW-Next` (nowa linia rozwojowa), `Asystent-MOW-Open` (wariant publiczny/offline) ani `AsystentNewGen`.
- Integracja z `JarekDymek/Harmonogram-MOW` została wycofana 2026-10-05. Nie przywracaj proxy `/api/weekly-plan` (HTTP 410). Grafik, korekty, historia, wiadomości dyrektora i załączniki są odczytywane przez serwerowy adapter z `MOW-PLAN`. Nie uruchamiaj starego IMAP ani drugiego parsera jako fallbacku.
- Nie modyfikuj GH2, GH3, AUDYTOR-INTERNAT ani MOW — Mój Plan przy pracy nad tym repo bez jawnego polecenia.
- Preferuj poprawki utrzymaniowe. Nową architekturę rozwijaj w `AsMOW-Next`, jeśli zadanie dotyczy następcy.

## Dane
- Nie zapisuj prywatnych wiadomości, grafików, danych wychowanków ani sekretów w Git.
- Zachowuj kompatybilność PWA i istniejących danych użytkownika.

## Wspólna baza wiedzy MOW

Kanoniczny katalog relacji międzyprojektowych, statusów i nazewnictwa znajduje się w prywatnym repozytorium `JarekDymek/MOW-HUB`. Używaj go przy zadaniach przekrojowych. Dla zmian w tej aplikacji pierwszeństwo mają aktualny kod, lokalny `AGENTS.md` i dokumentacja tego repozytorium.
