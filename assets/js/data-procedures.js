const PROCS = [
  {id:"p-agresja",cat:"crisis",sev:"danger",icon:"🥊",
   title:"Bójka / Agresja fizyczna",sub:"Ujawnienie bójki lub pobicia",
   src:"Procedury Postępowania – pkt 2 | Statut MOW §48",
   steps:[
     "NATYCHMIAST rozdziel uczestników. Stanowczy głos, nie krzyk. Wejdź między nich jeśli bezpiecznie.",
     "Zabezpiecz świadków – odsuń innych wychowanków.",
     "<strong>Wezwij pomoc</strong> – powiadom drugiego wychowawcę / dyżurującego.",
     "Oceń obrażenia. Rany, krwawienie → <strong>dzwoń 112</strong>.",
     "<strong>Powiadom Dyrektora</strong> niezwłocznie.",
     "Rozdziel sprawcę i ofiarę – nie przebywają razem do wyjaśnienia.",
     "Sporządź dokumentację: data, godzina, opis, uczestnicy, świadkowie.",
     "Dyrektor powiadamia <strong>sąd rodzinny</strong> o czynie karalnym."
   ],
   alert:{t:"danger",txt:"Pobicie z urazem = spadek stopnia o 2. Czyn karalny = stopień –2. Bezwzględnie dokumentuj obrażenia!"},
   extra:`<div class="abox warn"><span class="ai">⚠️</span><div>Nie stosuj przemocy fizycznej. Siłę możesz użyć tylko w obronie koniecznej i bezpieczeństwa innych. Podstawa: Rozp. RM z 22.02.2011.</div></div>`},

  {id:"p-ucieczka",cat:"crisis",sev:"danger",icon:"🚪",
   title:"Ucieczka / Samowolne oddalenie",sub:"Wychowanek opuścił teren bez zezwolenia",
   src:"Procedury Postępowania – pkt 13 | Statut MOW §49",
   steps:[
     "Sprawdź czy rzeczywiście uciekł – przeszukaj cały teren, stołówkę, boisko.",
     "<strong>Powiadom Dyrektora</strong> – max. 10 minut od stwierdzenia.",
     "Dyrektor/wychowawca <strong>powiadamia Policję</strong> – zgłoszenie zaginięcia nieletniego.",
     "<strong>Powiadom rodziców/opiekunów</strong> – telefonicznie, odnotuj godzinę i treść.",
     "Powiadom <strong>sąd rodzinny</strong> – nadzorujący wychowanka.",
     "Dokumentuj: godzina ostatniego kontaktu, wygląd (ubranie), kierunek oddalenia.",
     "Po powrocie – protokół powrotu, ocena stanu zdrowia, wpis do dokumentacji."
   ],
   alert:{t:"danger",txt:"Ucieczka = automatyczny spadek do stopnia –1. Obowiązek powiadomienia w ciągu 24h: rodziców, sądu i Policji."}},

  {id:"p-narkotyki",cat:"crisis",sev:"danger",icon:"💊",
   title:"Narkotyki / Alkohol / Dopalacze",sub:"Podejrzenie lub ujawnienie użycia substancji",
   src:"Procedury Postępowania – pkt 9 | Ustawa o Przeciwdziałaniu Narkomanii",
   steps:[
     "<strong>Odizoluj</strong> wychowanka od grupy – spokojne miejsce.",
     "Oceń stan. Zaburzenia świadomości → <strong>dzwoń 112</strong>.",
     "<strong>Nie zostawiaj samego</strong> – ryzyko pogłębienia zatrucia.",
     "Zapytaj co i kiedy zażył – bez oskarżeń, zbieraj informacje.",
     "<strong>Powiadom Dyrektora</strong> niezwłocznie.",
     "Znalezione substancje – <strong>zabezpiecz</strong> (nie dotykaj gołymi rękami, zapieczętuj). Przekaż Dyrektorowi/Policji.",
     "<strong>Powiadom rodziców</strong> i <strong>sąd rodzinny</strong>.",
     "Dokumentacja: objawy, godzina, substancja (jeśli znana), działania."
   ],
   alert:{t:"danger",txt:"Posiadanie/używanie = spadek o 1–2 stopnie (min. zerowy). Substancja = materiał dowodowy – nie wyrzucaj!"}},

  {id:"p-samo",cat:"crisis",sev:"danger",icon:"🆘",
   title:"Próba samobójcza / Samookaleczenie",sub:"Wychowanek zagraża swojemu życiu",
   src:"Procedury Postępowania – pkt 8 | Statut MOW §50",
   steps:[
     "<strong>DZWOŃ 112</strong> – natychmiast jeśli zagrożenie życia.",
     "Nie zostawiaj wychowanka samego – ciągła obecność.",
     "Usuń dostęp do niebezpiecznych przedmiotów (nóż, pasek, leki).",
     "Mów spokojnie: <em>'Jestem tutaj, nic ci nie grozi, jesteś bezpieczny.'</em> Nie bagatelizuj.",
     "<strong>Powiadom Dyrektora</strong> natychmiast.",
     "<strong>Powiadom rodziców/opiekunów</strong>.",
     "<strong>Powiadom sąd rodzinny</strong> pisemnie w ciągu 24h.",
     "Szczegółowa dokumentacja. Wychowanek kierowany na konsultację psychiatryczną."
   ],
   alert:{t:"danger",txt:"Samookaleczenie = automatyczny spadek do stopnia –1. Każda groźba traktowana poważnie. Nie rób scen, nie zawstydzaj."}},

  {id:"p-niebezp",cat:"safety",sev:"warn",icon:"🔪",
   title:"Niebezpieczne przedmioty",sub:"Wychowanek posiada nóż lub inne narzędzie",
   src:"Procedury – Niebezpieczne Przedmioty | Statut MOW §44",
   steps:[
     "<strong>Zachowaj spokój</strong> – nie wchodź w konfrontację przy agresji.",
     "Jeśli bezpiecznie – <strong>wezwij do oddania</strong> spokojnie i stanowczo.",
     "Odmowa lub agresja → <strong>wezwij pomoc</strong>, izoluj innych.",
     "<strong>Powiadom Dyrektora</strong> niezwłocznie.",
     "Zabezpiecz przedmiot – wpisz do protokołu, przekaż Dyrektorowi.",
     "Dyrektor decyduje o zawiadomieniu Policji.",
     "Dokumentacja: rodzaj przedmiotu, okoliczności, działania."
   ],
   alert:{t:"warn",txt:"Skonfiskowane wpisz do rejestru depozytów. Broń lub narzędzie zbrodni → obowiązek zawiadomienia Policji."}},

  {id:"p-pozar",cat:"crisis",sev:"danger",icon:"🔥",
   title:"Pożar / Zatrucie / Wybuch",sub:"Zagrożenie życia – ewakuacja",
   src:"Procedury Postępowania – pkt 1 | Plan ewakuacji MOW",
   steps:[
     "<strong>EWAKUACJA</strong> – uruchom alarm, zarządź opuszczenie budynku.",
     "<strong>DZWOŃ 998</strong> (straż) lub 112.",
     "Wyprowadź zgodnie z <strong>planem ewakuacji</strong> – najkrótszą drogą.",
     "Sprawdź wszystkie pokoje – nikt nie zostaje w budynku.",
     "Zbiórka w <strong>wyznaczonym miejscu</strong> – sprawdź stan osobowy.",
     "Powiadom Dyrektora o stanie grupy.",
     "Nie wracaj do budynku bez zgody Straży Pożarnej."
   ],
   alert:{t:"danger",txt:"Plan ewakuacji wisi przy wyjściach na każdym piętrze. Zapoznaj się przed dyżurem!"}},

  {id:"p-kores",cat:"safety",sev:"warn",icon:"📬",
   title:"Korespondencja i paczki",sub:"Procedura odbioru korespondencji",
   src:"Procedury – Korespondencja | Statut MOW §35",
   steps:[
     "Korespondencja otwierana <strong>w obecności wychowanka</strong>.",
     "Podejrzenie substancji zabronionych → <strong>powiadom Dyrektora przed otwarciem</strong>.",
     "Podejrzana przesyłka (zapach, wycieki) → <strong>nie otwieraj</strong>, Dyrektor i Policja.",
     "Każda paczka odnotowana w rejestrze korespondencji.",
     "Niedozwolone przedmioty w paczce – sporządź protokół, zabezpiecz."
   ],
   alert:{t:"info",txt:"Wychowanek ma prawo do korespondencji z rodziną. Nie możesz zatrzymać korespondencji z sądem rodzinnym."}},

  {id:"p-odwiedz",cat:"other",sev:"ok",icon:"👨‍👩‍👦",
   title:"Odwiedziny",sub:"Zasady przyjmowania odwiedzających",
   src:"Procedury – Odwiedziny | Statut MOW §36",
   steps:[
     "Odwiedziny w <strong>ustalonych godzinach</strong> z pisemną zgodą Dyrektora (jeśli wymagana).",
     "Sprawdź tożsamość – wpisz do rejestru.",
     "Odwiedziny w <strong>wyznaczonych miejscach</strong> pod nadzorem.",
     "Obserwuj – zapobiegaj przekazywaniu niedozwolonych przedmiotów.",
     "Niepokojące zachowanie odwiedzającego → przerwij wizytę, powiadom Dyrektora."
   ],
   alert:{t:"info",txt:"Wychowanek ma prawo do kontaktów z rodziną. Sąd może ograniczyć kontakty – sprawdź postanowienie sądowe."}},

  {id:"p-cyber",cat:"safety",sev:"warn",icon:"💻",
   title:"Cyberprzemoc",sub:"Przemoc z użyciem telefonu lub internetu",
   src:"Procedury Postępowania – pkt 11",
   steps:[
     "Ustal co się stało, kto jest sprawcą.",
     "Zabezpiecz dowody – zrzut ekranu, zapisz treść.",
     "<strong>Nie usuwaj</strong> dowodów.",
     "Powiadom Dyrektora i rodziców.",
     "Treści niezgodne z prawem (groźby, pornografia) → zawiadom Policję."
   ],
   alert:{t:"warn",txt:"Sprawca-wychowanek → procedura dyscyplinarna. Sprawca z zewnątrz → Policja."}},

  {id:"p-nadzuz",cat:"crisis",sev:"danger",icon:"🔞",
   title:"Podejrzenie wykorzystania seksualnego",sub:"Ujawnienie lub podejrzenie",
   src:"Procedury Postępowania – pkt 12 | Art. 12 Ustawy o Nieletnich",
   steps:[
     "<strong>Wysłuchaj wychowanka</strong> – spokojnie, bez oceniania. Nie zadawaj sugestywnych pytań.",
     "Zapewnij bezpieczeństwo – odizoluj od potencjalnego sprawcy.",
     "<strong>Powiadom Dyrektora</strong> niezwłocznie.",
     "Dyrektor powiadamia <strong>Policję i Prokuraturę</strong> – obowiązek prawny.",
     "<strong>Nie prowadź własnego dochodzenia</strong>.",
     "Dokumentacja – co, kiedy, słowo w słowo co powiedział wychowanek."
   ],
   alert:{t:"danger",txt:"OBOWIĄZEK ZAWIADOMIENIA ORGANÓW ŚCIGANIA. Brak zawiadomienia grozi odpowiedzialnością karną (art. 240 KK)!"}},

  {id:"p-kradziez",cat:"safety",sev:"warn",icon:"💰",
   title:"Kradzież",sub:"Kradzież mienia na terenie placówki",
   src:"Procedury Postępowania – pkt 5",
   steps:[
     "Ustal okoliczności: kiedy, co skradziono, kto zgłosił.",
     "Rozmowa z podejrzanym – bez oskarżeń.",
     "<strong>Powiadom Dyrektora</strong>.",
     "Dyrektor decyduje o Policji (wartość > 500 zł lub czyn karalny nieletniego).",
     "Dokumentacja, wpis do karty obserwacji wychowanka."
   ],
   alert:{t:"warn",txt:"Wymuszenie cudzej własności = spadek o 1–2 stopnie uspołecznienia."}},

  {id:"p-przepust",cat:"other",sev:"ok",icon:"🚶",
   title:"Przepustka / Urlop",sub:"Zasady udzielania i monitorowania",
   src:"Statut MOW §37 | Regulamin Stopni",
   steps:[
     "Przepustka od stopnia 0 wzwyż – decyzja Dyrektora.",
     "Zgoda pisemna – odnotuj w dokumentacji.",
     "Ustal godzinę powrotu – wpisz do rejestru wyjść.",
     "Brak powrotu w terminie → procedura ucieczki po 30 min.",
     "Po powrocie sprawdź stan wychowanka."
   ],
   alert:{t:"info",txt:"Stopień +1: przepustka do miasta, urlop do domu. Stopień +2/+3: więcej możliwości. Stopień zerowy/ujemny: brak przepustek."}}
];
