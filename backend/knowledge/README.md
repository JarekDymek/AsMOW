# Baza dokumentów MOW dla backendu AI

W tym katalogu można umieścić pliki `.txt`, `.md` albo `.json` z treścią lub wyciągami z dokumentów MOW.
Backend automatycznie dołącza je do instrukcji modelu przy każdym pytaniu.

Zalecane pliki:
- `statut-mow.txt`
- `regulamin-stopni.txt`
- `procedury-mow.txt`
- `standardy-ochrony-maloletnich.txt`
- `poradnik-wychowawcy.txt`
- `ustawa-wspieranie-resocjalizacja-nieletnich.txt`

Najlepszy format wpisu:

```txt
Źródło: STATUT-M.O.W.pdf, § ...
Treść/wyciąg:
...
```

Dokumenty MOW powinny mieć pierwszeństwo przed ogólną wiedzą modelu przy pytaniach o procedury postępowania.
