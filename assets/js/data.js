/* Extracted from index.html */
/* ────────────────────────────────
   DATA
──────────────────────────────── */
const SCHEDULE = [
  {t:"06:30",e:"06:35",l:"Pobudka",tip:"Zapal światło, spokojnie: 'Dzień dobry – pobudka, proszę wstawać.' Daj ok. 2 min na wstanie."},
  {t:"06:35",e:"07:00",l:"Gimnastyka poranna",tip:"Krótkie ćwiczenia (do 5 min) od głowy/szyi w dół. Jednolity strój sportowy grupy."},
  {t:"07:00",e:"07:30",l:"Toaleta poranna",tip:"Mobilizuj do higieny – sprawdzaj stan czystości, zęby, twarz, ręce."},
  {t:"07:30",e:"08:00",l:"Śniadanie",tip:"Zejście na stołówkę prawą stroną klatki. Czujność: nie dopuszczaj do wymuszania porcji."},
  {t:"08:00",e:"14:00",l:"Szkoła",tip:"Przed wyjściem sprawdź kompletność zeszytów. Poinformuj nauczyciela o istotnych zdarzeniach."},
  {t:"14:00",e:"14:45",l:"Obiad",tip:"Obecność w kuchni przy transporcie gorących posiłków (ryzyko poparzeń)."},
  {t:"14:45",e:"17:00",l:"Zajęcia wychowawcze",tip:"Spacery, zakupy, sport, porządki. Unikaj zostawiania wychowanków bez nadzoru – czas ryzyka."},
  {t:"17:00",e:"17:15",l:"Teleexpress",tip:"Zapoznanie z bieżącymi wiadomościami."},
  {t:"17:15",e:"18:15",l:"Nauka własna",tip:"Praca z zeszytem łącznikowym. Pomoc w zaległościach. Dyscyplinuj grupę."},
  {t:"18:15",e:"19:00",l:"Zajęcia wieczorne",tip:"Przygotowanie do kolacji, toaleta, łaźnia, ścielenie łóżek. Uwaga: nogi i skarpety przed 20:45."},
  {t:"19:00",e:"19:30",l:"Kolacja",tip:"Zejście grupą na stołówkę."},
  {t:"19:30",e:"20:45",l:"Czas wolny",tip:"Korzystanie z telefonów wg stopnia uspołecznienia i zachowania w danym dniu."},
  {t:"20:45",e:"21:00",l:"Dyżury specjalne",tip:"Wykonanie dyżurów wieczornych – toaleta i korytarz. Przygotowanie do ciszy nocnej."},
  {t:"21:00",e:"21:30",l:"Mała cisza nocna",tip:"Wychowankowie do sypialni. Wyciszamy grupy, gasimy 'górne światła'."},
  {t:"21:30",e:"06:30",l:"Cisza nocna",tip:"Sprawdzenie stanu osobowego przed odejściem. Wyłącz lampki nocne."},
];

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

