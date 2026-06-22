# Baza wiedzy backendu AI

Ten katalog zawiera aktywne pliki wiedzy, ktore backend dolacza do pytan kierowanych do AI.

## Zasada utrzymania

- Do aktywnej bazy dodajemy krotkie, opisane wyciagi `.md`, `.txt` albo `.json`.
- Pelne teksty ustaw, rozporzadzen i duzych dokumentow trzymamy w `_archiwum_pelne_teksty`.
- Backend pomija foldery zaczynajace sie od `_`, wiec archiwum nie jest ladowane do kazdego pytania.
- Przy pytaniach proceduralnych pierwszenstwo maja dokumenty MOW: statut, procedury, regulaminy, standardy ochrony maloletnich, zarzadzenia dyrektora i wpisy w bazie zmian czasowych.

## Zalecany format wyciagu

```md
# Wyciag MOW: nazwa dokumentu

Zrodlo: tytul, data, Dz.U. albo nazwa dokumentu MOW.
Status w aplikacji: aktywny wyciag roboczy dla AI.
Pelny tekst zrodlowy: sciezka do archiwum albo nazwa pliku.

## Kiedy stosowac

- ...

## Najwazniejsze punkty dla MOW

- ...

## Reguly odpowiedzi AI

- ...
```

## Dlaczego nie ladowac pelnych ustaw

Pelne akty prawne sa potrzebne jako zrodlo kontroli, ale w codziennej pracy generuja duzo szumu. Krotkie wyciagi z metadanymi pomagaja AI szybciej odnalezc wlasciwy fragment i ograniczaja ryzyko odpowiedzi z nieistotnych przepisow.