const STOPNIE = [
  {id:"sn2",lvl:"–2",title:"Stopień –2",cls:"st-n2",kies:"20% kwoty bazowej",
   crit:["czyn karalny na terenie MOW lub poza nim","rażące naruszenie porządku"],
   przyw:["Kieszonkowe 20%","Brak telefonu komórkowego","Brak przepustek","Ograniczenie TV (piątki/soboty do 21:00)","Obniżenie oceny z zachowania","Powiadomienie sądu rodzinnego","Rozmowa ostrzegawcza wychowawcy i dyrektora"]},
  {id:"sn1",lvl:"–1",title:"Stopień –1",cls:"st-n1",kies:"40% kwoty bazowej",
   crit:["samookaleczenie","ucieczka","poważne naruszenie regulaminu"],
   przyw:["Kieszonkowe 40%","Brak telefonu komórkowego","Brak przepustek do miasta","Ograniczenie TV","Wzmożony nadzór wychowawcy"]},
  {id:"s0",lvl:"0 (adaptacyjny)",title:"Stopień zerowy",cls:"st-0",kies:"60% kwoty bazowej",
   crit:["realizuje dyżury w internacie i szkole","przestrzega rozkładu dnia","poprawnie odnosi się do kolegów i pracowników","dba o higienę własną i mienie ośrodka","aktywnie uczestniczy w zajęciach nauki własnej","uczestniczy w zajęciach grupy i szkole"],
   przyw:["Kieszonkowe 60%","Imprezy kulturalne na terenie MOW","Siłownia/pracownia komputerowa (w ramach grupy)","Pochwała wychowawcy","Możliwość ubiegania się o urlop (decyzja Dyrektora)","TV piątki/soboty do 21:30","Telefon 3×/tydzień po 30 min w miejscu wyznaczonym przez wychowawcę"]},
  {id:"sp1",lvl:"+1",title:"Stopień +1",cls:"st-p1",kies:"80% kwoty bazowej",
   crit:["samodzielnie realizuje dyżury","przestrzega rozkładu dnia","wyrobione nawyki higieniczno-porządkowe","nadrabia zaległości szkolne","pozytywne oceny odpowiednio do możliwości","uczestniczy w zajęciach wyrównawczych (jeśli potrzeba)","prawidłowe relacje z kolegami i pracownikami","punktualnie powraca z przepustek"],
   przyw:["Kieszonkowe 80%","Zawody sportowe i konkursy poza MOW","Imprezy kulturalne poza MOW","Dyplom uznania (gabicha samorządu)","Telefon wg regulaminu","Przepustka do miasta, urlop do domu (święta, wakacje, ferie)","Wyjście do miasta z osobą odwiedzającą","Pochwała na forum ośrodka"]},
  {id:"sp2",lvl:"+2",title:"Stopień +2",cls:"st-p2",kies:"100% kwoty bazowej",
   crit:["spełnia kryteria stopnia +1","z kulturą i szacunkiem odnosi się do innych (nie używa wulgaryzmów)","pomaga innym wychowankom","dobre wyniki w nauce wg możliwości","realizuje dodatkowe zadania wychowawcy","zawsze terminowo powraca z przepustek","wspiera słabszych kolegów i nowo przybyłych"],
   przyw:["Kieszonkowe 100%","Nagrody rzeczowe","Dopuszczenie do śródrocznej promocji","List pochwalny do rodziców","Pochwała dyrektora na forum placówki","Wpis do księgi nagród","Telefon we własnej sypialni","Urlop + dodatkowe dni","Wyjście na imprezy środowiska lokalnego","Poparcie wniosku o wcześniejsze zwolnienie"]},
  {id:"sp3",lvl:"+3",title:"Stopień +3",cls:"st-p3",kies:"120% kwoty bazowej",
   crit:["spełnia kryteria stopnia +2","wzorowo odnosi się do kolegów i pracowników MOW","dobre i bardzo dobre wyniki w nauce","min. 2 miesiące: zdrowy, higieniczny, wolny od nałogów tryb życia","aktywnie uczestniczy w projektach edukacyjnych (akademie, uroczystości)","podejmuje inicjatywy na rzecz grupy i zespołu klasowego"],
   przyw:["Kieszonkowe 120%","Wszystkie przywileje stopnia +2","Reprezentowanie MOW na zewnątrz","Poparcie wcześniejszego zwolnienia"]}
];

const QUICK_ACTIONS = [
  {icon:"🥊",label:"Bójka / Agresja",proc:"p-agresja",cls:"qred"},
  {icon:"🚪",label:"Ucieczka",proc:"p-ucieczka",cls:"qred"},
  {icon:"💊",label:"Narkotyki / Alkohol",proc:"p-narkotyki",cls:"qred"},
  {icon:"🆘",label:"Próba samobójcza",proc:"p-samo",cls:"qred"},
  {icon:"🔪",label:"Niebezpieczne przedmioty",proc:"p-niebezp",cls:"qorn"},
  {icon:"🔥",label:"Pożar / Ewakuacja",proc:"p-pozar",cls:"qorn"},
  {icon:"📊",label:"Stopnie uspołecznienia",screen:"s-stop",cls:"qgold"},
  {icon:"🤖",label:"Zapytaj AI",screen:"s-ai",cls:"qblue"},
];

const CHAT_PILLS = [
  "Jak reagować na agresję wychowanka?",
  "Co to jest stopień uspołecznienia +1?",
  "Kiedy zawiadomić Policję?",
  "Jak motywować wychowanków?",
  "Prawa wychowanka w MOW",
  "Jak dokumentować incydenty?",
  "Co robić przy próbie ucieczki?",
  "Kiedy wzywać pogotowie?",
];

const LAWS = [
  {n:"1",t:"Ustawa o postępowaniu w sprawach nieletnich (Dz.U. 2022 poz. 1082) – podstawa prawna działania MOW."},
  {n:"2",t:"Rozporządzenie MEN z 27 grudnia 2011 r. – zasady kierowania, przyjmowania, przenoszenia, zwalniania i pobytu nieletnich w MOW."},
  {n:"3",t:"Rozporządzenie RM z 22 lutego 2011 r. – warunki i sposoby użycia środków przymusu bezpośredniego wobec nieletnich w MOW."},
  {n:"4",t:"Ustawa o systemie oświaty z 7 września 1991 r. – ramy organizacyjne placówki."},
  {n:"5",t:"Ustawa o wychowaniu w trzeźwości i przeciwdziałaniu alkoholizmowi (Dz.U. Nr 35 poz. 230)."},
  {n:"6",t:"Ustawa o przeciwdziałaniu narkomanii z 29 lipca 2005 r."},
  {n:"7",t:"Ustawa o Policji z 6 kwietnia 1990 r."},
  {n:"8",t:"Statut MOW nr 1 im. T. Kościuszki w Malborku – wewnętrzny akt prawny placówki."},
  {n:"9",t:"Karta Nauczyciela (Dz.U. z 2023 poz. 984) – prawa, obowiązki wychowawcy, awans zawodowy."},
  {n:"10",t:"Zarządzenie nr 15/97 KGP z 16 czerwca 1997 r. – zapobieganie demoralizacji i przestępczości nieletnich."},
];

