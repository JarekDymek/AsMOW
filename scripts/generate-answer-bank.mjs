import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const sources = {
  internal: [
    'Statut MOW nr 1 w Malborku',
    'Procedury wewnętrzne MOW nr 1 w Malborku',
    'Regulamin stopni uspołecznienia MOW',
    'Standardy ochrony małoletnich MOW',
    'Aktualne zarządzenia dyrektora i bieżące komunikaty dyrekcji'
  ],
  nieletni: [
    'Ustawa o wspieraniu i resocjalizacji nieletnich, Dz.U. 2026 poz. 163'
  ],
  placowki: [
    'Rozporządzenie MEiN z 30 marca 2023 r. w sprawie niektórych publicznych placówek systemu oświaty, Dz.U. 2023 poz. 651'
  ],
  oswiata: [
    'Ustawa - Prawo oświatowe, Dz.U. 2026 poz. 820'
  ],
  praca: [
    'Karta Nauczyciela, Dz.U. 2026 poz. 515',
    'Kodeks pracy, Dz.U. 2025 poz. 277 z późn. zm.',
    'Rozporządzenie MEiN z 6 września 2022 r. w sprawie awansu zawodowego nauczycieli, Dz.U. 2022 poz. 1914'
  ],
  bezpieczenstwo: [
    'Ustawa o środkach przymusu bezpośredniego i broni palnej, Dz.U. 2026 poz. 244',
    'Rozporządzenie w sprawie BHP w szkołach i placówkach, t.j. Dz.U. 2020 poz. 1604 z późn. zm.'
  ],
  ppp: [
    'Rozporządzenie w sprawie pomocy psychologiczno-pedagogicznej, Dz.U. 2023 poz. 1798',
    'Rozporządzenie o kształceniu, wychowaniu i opiece młodzieży niedostosowanej społecznie, Dz.U. 2020 poz. 1309'
  ],
  dokumentacja: [
    'Rozporządzenie o dokumentacji przebiegu nauczania, działalności wychowawczej i opiekuńczej, Dz.U. 2024 poz. 50'
  ]
};

const categories = [
  category('czas-pracy', 'Czas pracy, pensum i awans', [sources.praca, sources.internal], [
    item('pensum-wychowawcy-mow', 'Ile wynosi pensum wychowawcy w MOW?', 'Pensum wychowawcy w młodzieżowym ośrodku wychowawczym wynosi 24 godziny tygodniowo. Trzeba odróżnić pensum od 40-godzinnego tygodniowego czasu pracy nauczyciela.', 'W odpowiedzi wskaż art. 42 ust. 3 Karty Nauczyciela, tabela, lp. 8 lit. c. Dodaj, że art. 42 ust. 1 mówi o czasie pracy do 40 godzin, a nie o pensum.', ['pensum', 'etat', '24 godziny', '40 godzin', 'art 42', 'wychowawca MOW']),
    item('czas-pracy-40-godzin', 'Czy pełny etat nauczyciela-wychowawcy oznacza 40 godzin zajęć z wychowankami?', 'Nie. Pełny etat nauczyciela oznacza czas pracy do 40 godzin tygodniowo, ale zajęcia bezpośrednie wychowawcy MOW są rozliczane przez pensum 24 godziny.', 'Wyjaśnij różnicę między czasem pracy, pensum, innymi czynnościami statutowymi i przygotowaniem do zajęć.', ['etat', 'czas pracy', '40 godzin', 'zajęcia bezpośrednie']),
    item('nadgodziny-wychowawcy', 'Jak rozumieć nadgodziny wychowawcy MOW?', 'Nadgodziny trzeba odnosić do pensum, arkusza organizacji, polecenia dyrektora i ewidencji. AI nie powinno wydawać decyzji płacowej bez dokumentów kadrowych.', 'Dopytaj o okres, harmonogram, podstawę przydziału godzin i sposób ewidencji.', ['nadgodziny', 'godziny ponadwymiarowe', 'rozliczenie', 'pensum']),
    item('praca-w-nocy', 'Czy praca w nocy wychowawcy MOW jest rozliczana tak samo jak zwykły dyżur?', 'Nie zawsze. Trzeba sprawdzić status pracownika, charakter zajęć, regulamin pracy, ewidencję i przepisy Karty Nauczyciela oraz pomocniczo Kodeksu pracy.', 'Nie obiecuj dodatku ani konkretnej stawki bez dokumentów płacowych.', ['noc', 'dyżur nocny', '22-6', 'dodatek nocny']),
    item('weekendy-i-swieta', 'Jak pytać o pracę wychowawcy w weekendy i święta?', 'Odpowiedź wymaga ustalenia harmonogramu, okresu rozliczeniowego, polecenia dyrektora i lokalnych zasad. Sam fakt pracy w weekend nie przesądza jeszcze sposobu rozliczenia.', 'Dopytaj o datę, godziny, rodzaj zajęć i czy praca wynikała z zatwierdzonego grafiku.', ['weekend', 'sobota', 'niedziela', 'święto', 'dyżur']),
    item('harmonogram-a-rozliczenie', 'Czy harmonogram dyżurów jest jedyną podstawą rozliczenia czasu pracy?', 'Nie. Harmonogram pokazuje organizację pracy, ale trzeba go zestawić z arkuszem organizacji, regulaminem pracy, Kartą Nauczyciela, poleceniami dyrektora i ewidencją.', 'Wskaż, że harmonogram jest ważnym dowodem organizacyjnym, ale nie jedyną podstawą prawną.', ['harmonogram', 'grafik', 'rozliczenie', 'arkusz organizacji']),
    item('awans-zawodowy', 'Jak aplikacja może pomóc w awansie zawodowym wychowawcy?', 'Aplikacja może porządkować działania, dowody, opisy przypadków i sprawozdania, ale nie potwierdza automatycznie spełnienia wymagań awansu.', 'Dopytaj o stopień awansu, okres, wymaganie i dokumenty użytkownika.', ['awans', 'nauczyciel mianowany', 'dyplomowany', 'sprawozdanie']),
    item('obowiazki-wychowawcy', 'Jakie obowiązki wychowawcy wynikają z pracy w MOW?', 'Obowiązki wynikają łącznie z Karty Nauczyciela, statutu MOW, zakresu czynności, procedur, harmonogramu i poleceń dyrektora. Odpowiedź musi rozdzielać obowiązki prawne, organizacyjne i dokumentacyjne.', 'Nie twórz zamkniętej listy bez sprawdzenia lokalnych dokumentów.', ['obowiązki', 'zakres czynności', 'wychowawca']),
    item('urlop-pracownika', 'Czy AI może rozstrzygnąć urlop wypoczynkowy wychowawcy?', 'AI może wskazać, jakie dokumenty sprawdzić, ale nie powinno rozstrzygać kadrowo. Potrzebne są status zatrudnienia, plan urlopów, organizacja pracy placówki i przepisy Karty Nauczyciela.', 'Dopytaj, czy chodzi o nauczyciela, pracownika niepedagogicznego czy dyrektora.', ['urlop pracownika', 'wypoczynkowy', 'kadry']),
    item('kodeks-pracy-pomocniczo', 'Czy Kodeks pracy jest podstawą czasu pracy wychowawcy MOW?', 'Dla nauczyciela-wychowawcy podstawowa jest Karta Nauczyciela. Kodeks pracy stosuje się pomocniczo tam, gdzie sprawa nie jest uregulowana albo przepisy odsyłają do Kodeksu pracy.', 'Zawsze rozróżnij nauczyciela od pracownika administracji lub obsługi.', ['kodeks pracy', 'karta nauczyciela', 'pomocniczo'])
  ]),

  category('prawa-wychowanka', 'Prawa wychowanka i granice praw', [sources.nieletni, sources.internal], [
    item('art-107-prawa', 'Jakie prawa ma wychowanek MOW?', 'Podstawą jest art. 107 ustawy o wspieraniu i resocjalizacji nieletnich. Wychowanek ma m.in. prawo do godności, prywatności, ochrony przed przemocą, nauki, informacji o prawach i obowiązkach, kontaktu, pomocy oraz skarg i wniosków.', 'W pytaniu o praktykę zawsze sprawdź też statut i regulamin MOW.', ['prawa wychowanka', 'art 107', 'godność', 'skarga']),
    item('granice-praw-art111', 'Czy prawa wychowanka są nieograniczone?', 'Nie. Korzystanie z praw nie może naruszać praw innych osób ani zakłócać porządku wewnętrznego osrodka.', 'Wskaż art. 111 ustawy i lokalny regulamin.', ['granice praw', 'porządek wewnętrzny', 'art 111']),
    item('kontakt-z-rodzina', 'Czy wychowanek ma prawo do kontaktu z rodziną?', 'Tak, kontakt z rodziną należy do praw wychowanka, ale odbywa się na zasadach określonych w ustawie, statucie, regulaminie i decyzjach uprawnionych osób.', 'Jeżeli chodzi o ograniczenie kontaktu, sprawdź przesłanki z art. 115.', ['rodzina', 'kontakt', 'odwiedziny', 'telefon']),
    item('ograniczenie-kontaktu', 'Kiedy można ograniczyć kontakt wychowanka z osobą z zewnątrz?', 'Można to rozważać tylko w warunkach przewidzianych prawem, gdy kontakt zagraża bezpieczeństwu, porządkowi, postępowaniu lub procesowi resocjalizacji. Decyzja wymaga podstawy i dokumentacji.', 'Wskaż art. 115 i procedurę MOW.', ['ograniczyć kontakt', 'zakaz kontaktu', 'art 115']),
    item('skarga-wniosek', 'Co zrobić, gdy wychowanek chce złożyć skargę albo wniosek?', 'Należy umożliwić realizację prawa do skarg i wniosków zgodnie z procedurą MOW, bez utrudniania i z zachowaniem dokumentacji.', 'Nie oceniaj skargi przed jej przyjęciem; opisz właściwy kanał.', ['skarga', 'wniosek', 'zażalenie']),
    item('prawo-do-nauki', 'Czy wychowanek MOW ma prawo do nauki?', 'Tak. Prawo do nauki należy do podstawowych praw wychowanka, a MOW ma organizować naukę, wychowanie, pomoc psychologiczno-pedagogiczną i resocjalizację.', 'Odwołaj się do art. 107 oraz rozporządzenia MEiN o placówkach.', ['nauka', 'szkoła', 'obowiązek nauki']),
    item('prawo-do-prywatnosci', 'Jak rozumieć prywatność wychowanka w MOW?', 'Wychowanek ma prawo do prywatności, ale z ograniczeniami wynikającymi z rodzaju placówki, bezpieczeństwa i porządku. Ograniczenia muszą mieć podstawę i być proporcjonalne.', 'Nie myl prywatności z brakiem nadzoru wychowawczego.', ['prywatność', 'intymność', 'kontrola']),
    item('informacja-o-prawach', 'Czy trzeba informować wychowanka o prawach i obowiązkach?', 'Tak. Po przyjęciu wychowanka należy zapoznać go z prawami, obowiązkami i zasadami pobytu oraz udokumentować to zgodnie z przepisami i procedurą.', 'Wskaż art. 179 ustawy oraz § 13 rozporządzenia MEiN.', ['prawa i obowiązki', 'przyjęcie', 'podpis']),
    item('zakaz-dyskryminacji', 'Jak odpowiadać na pytania o nierówne traktowanie wychowanka?', 'Należy odwołać się do godności, ochrony przed przemocą i standardów ochrony małoletnich. Trzeba zebrać fakty, zabezpieczyć wychowanka i zgłosić sprawę zgodnie z procedurą.', 'Dopytaj o konkretne zachowanie, osoby i zagrożenie.', ['dyskryminacja', 'godność', 'przemoc psychiczna']),
    item('prawa-a-bezpieczenstwo', 'Co jeśli prawo wychowanka koliduje z bezpieczeństwem grupy?', 'Trzeba szukać rozwiązania proporcjonalnego: chronić prawa wychowanka, ale też bezpieczeństwo innych i porządek placówki. Decyzję należy oprzeć o statut, procedury i przepisy.', 'Nie udzielaj kategorycznej zgody bez opisu zagrożenia.', ['kolizja praw', 'bezpieczeństwo grupy', 'porządek'])
  ]),

  category('przyjecie-pobyt', 'Przyjęcie, pobyt i dokumentacja wychowanka', [sources.nieletni, sources.placowki, sources.dokumentacja, sources.internal], [
    item('kiedy-wychowanek', 'Kiedy nieletni staje się wychowankiem MOW?', 'Zgodnie z rozporządzeniem MEiN nieletni staje się wychowankiem z dniem zawiadomienia dyrektora MOW przez komisję o skierowaniu do osrodka.', 'Wskaż § 12 rozporządzenia MEiN.', ['staje się wychowankiem', 'skierowanie', 'komisja']),
    item('rozmowa-wstepna', 'Co obejmuje rozmowa wstępna po przyjęciu?', 'Po przyjęciu przeprowadza się rozmowę wstępną oraz zapoznaje wychowanka z prawami, obowiązkami i zasadami pobytu. Czynności należy udokumentować.', 'Wskaż art. 179 ustawy i § 13 rozporządzenia.', ['rozmowa wstępna', 'przyjęcie', 'prawa obowiązki']),
    item('odmowa-podpisu', 'Co zrobić, gdy wychowanek odmawia podpisu przy zapoznaniu z zasadami?', 'Należy sporządzić adnotację o odmowie i dołączyć ją do indywidualnej teczki wychowanka.', 'Wskaż § 13 rozporządzenia MEiN.', ['odmowa podpisu', 'adnotacja', 'teczka']),
    item('teczka-wychowanka', 'Co powinno trafiać do indywidualnej teczki wychowanka?', 'Do teczki trafiają dokumenty wymagane przepisami i procedurami MOW, m.in. potwierdzenia, informacje o przepustkach, istotne notatki i dokumentacja pobytu.', 'Nie twórz pełnego katalogu bez lokalnej instrukcji kancelaryjnej.', ['teczka wychowanka', 'dokumentacja', 'akta']),
    item('depozyt', 'Co z dokumentami i przedmiotami po przyjęciu wychowanka?', 'Ustawa przewiduje przekazanie do depozytu dokumentów tożsamości, środków pieniężnych, przedmiotów wartościowych i przedmiotów, których nie może posiadać w osrodku.', 'Wskaż art. 179 ust. 2 i lokalny regulamin depozytu.', ['depozyt', 'dokumenty', 'przedmioty wartościowe']),
    item('kontrola-po-przyjeciu', 'Czy po przyjęciu można wykonać kontrolę wychowanka?', 'W przewidzianych ustawą przypadkach można zastosować kontrolę pobieżną, a w uzasadnionych przypadkach kontrolę osobistą lub badanie na substancje psychoaktywne.', 'Wskaż art. 179 i zachowaj ostrożność proceduralną.', ['kontrola', 'badanie', 'substancje', 'przyjęcie']),
    item('izba-adaptacyjna', 'Kiedy można umieścić wychowanka w izbie adaptacyjnej?', 'Tylko w przypadkach i trybie przewidzianym ustawą oraz procedurą MOW. Wymaga to podstawy, proporcjonalności i dokumentacji.', 'Dopytaj o okoliczności i zagrożenie.', ['izba adaptacyjna', 'adaptacja', 'przyjęcie']),
    item('pobyt-po-zwolnieniu', 'Czy wychowanek po zwolnieniu może pozostać w MOW?', 'Rozporządzenie przewiduje sytuację nieletniego zwolnionego z MOW, który uzyskał zgodę na pozostanie w osrodku. Szczegóły wymagają sprawdzenia decyzji i dokumentów.', 'Wskaż § 12 ust. 2 rozporządzenia.', ['pozostanie w MOW', 'po zwolnieniu', 'zgoda']),
    item('ocena-zasadnosci-pobytu', 'Czy zasadność dalszego pobytu wychowanka powinna być oceniana?', 'Tak, w dokumentach placówki i rozporządzeniu przewidziano ocenianie zasadności dalszego pobytu oraz współpracę z właściwymi podmiotami.', 'Odpowiedź doprecyzuj według dokumentacji MOW.', ['zasadność pobytu', 'ocena pobytu', 'dalszy pobyt']),
    item('usamodzielnienie', 'Jak rozumieć przygotowanie do usamodzielnienia wychowanka?', 'Jest to element zadania MOW: przygotowanie wychowanka do samodzielnego, odpowiedzialnego i zgodnego z normami życia po opuszczeniu osrodka.', 'Wskaż § 11 rozporządzenia MEiN.', ['usamodzielnienie', 'samodzielność', 'opuszczenie MOW'])
  ]),

  category('urlopy-przepustki', 'Urlopy, przepustki i opuszczanie osrodka', [sources.nieletni, sources.placowki, sources.internal], [
    item('roznica-urlop-przepustka', 'Czym różni się urlop od przepustki wychowanka MOW?', 'Urlop wymaga zgody sędziego rodzinnego, a przepustka jest udzielana przez dyrektora osrodka, chyba że sędzia zastrzegł konieczność zgody. Trzeba sprawdzić art. 180 ustawy oraz § 14-15 rozporządzenia.', 'Zawsze rozróżnij urlop, przepustkę i zgodę organu prowadzącego postępowanie.', ['urlop', 'przepustka', 'sędzia', 'dyrektor']),
    item('kiedy-urlop', 'Kiedy można udzielić urlopu wychowankowi?', 'Urlop może być udzielony w dniach, w których w szkole wychowanka nie odbywają się zajęcia dydaktyczno-wychowawcze, po spełnieniu wymogów zgody i dokumentacji.', 'Wskaż § 14 rozporządzenia MEiN.', ['urlop wychowanka', 'dni wolne', 'zajęcia dydaktyczne']),
    item('wniosek-urlop', 'Kto składa wniosek o zgodę na urlop wychowanka?', 'Wniosek do sędziego rodzinnego składa dyrektor MOW na prośbę wychowanka, z wymaganymi załącznikami zależnymi od sytuacji.', 'Wskaż § 14 ust. 2 rozporządzenia.', ['wniosek urlopowy', 'dyrektor', 'sędzia rodzinny']),
    item('plan-podrozy-urlop', 'Co powinno być ustalone przy urlopie wychowanka?', 'Po zgodzie należy przedstawić dyrektorowi informację o przebiegu podróży, miejscu pobytu i sposobie spędzania urlopu przez wychowanka.', 'Wskaż § 14 ust. 3 rozporządzenia.', ['podróż', 'miejsce pobytu', 'sposób spędzania urlopu']),
    item('czas-przepustki', 'Ile może trwać przepustka wychowanka MOW?', 'Przepustka może być udzielona na okres nie dłuższy niż 5 dni. Pierwsza przepustka zasadniczo po upływie 30-dniowego okresu pobytu, z wyjątkami losowymi.', 'Wskaż § 15 rozporządzenia.', ['5 dni', '30 dni', 'pierwsza przepustka']),
    item('przepustka-losowa', 'Czy w przypadkach losowych przepustka może być dłuższa albo wcześniejsza?', 'Tak, w przypadkach losowych dyrektor może udzielić przepustki dłuższej niż 5 dni albo przed upływem 30 dni, jeżeli przepisy i sytuacja na to pozwalają.', 'Wskaż § 15 ust. 3 i dokumentuj uzasadnienie.', ['losowa', 'dłuższa przepustka', 'przed 30 dniami']),
    item('opinia-wychowawcy-przepustka', 'Jaka jest rola wychowawcy przy przepustce?', 'Przepustka jest udzielana na wniosek wychowanka zaopiniowany przez wychowawcę. Opinia powinna być oparta na faktach, zachowaniu, ryzykach i aktualnej dokumentacji.', 'Wskaż § 15 ust. 4.', ['opinia wychowawcy', 'wniosek przepustka', 'zaopiniowany']),
    item('dokumentacja-przepustki', 'Czy informację o przepustce trzeba dokumentować?', 'Tak. Informację o przepustce dołącza się do indywidualnej teczki wychowanka.', 'Wskaż § 15 ust. 5 rozporządzenia.', ['teczka', 'dokumentacja przepustki', 'informacja o przepustce']),
    item('czasowe-opuszczenie', 'W jakich przypadkach wychowanek może czasowo opuścić MOW?', 'Art. 180 ustawy wskazuje m.in. urlop, przepustkę, uczęszczanie za zgodą sędziego do szkoły poza osrodkiem i praktyczną naukę zawodu.', 'Dopytaj, o który tryb chodzi.', ['czasowo opuścić', 'art 180', 'praktyczna nauka']),
    item('brak-powrotu', 'Co zrobić, gdy wychowanek nie wrócił z przepustki lub urlopu?', 'Należy zastosować procedurę MOW: ustalić fakty, powiadomić dyrektora i właściwe osoby lub służby, udokumentować czas, kontakt i czynności.', 'Nie improwizuj; korzystaj z procedury ucieczki/niepowrotu.', ['nie wrócił', 'brak powrotu', 'przepustka', 'urlop'])
  ]),

  category('ucieczki-powroty', 'Ucieczki, niepowroty i samowolne oddalenia', [sources.nieletni, sources.internal], [
    item('ucieczka-pierwsze-kroki', 'Co zrobić przy ucieczce wychowanka?', 'Zabezpiecz pozostałych wychowanków, ustal okoliczności, powiadom dyrektora i wykonaj procedurę MOW dotyczącą ucieczki lub niepowrotu. Dokumentuj godziny, osoby i podjęte czynności.', 'Jeżeli jest zagrożenie życia lub zdrowia, priorytetem jest wezwanie pomocy.', ['ucieczka', 'oddalenie', 'samowolne']),
    item('niepowrot-z-urlopu', 'Czy niepowrót z urlopu traktować jak ucieczkę?', 'Może wymagać podobnego trybu powiadomień i dokumentacji, ale trzeba ustalić dokładny stan faktyczny: termin powrotu, kontakt, miejsce pobytu i decyzje dyrektora.', 'Nie przesądzaj kwalifikacji bez faktów.', ['niepowrót', 'urlop', 'spóźnienie']),
    item('powrot-po-ucieczce', 'Jak postępować po powrocie wychowanka z ucieczki?', 'Stosuj art. 179 ust. 4 ustawy i procedurę MOW. Możliwe są przewidziane prawem czynności po powrocie, np. kontrola, badanie na substancje, obserwacja, rozmowa i dokumentacja.', 'Dopytaj o stan zdrowia i ryzyko.', ['powrót z ucieczki', 'art 179 ust 4', 'kontrola']),
    item('zawiadomienie-policji', 'Kiedy przy ucieczce zawiadamiać Policję?', 'Zgodnie z procedurą MOW i decyzją dyrektora lub osoby odpowiedzialnej. Jeżeli występuje zagrożenie życia, zdrowia albo podejrzenie przestępstwa, nie zwlekaj z wezwaniem pomocy.', 'Nie podawaj sztywnego czasu bez lokalnej procedury.', ['policja', 'zawiadomienie', 'ucieczka']),
    item('kontakt-z-rodzicem-ucieczka', 'Czy przy ucieczce informować rodzica albo opiekuna?', 'Zwykle tak, zgodnie z procedurą MOW i decyzją dyrektora. Należy odnotować czas, formę kontaktu i treść przekazanej informacji.', 'Uwzględnij ograniczenia wynikające z orzeczeń lub decyzji sądu.', ['rodzic', 'opiekun', 'powiadomienie']),
    item('notatka-ucieczka', 'Co wpisać w notatce po ucieczce?', 'Wpisz fakty: data, godzina stwierdzenia, ostatnie miejsce pobytu, osoby obecne, podjęte czynności, powiadomienia, kontakt z wychowankiem lub rodziną i dalsze decyzje.', 'Nie dopisuj domysłów jako faktów.', ['notatka', 'ucieczka', 'dokumentacja']),
    item('ryzyko-po-powrocie', 'Co sprawdzić po powrocie wychowanka z ucieczki?', 'Stan zdrowia, trzeźwość lub objawy substancji, posiadane przedmioty, bezpieczeństwo grupy, potrzeby psychologiczne i okoliczności oddalenia.', 'Działaj zgodnie z ustawą, procedurą MOW i zasadą proporcjonalności.', ['stan zdrowia', 'po powrocie', 'substancje']),
    item('rozmowa-po-ucieczce', 'Jak przeprowadzić rozmowę po ucieczce?', 'Najpierw bezpieczeństwo i stan zdrowia, potem spokojne ustalenie faktów i motywów. Rozmowa nie może zastępować wymaganych powiadomień i dokumentacji.', 'Nie stosuj rozmowy jako kary.', ['rozmowa', 'motywy', 'powrót']),
    item('konsekwencje-stopien-ucieczka', 'Czy ucieczka wpływa na stopień uspołecznienia?', 'Może wpływać zgodnie z regulaminem stopni MOW, ale decyzję trzeba oprzeć na konkretnym zapisie regulaminu, okolicznościach i dokumentacji.', 'Nie przyznawaj stopnia bez opisu faktów.', ['stopień', 'ucieczka', 'regulamin stopni']),
    item('ucieczka-a-sad', 'Czy o ucieczce informować sąd rodzinny?', 'Jeżeli wymaga tego procedura, decyzja sądu lub sytuacja wychowanka, należy przekazać informację właściwym kanałem. AI powinno wskazać potrzebę sprawdzenia dokumentów i decyzji dyrektora.', 'Nie zastępuj decyzji dyrektora lub sądu.', ['sąd rodzinny', 'ucieczka', 'zawiadomienie'])
  ]),

  category('kryzysy', 'Sytuacje kryzysowe i bezpieczeństwo', [sources.bezpieczenstwo, sources.internal], [
    item('bojka-agresja', 'Co zrobić przy bójce albo agresji fizycznej?', 'Zabezpiecz osoby, przerwij zagrożenie w granicach bezpieczeństwa, wezwij wsparcie, udziel pomocy, powiadom dyrektora i dokumentuj fakty zgodnie z procedurą MOW.', 'Jeżeli są obrażenia lub zagrożenie życia, wezwij 112.', ['bójka', 'agresja', 'pobicie']),
    item('agresja-slowna', 'Jak reagować na agresję słowną wychowanka?', 'Zachowaj bezpieczeństwo i spokój, przerwij eskalację, oddziel strony, nazwij granice, powiadom zgodnie z procedurą i odnotuj fakty.', 'Nie wdawaj się w konflikt i nie odpowiadaj agresją.', ['agresja słowna', 'wyzwiska', 'groźby']),
    item('proba-samobojcza', 'Co zrobić przy próbie samobójczej?', 'Natychmiast zabezpiecz życie i zdrowie, nie zostawiaj wychowanka samego, wezwij 112, powiadom dyrektora i specjalistów, a po opanowaniu sytuacji sporządź dokumentację.', 'Nie ograniczaj się do rozmowy wychowawczej.', ['próba samobójcza', 'samobójstwo', '112']),
    item('samookaleczenie', 'Co zrobić przy samookaleczeniu?', 'Zabezpiecz narzędzie, oceń stan zdrowia, udziel pierwszej pomocy, wezwij pomoc medyczną w razie potrzeby, zapewnij nadzór i powiadom dyrektora/specjalistów.', 'Nie traktuj tego wyłącznie jako naruszenia dyscypliny.', ['samookaleczenie', 'cięcie', 'rana']),
    item('zagrozenie-zycia', 'Kiedy bezwzględnie wzywać pomoc medyczną?', 'Przy zagrożeniu życia lub zdrowia: utracie przytomności, poważnych obrażeniach, zatruciu, próbie samobójczej, duszności, ostrych objawach po substancjach lub innych stanach nagłych.', 'Wskaż numer 112.', ['pogotowie', '112', 'utrata przytomności']),
    item('grozby-karalne', 'Co zrobić, gdy wychowanek grozi innym?', 'Zabezpiecz zagrożone osoby, oddziel strony, oceń realność zagrożenia, powiadom dyrektora i postępuj według procedury. Przy ryzyku przestępstwa lub zagrożenia wezwij Policję.', 'Dokumentuj dokładne słowa i świadków.', ['groźby', 'zastraszanie', 'policja']),
    item('przemoc-psychiczna', 'Jak reagować na przemoc psychiczną między wychowankami?', 'Zabezpiecz osobę pokrzywdzoną, przerwij zachowanie, zbierz fakty, powiadom dyrektora/specjalistów i dokumentuj. Sprawdź standardy ochrony małoletnich.', 'Nie bagatelizuj powtarzalnych zachowań.', ['przemoc psychiczna', 'nękanie', 'poniżanie']),
    item('wymuszenie', 'Co zrobić przy podejrzeniu wymuszenia?', 'Oddziel osoby, zabezpiecz pokrzywdzonego, zbierz fakty bez przesłuchiwania na siłę, powiadom dyrektora i postępuj zgodnie z procedurą, możliwe zawiadomienie Policji.', 'Nie prowadź samodzielnego śledztwa.', ['wymuszenie', 'haracz', 'groźba']),
    item('dewastacja', 'Co zrobić przy dewastacji mienia?', 'Zabezpiecz miejsce, ustal świadków, udokumentuj szkody, powiadom dyrektora i zastosuj procedurę MOW. Oddziel kwestię bezpieczeństwa od odpowiedzialności materialnej.', 'Nie wpisuj winy bez ustalenia faktów.', ['dewastacja', 'zniszczenie', 'mienie']),
    item('kryzys-dopytanie', 'Jak odpowiadać, gdy opis sytuacji kryzysowej jest zbyt krótki?', 'Najpierw dopytaj o bezpieczeństwo: czy ktoś jest ranny, gdzie jest wychowanek, czy zagrożenie trwa, kto został powiadomiony i czy wezwano pomoc.', 'Nie udzielaj pełnej procedury na ślepo, jeśli brakuje informacji o zagrożeniu.', ['kryzys', 'brak informacji', 'dopytaj'])
  ]),

  category('substancje-przedmioty', 'Substancje, alkohol i niebezpieczne przedmioty', [sources.nieletni, sources.bezpieczenstwo, sources.internal], [
    item('podejrzenie-narkotykow', 'Co zrobić przy podejrzeniu narkotyków lub dopalaczy?', 'Zabezpiecz wychowanka i grupę, powiadom dyrektora, w razie objawów medycznych wezwij 112, zabezpiecz przedmiot lub substancję zgodnie z procedurą i dokumentuj fakty.', 'Nie badaj ani nie identyfikuj substancji samodzielnie poza procedurą.', ['narkotyki', 'dopalacze', 'substancje']),
    item('alkohol', 'Co zrobić przy podejrzeniu alkoholu u wychowanka?', 'Oceń stan zdrowia, zabezpiecz wychowanka, powiadom dyrektora, postępuj według procedury i dokumentuj objawy oraz działania. W razie zagrożenia zdrowia wezwij pomoc medyczną.', 'Nie ograniczaj się do kary porządkowej.', ['alkohol', 'nietrzeźwy', 'zapach alkoholu']),
    item('badanie-substancje', 'Czy można badać wychowanka na obecność substancji psychoaktywnych?', 'Ustawa przewiduje możliwość badania w uzasadnionych przypadkach i określonym trybie. Trzeba stosować przepisy, procedurę MOW i dokumentację.', 'Nie wykonuj działań bez podstawy i upoważnienia.', ['badanie', 'substancje psychoaktywne', 'test']),
    item('niebezpieczny-przedmiot', 'Co zrobić przy znalezieniu niebezpiecznego przedmiotu?', 'Zabezpiecz przedmiot tak, aby nikt nie miał do niego dostępu, powiadom dyrektora, oceń zagrożenie i postępuj według procedury MOW.', 'Nie przekazuj przedmiotu innym wychowankom i dokumentuj miejsce znalezienia.', ['nóż', 'przedmiot', 'niebezpieczny']),
    item('telefon-niedozwolony', 'Co zrobić z niedozwolonym telefonem albo urządzeniem?', 'Stosuj regulamin MOW i aktualne zarządzenia. Zabezpiecz urządzenie zgodnie z procedurą, odnotuj fakt i powiadom przełożonego, jeśli wymaga tego sytuacja.', 'Nie przeglądaj prywatnych treści bez podstawy prawnej.', ['telefon', 'smartfon', 'urządzenie']),
    item('leki-bez-zgody', 'Co zrobić, gdy wychowanek ma leki bez wiedzy personelu?', 'Zabezpiecz leki, ustal ryzyko zdrowotne, powiadom dyrektora i personel medyczny lub uprawnioną osobę, dokumentuj zgodnie z procedurą.', 'Nie podawaj ani nie odstawiaj leków samodzielnie.', ['leki', 'tabletki', 'apteczka']),
    item('papierosy-e-papierosy', 'Jak reagować na papierosy lub e-papierosy?', 'Stosuj regulamin i procedury MOW. Zabezpiecz przedmiot, odnotuj fakt, oceń ryzyko i powiadom zgodnie z zasadami placówki.', 'Nie myl naruszenia regulaminu z sytuacją medyczną, chyba że są objawy.', ['papierosy', 'e-papieros', 'vape']),
    item('paczka-z-przedmiotem', 'Co zrobić, gdy w paczce jest zakazany przedmiot?', 'Zabezpiecz przedmiot, udokumentuj okoliczności, powiadom dyrektora i zastosuj procedurę korespondencji/paczek oraz zasad pobytu.', 'Nie niszcz ani nie wydawaj przedmiotu bez decyzji.', ['paczka', 'korespondencja', 'zakazany przedmiot']),
    item('przeszukanie-pokoju', 'Czy wychowawca może sam przeszukać pokój wychowanka?', 'Trzeba odróżnić kontrolę porządkową, kontrolę rzeczy i czynności o charakterze przeszukania. Działaj tylko w zakresie uprawnień, procedury i decyzji przełożonego.', 'Dopytaj o cel, zagrożenie i podstawę proceduralną.', ['przeszukanie', 'pokój', 'kontrola rzeczy']),
    item('substancje-dokumentacja', 'Jak dokumentować zdarzenie z substancją?', 'Opisz fakty: data, godzina, miejsce, objawy, znaleziony przedmiot, świadkowie, powiadomienia, zabezpieczenia, decyzje i dalsze zalecenia.', 'Nie wpisuj, że substancja jest narkotykiem, jeśli nie została potwierdzona.', ['dokumentacja substancji', 'notatka', 'objawy'])
  ]),

  category('przymus-monitoring', 'Środki przymusu, kontrola i monitoring', [sources.bezpieczenstwo, sources.nieletni, sources.internal], [
    item('przymus-jako-kara', 'Czy środek przymusu można stosować jako karę?', 'Nie. Środki przymusu bezpośredniego nie są karą. Mogą być stosowane tylko w granicach prawa, w ostateczności, proporcjonalnie do zagrożenia i z dokumentacją.', 'Zawsze wskazuj bezpieczeństwo, proporcjonalność i dokumentację.', ['środek przymusu', 'kara', 'proporcjonalność']),
    item('kiedy-przymus', 'Kiedy można rozważyć środek przymusu bezpośredniego?', 'Tylko gdy istnieje realne zagrożenie i łagodniejsze sposoby są nieskuteczne lub niemożliwe. Decyzja musi być zgodna z przepisami i procedurą MOW.', 'Dopytaj o zagrożenie i działania podjęte wcześniej.', ['przymus', 'zagrożenie', 'ostateczność']),
    item('dokumentacja-przymusu', 'Co dokumentować po użyciu środka przymusu?', 'Czas, miejsce, przyczynę, zastosowany środek, osoby obecne, przebieg, stan wychowanka, powiadomienia, ewentualną pomoc medyczną i dalsze decyzje.', 'Nie pomijaj pouczeń i wymaganych powiadomień.', ['protokół', 'przymus', 'dokumentacja']),
    item('monitoring-mow', 'Czy MOW może stosować monitoring?', 'Tak, w celu zapewnienia bezpieczeństwa i porządku, z ograniczeniami wynikającymi z ustawy i ochrony prywatności.', 'Wskaż art. 121 ustawy o wspieraniu i resocjalizacji nieletnich.', ['monitoring', 'kamera', 'art 121']),
    item('monitoring-sypialnie', 'Czy monitoring może obejmować pomieszczenia sypialne?', 'Ustawa wskazuje ograniczenia monitoringu, w tym zakaz obejmowania pomieszczeń sypialnych w MOW. Trzeba stosować aktualne przepisy i dokumentację.', 'Nie uzasadniaj monitoringu wygodą organizacyjną.', ['sypialnia', 'monitoring', 'prywatność']),
    item('zapis-monitoringu', 'Jak długo przechowuje się zapis monitoringu?', 'Okres zależy od rodzaju miejsca i sytuacji. Ustawa określa minimalne i maksymalne okresy, a przy wydarzeniu nadzwyczajnym lub przymusie zapis utrwala się w aktach zgodnie z przepisami.', 'Nie podawaj jednej liczby bez ustalenia rodzaju monitorowanego miejsca.', ['zapis monitoringu', 'przechowywanie', 'wydarzenie nadzwyczajne']),
    item('kontrola-osobista', 'Kiedy możliwa jest kontrola osobista wychowanka?', 'Tylko w uzasadnionych przypadkach i w trybie przewidzianym ustawą oraz procedurą. Wymaga poszanowania godności, proporcjonalności i dokumentacji.', 'Nie myl kontroli osobistej z rutynowym sprawdzeniem porządkowym.', ['kontrola osobista', 'godność', 'procedura']),
    item('kontrola-pobiezna', 'Czym różni się kontrola pobieżna od osobistej?', 'Kontrola pobieżna jest mniej ingerująca, a osobista wymaga szczególnych podstaw i trybu. Odpowiedź musi odsyłać do ustawy i procedury MOW.', 'Dopytaj, jaki był cel kontroli.', ['kontrola pobieżna', 'kontrola osobista']),
    item('zazalenie-przymus', 'Czy wychowanek może złożyć zażalenie na czynności naruszające prawa?', 'Tak. Ustawa przewiduje prawo do zażalenia na czynności naruszające prawa oraz skarg i wniosków.', 'Wskaż art. 107 i właściwą procedurę.', ['zażalenie', 'naruszenie praw', 'skarga']),
    item('pouczenie-po-czynnosci', 'Czy trzeba pouczyć wychowanka o prawach po czynnościach ingerujących?', 'W wielu sytuacjach przepisy wymagają pouczenia o prawie, terminie i sposobie złożenia środka zaskarżenia. Trzeba sprawdzić konkretną czynność.', 'Nie pomijaj prawa do informacji.', ['pouczenie', 'prawo', 'termin'])
  ]),

  category('dokumentacja', 'Dokumentowanie zdarzeń i opinie', [sources.dokumentacja, sources.internal], [
    item('notatka-fakty', 'Jak pisać notatkę ze zdarzenia?', 'Opisuj fakty: data, godzina, miejsce, osoby, przebieg, reakcja wychowawcy, świadkowie, powiadomienia, zabezpieczenia i dalsze zalecenia.', 'Unikaj etykiet i ocen bez podstawy.', ['notatka', 'fakty', 'zdarzenie']),
    item('notatka-nie-oceny', 'Czego unikać w notatce służbowej?', 'Unikaj domysłów, obraźliwych określeń, diagnoz medycznych bez podstawy i przypisywania winy bez ustalonych faktów.', 'Oddziel obserwację od interpretacji.', ['notatka', 'domysły', 'oceny']),
    item('opinia-do-sadu', 'Jak przygotować opinię do sądu?', 'Opinia powinna wynikać z dokumentacji, obserwacji i faktów: funkcjonowanie wychowanka, postępy, trudności, relacje, obowiązki, ryzyka i wnioski wychowawcze.', 'Nie wpisuj danych zbędnych ani niesprawdzonych.', ['opinia do sądu', 'sąd rodzinny', 'funkcjonowanie']),
    item('opinia-semestralna', 'Co powinna zawierać opinia semestralna?', 'Opis funkcjonowania w okresie, zachowania, edukacji, relacji, przestrzegania zasad, pracy wychowawczej, postępów i zaleceń. Treść musi być oparta na faktach.', 'Dostosuj do wzoru MOW.', ['opinia semestralna', 'semestr', 'zalecenia']),
    item('wniosek-urlopowy-wzor', 'Jak używać wzoru wniosku urlopowego?', 'Wzór jest pomocą formalną. Należy uzupełnić go zgodnie z aktualną procedurą, sytuacją wychowanka, terminem, miejscem pobytu i wymaganymi zgodami.', 'Nie traktuj wzoru jako automatycznej zgody.', ['wniosek urlopowy', 'wzór', 'zgoda']),
    item('dokumentowanie-powiadomien', 'Jak dokumentować powiadomienia rodzica, dyrektora albo służb?', 'Zapisz datę, godzinę, osobę powiadomioną, formę kontaktu, krótki zakres informacji i dalsze ustalenia.', 'Nie ujawniaj więcej danych niż potrzeba.', ['powiadomienie', 'telefon', 'rodzic']),
    item('zalaczniki-do-notatki', 'Kiedy dołączać załączniki do dokumentacji?', 'Gdy potwierdzają zdarzenie lub decyzję i są zgodne z procedurą: zdjęcie szkody, skan dokumentu, wydruk wiadomości, protokół, lista obecności.', 'Nie dołączaj materiałów naruszających prywatność bez podstawy.', ['załącznik', 'dokumentacja', 'zdjęcie']),
    item('korekta-notatki', 'Co zrobić, gdy w notatce jest błąd?', 'Nie usuwaj śladów istotnej dokumentacji. Skoryguj zgodnie z zasadami prowadzenia dokumentacji, najlepiej przez dopisek/korektę z datą i podpisem.', 'Dopytaj, czy dokument jest papierowy czy elektroniczny.', ['korekta', 'błąd w notatce', 'dopisanie']),
    item('chronologia', 'Dlaczego chronologia w dokumentacji jest ważna?', 'Chronologia pozwala odtworzyć przebieg zdarzeń, decyzji i powiadomień. Jest kluczowa przy kontroli, sprawie sądowej i ocenie działań wychowawczych.', 'Zachęcaj do zapisywania godzin.', ['chronologia', 'godziny', 'przebieg']),
    item('minimalizacja-danych', 'Jak ograniczać dane osobowe w dokumentacji roboczej?', 'W dokumentach roboczych i pytaniach do AI używaj tylko danych potrzebnych do sprawy. Do AI najlepiej wpisywać inicjały, grupę i opis bez PESEL, adresu i danych medycznych.', 'Pełne dane zostają w oficjalnej dokumentacji placówki, nie w czacie AI.', ['dane osobowe', 'PESEL', 'AI'])
  ]),

  category('stopnie', 'Stopnie uspołecznienia', [sources.internal], [
    item('ocena-stopnia', 'Jak ocenić stopień uspołecznienia wychowanka?', 'Trzeba odwołać się do regulaminu stopni MOW i konkretnych zachowań, a nie do ogólnego wrażenia. AI powinno dopytać o fakty.', 'Nie przyznawaj stopnia bez opisu zachowania.', ['stopień', 'uspołecznienie', 'kwalifikacja']),
    item('brak-danych-stopien', 'Czy AI może przyznać stopień bez opisu zachowań?', 'Nie. Powinno dopytać o zachowanie, obowiązki, relacje, naruszenia zasad, frekwencję, współpracę i aktualny stopień.', 'Wskaż, że decyzja należy do wychowawców zgodnie z regulaminem.', ['brak danych', 'stopień', 'dopytaj']),
    item('stopien-minus-dwa', 'Kiedy rozważa się stopień -2?', 'W regulaminie MOW stopnie ujemne wiążą się z poważnymi naruszeniami. Trzeba sprawdzić konkretny zapis regulaminu i okoliczności zdarzenia.', 'Nie kwalifikuj automatycznie bez dokumentów.', ['-2', 'minus dwa', 'poważne naruszenie']),
    item('stopien-minus-jeden', 'Kiedy rozważa się stopień -1?', 'Stopień -1 może wynikać z określonych naruszeń regulaminu, ale wymaga odniesienia do aktualnego regulaminu stopni i udokumentowanych faktów.', 'Dopytaj o rodzaj naruszenia.', ['-1', 'minus jeden', 'naruszenie']),
    item('stopien-zero', 'Co oznacza stopień zerowy?', 'Stopień zerowy należy interpretować według regulaminu stopni, w tym zasad adaptacji i aktualnej kwalifikacji wychowanka.', 'Nie zakładaj automatycznie awansu po czasie bez oceny zachowania.', ['zero', 'adaptacja', '0']),
    item('stopien-plus-jeden', 'Jak oceniać możliwość stopnia +1?', 'Trzeba sprawdzić kryteria pozytywne w regulaminie: przestrzeganie zasad, obowiązki, relacje, praca nad sobą i stabilność zachowania.', 'Dopytaj o przykłady zachowań.', ['+1', 'plus jeden', 'awans']),
    item('stopien-plus-dwa', 'Jak oceniać możliwość stopnia +2?', 'Stopień +2 wymaga spełnienia wyższych kryteriów regulaminowych i stabilnego funkcjonowania. Odpowiedź musi wskazać, czego brakuje do oceny.', 'Nie obiecuj przywilejów bez regulaminu.', ['+2', 'plus dwa', 'przywileje']),
    item('spadek-stopnia', 'Czy po zdarzeniu stopień spada automatycznie?', 'Tylko jeśli tak wynika z regulaminu stopni i konkretnego zdarzenia. Trzeba odróżnić automatyczny spadek od decyzji oceniającej.', 'Dopytaj o zdarzenie i aktualny stopień.', ['spadek stopnia', 'automatyczny', 'regulamin']),
    item('awans-o-dwa', 'Czy można awansować o dwa stopnie?', 'Zależy od regulaminu i wyjątkowych okoliczności. Zasadę trzeba sprawdzić w regulaminie stopni i dokumentacji wychowanka.', 'Nie stosuj wyjątków jako reguły.', ['awans o dwa', 'dwa stopnie', 'wyjątek']),
    item('stopnie-a-telefony', 'Czy stopień wpływa na prawo do telefonu?', 'Może wpływać, jeśli tak stanowi regulamin lub aktualne zarządzenie dyrektora. Trzeba sprawdzić obowiązujące zasady, daty i ewentualne zmiany czasowe.', 'Uwzględnij najnowsze zarządzenie.', ['telefon', 'stopień', 'przywileje'])
  ]),

  category('standardy-ochrony', 'Standardy ochrony małoletnich i dane', [sources.internal], [
    item('standardy-zgloszenie', 'Co zrobić przy podejrzeniu krzywdzenia wychowanka?', 'Zabezpiecz wychowanka, niezwłocznie zastosuj standardy ochrony małoletnich MOW, powiadom właściwe osoby i dokumentuj fakty.', 'Nie prowadź samodzielnego śledztwa.', ['krzywdzenie', 'standardy ochrony', 'małoletni']),
    item('rozmowa-krzywdzenie', 'Jak rozmawiać z wychowankiem zgłaszającym krzywdzenie?', 'Zapewnij bezpieczeństwo, wysłuchaj spokojnie, nie obiecuj tajemnicy absolutnej, nie sugeruj odpowiedzi i przekaż sprawę zgodnie ze standardami.', 'Nie przesłuchuj jak organ ścigania.', ['rozmowa', 'krzywdzenie', 'tajemnica']),
    item('dane-w-ai', 'Jakie dane można wpisać do AI?', 'Do AI wpisuj tylko dane niezbędne i zanonimizowane: inicjały, grupa, opis sytuacji. Nie wpisuj PESEL, adresu, danych medycznych ani pełnej identyfikacji.', 'To zasada bezpieczeństwa aplikacji.', ['AI', 'dane', 'anonimizacja']),
    item('zdjecia-wychowanka', 'Czy można wrzucić zdjęcie wychowanka do AI?', 'Nie należy wrzucać zdjęć identyfikujących wychowanka do zewnętrznego AI bez wyraźnej podstawy i zgody zgodnej z procedurami. Lepiej opisać sytuację tekstowo.', 'Chroń wizerunek i dane.', ['zdjęcie', 'wizerunek', 'AI']),
    item('tajemnica-sluzbowa', 'Czy informacje z MOW można omawiać w czacie AI?', 'Tylko w zakresie zanonimizowanym i niezbędnym. Dane służbowe i wrażliwe powinny pozostać w oficjalnych systemach placówki.', 'Przypomnij o minimalizacji danych.', ['tajemnica', 'dane służbowe', 'czat']),
    item('rodzic-pyta-o-innego', 'Co jeśli rodzic pyta o innego wychowanka?', 'Nie udzielaj informacji o innym wychowanku. Przekaż ogólną informację o procedurze i skieruj sprawę do osoby uprawnionej.', 'Chroń dane osobowe i prywatność.', ['rodzic', 'inny wychowanek', 'RODO']),
    item('udostepnienie-dokumentacji', 'Kto może otrzymać dokumentację wychowanka?', 'Tylko osoby i organy uprawnione zgodnie z przepisami i procedurą MOW. Wychowawca powinien kierować sprawę przez dyrektora lub wyznaczony tryb.', 'Nie wysyłaj dokumentów prywatnymi kanałami.', ['udostępnienie', 'dokumentacja', 'uprawniony']),
    item('mail-z-danymi', 'Czy można wysłać dokument z danymi wychowanka zwykłym mailem?', 'Należy stosować bezpieczne kanały i procedury placówki. Zwykły mail może być ryzykowny, szczególnie przy danych wrażliwych.', 'Dopytaj o odbiorcę, podstawę i zabezpieczenie.', ['mail', 'dane osobowe', 'załącznik']),
    item('notatki-prywatne', 'Czy prywatny notatnik wychowawcy może zawierać pełne dane?', 'Notatki robocze też powinny być zabezpieczone i ograniczone do niezbędnych informacji. Aplikacja lokalna może przechowywać dane na urządzeniu, więc trzeba robić kopie i uważać na cudze urządzenia.', 'Przypomnij o kopii i czyszczeniu urządzenia.', ['notatnik', 'localStorage', 'dane']),
    item('naruszenie-danych', 'Co zrobić przy podejrzeniu naruszenia danych?', 'Zabezpiecz dane, niezwłocznie powiadom przełożonego lub osobę odpowiedzialną za ochronę danych w placówce i udokumentuj okoliczności.', 'Nie próbuj samodzielnie ukrywać incydentu.', ['naruszenie danych', 'wyciek', 'RODO'])
  ]),

  category('ppp-edukacja', 'Pomoc psychologiczno-pedagogiczna i edukacja', [sources.ppp, sources.oswiata, sources.internal], [
    item('pomoc-ppp', 'Kiedy kierować wychowanka do pomocy psychologiczno-pedagogicznej?', 'Gdy obserwacje, dokumentacja lub sytuacja wychowanka wskazują na potrzebę wsparcia edukacyjnego, emocjonalnego, terapeutycznego lub wychowawczego.', 'Współpracuj ze specjalistami MOW.', ['PPP', 'psycholog', 'pedagog']),
    item('ipet', 'Czy wychowawca powinien znać IPET wychowanka?', 'W zakresie potrzebnym do pracy wychowawczej tak, z zachowaniem zasad dostępu do dokumentacji i poufności. Działania powinny być zgodne z zaleceniami zespołu.', 'Nie kopiuj danych wrażliwych do AI.', ['IPET', 'zalecenia', 'dostosowania']),
    item('wopfu', 'Do czego służy WOPFU?', 'WOPFU pomaga opisać poziom funkcjonowania wychowanka i potrzeby wsparcia. W praktyce powinien opierać się na obserwacji, dokumentacji i współpracy specjalistów.', 'Nie traktuj WOPFU jako jednorazowej formalności.', ['WOPFU', 'funkcjonowanie', 'diagnoza']),
    item('trudnosci-w-nauce', 'Co zrobić, gdy wychowanek ma trudności w nauce?', 'Zbierz informacje od szkoły, wychowawców i specjalistów, sprawdź dokumentację i zaplanuj wsparcie zgodnie z PPP i organizacją MOW.', 'Nie oceniaj wyłącznie przez pryzmat zachowania.', ['nauka', 'trudności', 'wsparcie']),
    item('odmowa-udzialu-w-zajeciach', 'Jak reagować na odmowę udziału w zajęciach?', 'Ustal przyczynę, zabezpiecz realizację obowiązków, zastosuj procedury i dokumentuj fakty. W razie powtarzalności włącz specjalistów.', 'Nie redukuj sprawy wyłącznie do kary.', ['odmowa zajęć', 'lekcje', 'obowiązek']),
    item('praktyczna-nauka-zawodu', 'Jak traktować praktyczną naukę zawodu poza osrodkiem?', 'Art. 180 przewiduje czasowe opuszczanie MOW w związku z praktyczną nauką zawodu. Wymaga to organizacji, nadzoru i dokumentacji.', 'Sprawdź decyzje i plan praktyk.', ['praktyczna nauka zawodu', 'praktyki', 'poza MOW']),
    item('szkola-poza-osrodkiem', 'Czy wychowanek może chodzić do szkoły poza MOW?', 'Może w przypadkach przewidzianych prawem i za zgodą sędziego rodzinnego, zgodnie z art. 180 ustawy.', 'Dopytaj o decyzję sądu i organizację dowozu/nadzoru.', ['szkoła poza', 'art 180', 'zgoda sędziego']),
    item('frekwencja', 'Jak dokumentować problemy z frekwencją wychowanka?', 'Dokumentuj daty, godziny, przyczyny, rozmowy, powiadomienia i działania wspierające. Połącz informacje szkoły, internatu i specjalistów.', 'Nie wpisuj nieusprawiedliwienia bez sprawdzenia faktów.', ['frekwencja', 'nieobecność', 'lekcje']),
    item('dostosowania', 'Czy wychowawca musi stosować dostosowania?', 'Jeżeli wynikają z dokumentacji i zaleceń, należy je uwzględniać w pracy wychowawczej w zakresie swojej roli i możliwości organizacyjnych.', 'Dopytaj, jakie dostosowanie i z jakiego dokumentu wynika.', ['dostosowania', 'zalecenia', 'orzeczenie']),
    item('wspolpraca-szkola-internat', 'Jak łączyć informacje szkoły i internatu?', 'Wymiana informacji powinna służyć spójnej pracy wychowawczej i edukacyjnej, z zachowaniem zasad poufności i dokumentowania ustaleń.', 'Nie przekazuj danych osobom nieuprawnionym.', ['szkoła', 'internat', 'współpraca'])
  ]),

  category('komunikaty-zmiany', 'Zarządzenia, komunikaty i zmiany czasowe', [sources.internal], [
    item('nowsze-zarzadzenie', 'Co jeśli nowsze zarządzenie dyrektora zmienia starą procedurę?', 'Stosuj aktualny, obowiązujący wpis w okresie jego obowiązywania, o ile nie narusza prawa wyższego rzędu. Wskaż konflikt i źródło.', 'Uwzględnij datę dokumentu i datę obowiązywania.', ['zarządzenie', 'nowsze', 'procedura']),
    item('zmiana-czasowa', 'Jak interpretować zmianę czasową?', 'Zmiana czasowa obowiązuje tylko w podanym okresie i zakresie. Po upływie daty końcowej wraca zasada stała, chyba że pojawiło się nowsze zarządzenie.', 'Zawsze sprawdź validFrom i validTo.', ['zmiana czasowa', 'obowiązuje do', 'wakacje']),
    item('wygasla-zmiana', 'Czy wygasłą zmianę stosować dziś?', 'Nie. Wygasłą zmianę można stosować tylko do pytań o przeszłość lub analizę historyczną.', 'Wskaż, że aktualność jest kluczowa.', ['wygasła', 'archiwalna', 'przeszłość']),
    item('email-dyrektora', 'Jak traktować e-mail od dyrektora internatu?', 'Jako bieżącą informację organizacyjną lub polecenie w zakresie pracy placówki, ale interpretowaną w granicach prawa i dokumentów MOW.', 'Nie traktuj e-maila jako aktu prawnego.', ['email', 'dyrektor internatu', 'komunikat']),
    item('zalacznik-email', 'Co zrobić z ważnym załącznikiem z wiadomości dyrektora?', 'Jeżeli załącznik zawiera wzór, plan lub zmianę organizacyjną, zapisz go w archiwum informacji albo bazie wiedzy i opisz datę oraz źródło.', 'Nie mieszaj grafiku dyżurów z komunikatami organizacyjnymi.', ['załącznik', 'poczta', 'wzór']),
    item('termin-z-komunikatu', 'Jak interpretować termin z komunikatu dyrektora?', 'Wyodrębnij datę, godzinę, miejsce, adresatów, zadanie i konsekwencję. Jeżeli termin dotyczy pracy użytkownika, można zasugerować dodanie do kalendarza.', 'Dopytaj, jeśli brakuje godziny lub miejsca.', ['termin', 'data', 'komunikat']),
    item('sprzeczne-komunikaty', 'Co jeśli dwa komunikaty dyrektora są sprzeczne?', 'Zastosuj nowszy lub wyraźnie aktualizujący komunikat. Jeśli konflikt pozostaje, wskaż potrzebę potwierdzenia u dyrektora.', 'Nie wybieraj dowolnie wygodniejszej wersji.', ['sprzeczne', 'komunikaty', 'nowszy']),
    item('baza-lokalna-centralna', 'Co jeśli wpis lokalny jest sprzeczny z centralną bazą?', 'Wskaż konflikt. Przy tej samej dacie i statusie stosuj wpis centralny, chyba że użytkownik pyta o materiał roboczy.', 'To zasada bazy wiedzy aplikacji.', ['lokalny wpis', 'centralna baza', 'konflikt']),
    item('dodanie-wzoru', 'Jak dodać wzór dokumentu do bazy?', 'Wprowadź typ, tytuł, źródło, datę dokumentu, treść lub plik oraz opis, kiedy wzór stosować. Wzór jest pomocą, nie zastępuje oceny wychowawcy.', 'Dodaj słowa-klucze i datę wersji.', ['wzór', 'baza wiedzy', 'dokument']),
    item('zatwierdzenie-zmiany', 'Czy każda lokalna notatka może zmienić procedurę?', 'Nie. Zmiana procedury powinna wynikać z zatwierdzonego dokumentu, zarządzenia lub wpisu administratora. Lokalna notatka może być tylko materiałem roboczym.', 'Oddziel wiedzę roboczą od zatwierdzonej.', ['zatwierdzenie', 'administrator', 'procedura'])
  ]),

  category('harmonogram', 'Harmonogram pracy i kalendarz', [sources.internal, sources.praca], [
    item('pobranie-harmonogramu', 'Co zrobić, gdy harmonogram nie pobiera się?', 'Sprawdź adres Apps Script /exec, VIEW_TOKEN lub ADMIN_TOKEN, połączenie z Renderem i komunikat błędu. Jeśli pobieranie idzie przez Render, CORS nie powinien blokować aplikacji.', 'Nie zmieniaj tokenów bez potrzeby.', ['harmonogram', 'failed to fetch', 'token']),
    item('kolejne-tygodnie', 'Dlaczego nie widać kolejnego tygodnia planu?', 'Generator musi zwracać wszystkie dostępne tygodnie i aktualne wdrożenie Apps Script. Po zmianie Code.gs trzeba wykonać nowe wdrożenie.', 'Przypomnij o wdrożeniu Apps Script.', ['kolejny tydzień', 'Code.gs', 'wdrożenie']),
    item('dyzur-nocny-podzial', 'Jak interpretować dyżur nocny przechodzący przez północ?', 'Dyżur nocny należy rozdzielić na część 22:00-24:00 w dniu rozpoczęcia i 00:00-06:00 w dniu następnym, żeby kalendarz i widok były intuicyjne.', 'Sprawdź datę rozpoczęcia nocy.', ['dyżur nocny', '22:00', '00:00', '06:00']),
    item('kalendarz-google-noc', 'Co jeśli kalendarz Google pokazuje noc w złym dniu?', 'Trzeba poprawić logikę eksportu do kalendarza, nie sam widok aplikacji. Noc ma zaczynać się w dniu rozpoczęcia o 22:00 i kończyć następnego dnia o 06:00.', 'Wskaż test na tygodniu wakacyjnym.', ['Google Calendar', 'noc', 'zły dzień']),
    item('grafik-wakacyjny', 'Czy grafik wakacyjny może mieć inny układ?', 'Tak. Parser musi rozpoznawać także układy wakacyjne, a nie tylko standardowy format. W razie błędu trzeba porównać oryginalny plik i interpretację.', 'Nie zakładaj identycznej tabeli przez cały rok.', ['wakacje', 'grafik wakacyjny', 'parser']),
    item('nadgodziny-z-harmonogramu', 'Czy aplikacja może obliczać nadgodziny z harmonogramu?', 'Może obliczać robocze podsumowanie godzin, ale rozliczenie kadrowe wymaga przepisów, regulaminu, arkusza organizacji i ewidencji.', 'Nie traktuj wyliczenia aplikacji jako decyzji płacowej.', ['nadgodziny', 'podsumowanie godzin', 'harmonogram']),
    item('zastepstwo', 'Jak odczytywać zastępstwo w harmonogramie?', 'Należy odróżnić osobę zastępowaną od osoby zastępującej i zapisać to w opisie dyżuru. W razie wątpliwości pytaj o oryginalny wpis.', 'Nie zamieniaj pól „zmieniam” i „zmienia mnie”.', ['zastępstwo', 'zmieniam', 'zmienia mnie']),
    item('screen-harmonogramu', 'Czy screen harmonogramu może być użyty w aplikacji?', 'Tak, jako podgląd i materiał pomocniczy. Automatyczna interpretacja screena wymaga OCR lub ręcznego przepisania, więc wynik trzeba sprawdzić.', 'Nie traktuj obrazu jako w pełni odczytanego bez OCR.', ['screen', 'zdjęcie', 'harmonogram']),
    item('zapytaj-ai-o-plan', 'Jak pytać AI o plan tygodniowy?', 'Najlepiej podać nazwisko, tydzień, zakres dat i konkretny cel: godziny, weekend, noc, zastępstwa albo konflikt w kalendarzu.', 'Jeśli plan nie jest wczytany, AI powinno o tym powiedzieć.', ['plan tygodniowy', 'AI', 'godziny']),
    item('tokeny-harmonogramu', 'Czy testerzy muszą znać token harmonogramu?', 'Nie. Tester powinien korzystać z bezpiecznego linku lub backendu, który ukrywa tokeny i daje tylko podgląd potrzebnych funkcji.', 'Nigdy nie ujawniaj ADMIN_TOKEN testerom.', ['tester', 'VIEW_TOKEN', 'ADMIN_TOKEN'])
  ]),

  category('biezace-info', 'Bieżące informacje i poczta dyrektora', [sources.internal], [
    item('synchronizacja-poczty', 'Co zrobić, gdy aplikacja nie pobiera poczty?', 'Sprawdź host IMAP, użytkownika, hasło aplikacyjne, token synchronizacji i log z Rendera. Dla Gmaila wymagane jest hasło aplikacyjne i imap.gmail.com.', 'Nie wpisuj zwykłego hasła, jeśli konto wymaga hasła aplikacyjnego.', ['poczta', 'IMAP', 'Gmail']),
    item('kolejnosc-wiadomosci', 'Jak powinny być układane wiadomości od dyrektora?', 'Najnowsze wiadomości powinny być na górze, starsze niżej, z możliwością filtrowania i usuwania niepotrzebnych wpisów lokalnie.', 'Ważna jest data wiadomości, nie data synchronizacji.', ['wiadomości', 'najnowsze', 'archiwum']),
    item('harmonogramy-w-poczcie', 'Czy harmonogramy pracy trafiają do bieżących informacji?', 'Nie. Harmonogramy powinny być pomijane w archiwum bieżących informacji i obsługiwane przez moduł Harmonogram.', 'Nie mieszaj grafików z komunikatami.', ['grafik', 'harmonogram', 'poczta']),
    item('zalaczniki-poczta', 'Jak pobrać załącznik z wiadomości?', 'Aplikacja powinna umożliwiać otwarcie i pobranie wybranego załącznika. Załącznik istotny organizacyjnie można dodać do bazy wiedzy lub dokumentów.', 'Nie pobieraj automatycznie wszystkiego bez potrzeby.', ['załącznik', 'otwórz', 'pobierz']),
    item('terminy-do-kalendarza', 'Czy informacje od dyrektora można dodawać do kalendarza?', 'Tak, jeśli wiadomość zawiera datę, godzinę, miejsce i zadanie. Najpierw trzeba rozpoznać termin i umożliwić potwierdzenie przed dodaniem.', 'Nie dodawaj niepewnych terminów bez akceptacji.', ['kalendarz', 'termin', 'rada pedagogiczna']),
    item('zadanie-z-komunikatu', 'Jak rozpoznać zadanie w komunikacie?', 'Szukaj czasowników: proszę przygotować, dostarczyć, wysłać, uzupełnić, zgłosić się. Wyodrębnij adresata, termin i dokument.', 'Jeśli nie wiadomo, kogo dotyczy, dopytaj.', ['zadanie', 'proszę', 'termin']),
    item('temat-wiadomosci', 'Jak nadawać temat wiadomości w archiwum?', 'Najlepiej krótko: data, hasło sprawy i zakres, np. „2026-02-02 sprawozdania I semestr”. Treść pełna zostaje w rozwinięciu.', 'Nie używaj samego „informacja”.', ['temat', 'tytuł', 'archiwum']),
    item('usuniecie-wiadomosci', 'Czy użytkownik może usunąć wiadomość z archiwum?', 'Tak lokalnie, jeśli uzna ją za nieistotną. Usunięcie z urządzenia nie powinno usuwać oryginału z poczty.', 'Ostrzeż przy danych ważnych organizacyjnie.', ['kosz', 'usuń', 'wiadomość']),
    item('informacja-jako-zmiana', 'Kiedy wiadomość dyrektora staje się zmianą czasową?', 'Gdy zawiera wyraźną zasadę obowiązującą w określonym czasie, np. telefony w ferie. Wtedy warto dodać ją do bazy wiedzy z datą od-do.', 'Oddziel zwykły komunikat od zarządzenia.', ['zmiana czasowa', 'ferie', 'telefony']),
    item('poufne-wiadomosci', 'Jak traktować poufne wiadomości z poczty?', 'Nie przekazuj ich do AI w pełnej treści, jeśli zawierają dane osobowe lub wrażliwe. Stosuj streszczenie i anonimizację.', 'Chroń dane z poczty.', ['poufne', 'wiadomość', 'dane osobowe'])
  ]),

  category('telefony-urzadzenia', 'Telefony, urządzenia i przywileje', [sources.internal, sources.nieletni], [
    item('telefon-zasada-ogolna', 'Kiedy wychowanek może korzystać z telefonu?', 'Zgodnie z regulaminem MOW, stopniem uspołecznienia i aktualnymi zarządzeniami dyrektora. Trzeba sprawdzić, czy nie obowiązuje zmiana czasowa.', 'Nie podawaj godzin bez aktualnego regulaminu.', ['telefon', 'godziny telefonów', 'regulamin']),
    item('telefony-wakacje', 'Co jeśli dyrektor zarządził dodatkowy czas telefonów w wakacje?', 'Stosuj zarządzenie tylko w okresie i zakresie, którego dotyczy. Po wakacjach wraca zasada stała albo nowsze zarządzenie.', 'Sprawdź daty obowiązywania.', ['wakacje', 'dodatkowy czas', 'telefon']),
    item('telefon-stopien-plus', 'Czy stopień +1 albo +2 może dawać dodatkowy telefon?', 'Może, jeżeli wynika to z regulaminu lub aktualnego zarządzenia. Odpowiedź musi wskazać źródło i datę obowiązywania.', 'Nie zakładaj przywileju bez wpisu w bazie.', ['+1', '+2', 'telefon']),
    item('laptop-wychowanka', 'Czy laptop wychowanka traktować jak telefon?', 'Jeżeli aktualny komunikat lub regulamin tak stanowi, korzystanie z laptopa może być powiązane z godzinami telefonów. Trzeba sprawdzić najnowszy komunikat.', 'Nie uogólniaj na wszystkie urządzenia bez podstawy.', ['laptop', 'urządzenie', 'telefon']),
    item('sluchawki-polaczone-z-telefonem', 'Co zrobić, gdy wychowanek korzysta ze słuchawek połączonych z telefonem?', 'Jeśli omija to zasady korzystania z telefonu, zastosuj regulamin i aktualne polecenia dyrekcji, zabezpiecz sytuację i odnotuj fakt.', 'Nie przeglądaj prywatnych treści urządzenia bez podstawy.', ['słuchawki', 'telefon', 'bluetooth']),
    item('zabezpieczenie-telefonu', 'Jak zabezpieczyć telefon użyty niezgodnie z zasadami?', 'Postępuj według regulaminu: odnotuj fakt, zabezpiecz urządzenie w przewidzianym miejscu i poinformuj przełożonego, jeśli wymaga tego procedura.', 'Nie pozostawiaj urządzenia bez kontroli.', ['zabezpieczyć telefon', 'depozyt', 'regulamin']),
    item('telefon-a-kontakt-z-rodzina', 'Czy ograniczenie telefonu narusza prawo kontaktu z rodziną?', 'Samo regulaminowe ograniczenie korzystania z telefonu nie musi naruszać prawa kontaktu, jeśli wychowanek ma zapewnione przewidziane prawem i regulaminem formy kontaktu.', 'Sprawdź art. 107 i 115 oraz regulamin.', ['kontakt z rodziną', 'telefon', 'ograniczenie']),
    item('nagrywanie', 'Co zrobić, gdy wychowanek nagrywa innych telefonem?', 'Zabezpiecz sytuację, przerwij naruszenie prywatności, powiadom przełożonego i zastosuj regulamin. Nie przeglądaj materiałów bez podstawy proceduralnej.', 'Chroń dane i wizerunek.', ['nagrywanie', 'film', 'wizerunek']),
    item('telefon-w-kryzysie', 'Czy w sytuacji kryzysowej można odebrać telefon?', 'Można zabezpieczyć przedmiot, jeśli wymaga tego bezpieczeństwo i procedura, ale trzeba działać proporcjonalnie i dokumentować powód.', 'Nie stosuj jako kary bez podstawy.', ['odebrać telefon', 'kryzys', 'bezpieczeństwo']),
    item('zmiana-zasad-telefonow', 'Jak dodać nowe zasady telefonów do aplikacji?', 'Dodaj wpis w bazie wiedzy jako zmianę stałą lub czasową: tytuł, źródło, daty, treść, grupę wychowanków i warunki stosowania.', 'Ustal, czy to zarządzenie czy informacja robocza.', ['baza wiedzy', 'telefony', 'zarządzenie'])
  ]),

  category('wspolpraca-organy', 'Sąd, rodzice, policja i organy', [sources.nieletni, sources.internal], [
    item('kontakt-sad', 'Kiedy kontaktować się z sądem rodzinnym?', 'Gdy wynika to z orzeczenia, przepisów, procedury MOW, decyzji dyrektora lub sytuacji wymagającej informacji sądu. Wychowawca zwykle działa przez ustalony kanał placówki.', 'Nie wysyłaj informacji poza procedurą.', ['sąd rodzinny', 'kontakt', 'orzeczenie']),
    item('informacja-do-sadu', 'Jak przygotować informację do sądu?', 'Oprzyj ją na faktach, dokumentacji, obserwacji, działaniach wychowawczych i wnioskach. Oddziel fakty od oceny.', 'Zastosuj wzór MOW, jeśli istnieje.', ['informacja do sądu', 'opinia', 'fakty']),
    item('rodzice-powiadomienie', 'Kiedy powiadamiać rodziców albo opiekunów?', 'Zgodnie z procedurą MOW, prawami wychowanka i decyzjami sądu. Przy zdarzeniach poważnych lub zdrowotnych powiadomienie zwykle jest wymagane.', 'Sprawdź, kto ma prawo do informacji.', ['rodzice', 'opiekun', 'powiadomienie']),
    item('policja-kiedy', 'Kiedy wzywać Policję?', 'Gdy istnieje zagrożenie, podejrzenie czynu zabronionego, konieczność interwencji albo tak przewiduje procedura. Decyzję dokumentuj i powiadom dyrektora.', 'Nie zwlekaj przy bezpośrednim zagrożeniu.', ['policja', 'czyn karalny', 'interwencja']),
    item('kurator', 'Jak współpracować z kuratorem?', 'Przekazuj informacje w zakresie uprawnienia i potrzeb sprawy, najlepiej przez ustalony tryb placówki. Dokumentuj ustalenia.', 'Nie przekazuj danych osobom nieuprawnionym.', ['kurator', 'współpraca', 'informacja']),
    item('placowka-piecza', 'Co jeśli wychowanek jest z pieczy zastępczej?', 'Przy urlopach, kontaktach i pobycie trzeba uwzględnić właściwą placówkę, rodzinę zastępczą lub prowadzącego rodzinny dom dziecka oraz wymagane porozumienia.', 'Wskaż art. 180 i § 14, jeśli chodzi o urlop.', ['piecza zastępcza', 'rodzina zastępcza', 'urlop']),
    item('organ-prowadzacy', 'Kiedy znaczenie ma organ prowadzący?', 'Przy organizacji placówki, dokumentach, finansowaniu i niektórych zgodach organizacyjnych. W sprawach wychowanka zwykle kluczowe są sąd, dyrektor i dokumenty MOW.', 'Dopytaj, czy chodzi o organizację czy indywidualną sprawę.', ['organ prowadzący', 'powiat', 'organizacja']),
    item('kuratorium-nadzor', 'Kiedy sprawa dotyczy nadzoru pedagogicznego?', 'Gdy chodzi o jakość pracy placówki, dokumentację, realizację zadań edukacyjnych lub kontrolę zgodności działania z prawem oświatowym.', 'Nie kieruj każdej sprawy wychowawczej do kuratorium.', ['kuratorium', 'nadzór pedagogiczny', 'kontrola']),
    item('rzecznik-praw-dziecka', 'Czy wychowanek może kontaktować się z organami ochrony praw?', 'Kontakt z uprawnionymi organami ochrony praw podlega szczególnej ochronie. Ograniczenia kontaktów nie powinny obejmować takich podmiotów w sposób sprzeczny z ustawą.', 'Wskaż art. 115 ust. 3 jako kierunek.', ['RPD', 'RPO', 'organ ochrony praw']),
    item('wspolpraca-wielu-podmiotow', 'Jak koordynować sprawę z wieloma instytucjami?', 'Wyznacz fakty, podstawę prawną, kanał komunikacji, osoby odpowiedzialne i dokumentację. Unikaj równoległych, niespójnych informacji.', 'Działaj przez dyrektora lub wyznaczoną osobę.', ['wiele instytucji', 'koordynacja', 'komunikacja'])
  ]),

  category('zdrowie', 'Zdrowie, leki i pomoc medyczna', [sources.nieletni, sources.internal], [
    item('pogotowie-kiedy', 'Kiedy wzywać pogotowie?', 'Przy zagrożeniu życia lub zdrowia, utracie przytomności, poważnych obrażeniach, zatruciu, próbie samobójczej, ostrych objawach po substancjach lub innych stanach nagłych. Numer 112.', 'Nie czekaj na pełną analizę prawną przy stanie nagłym.', ['pogotowie', '112', 'stan nagły']),
    item('opieka-zdrowotna-prawo', 'Czy wychowanek ma prawo do opieki zdrowotnej?', 'Tak, prawo do świadczeń zdrowotnych wynika z art. 107 ustawy. Organizacja odbywa się według przepisów i procedur placówki.', 'Dopytaj, czy chodzi o nagły stan czy wizytę planową.', ['opieka zdrowotna', 'lekarz', 'art 107']),
    item('leki-podawanie', 'Czy wychowawca może podać lek?', 'To zależy od procedur MOW, upoważnień i zaleceń medycznych. AI nie powinno zalecać podawania leków bez podstawy.', 'W razie wątpliwości skontaktuj się z osobą medyczną lub dyrektorem.', ['podanie leku', 'lekarstwo', 'zalecenia']),
    item('uraz', 'Co zrobić przy urazie wychowanka?', 'Oceń bezpieczeństwo, udziel pierwszej pomocy w zakresie umiejętności, wezwij pomoc medyczną przy poważnym urazie, powiadom dyrektora i dokumentuj.', 'Nie przemieszczaj osoby przy podejrzeniu poważnego urazu bez potrzeby.', ['uraz', 'złamanie', 'rana']),
    item('zatrucie', 'Co zrobić przy podejrzeniu zatrucia?', 'Wezwij pomoc medyczną, zabezpiecz substancję lub opakowanie, nie podawaj niczego bez zaleceń medycznych, powiadom dyrektora i dokumentuj.', 'Numer 112 przy objawach zagrożenia.', ['zatrucie', 'substancja', 'opakowanie']),
    item('choroba-zakazna', 'Co zrobić przy podejrzeniu choroby zakaźnej?', 'Zastosuj procedury sanitarne placówki, ogranicz kontakt, powiadom dyrektora i osoby odpowiedzialne za opiekę zdrowotną.', 'Nie diagnozuj samodzielnie.', ['choroba zakaźna', 'sanitarne', 'izolacja']),
    item('odmowa-leczenia', 'Co jeśli wychowanek odmawia pomocy medycznej?', 'Zabezpiecz sytuację, powiadom dyrektora i osobę medyczną, dokumentuj odmowę i okoliczności. Przy zagrożeniu życia lub zdrowia wezwij 112.', 'Nie zostawiaj sprawy bez reakcji.', ['odmowa leczenia', 'pomoc medyczna', '112']),
    item('dane-medyczne-ai', 'Czy dane medyczne można wpisywać do AI?', 'Nie wpisuj pełnych danych medycznych do AI. Można opisać objawy ogólnie i bez identyfikacji osoby, jeśli potrzebna jest pomoc organizacyjna.', 'W sprawie medycznej kontaktuj się z personelem medycznym.', ['dane medyczne', 'AI', 'objawy']),
    item('ciaza-wychowanki', 'Jak traktować sprawę nieletniej wychowanki w ciąży?', 'Rozporządzenie MEiN przewiduje szczególne wsparcie, wyżywienie, pomoc psychologiczną i opiekę. Sprawa wymaga ścisłej procedury, dyrektora i specjalistów.', 'Nie udzielaj porad medycznych.', ['ciąża', 'nieletnia matka', 'wsparcie']),
    item('sen-i-wypoczynek', 'Czy wychowanek ma prawo do snu i pobytu na świeżym powietrzu?', 'Tak. Art. 107 ustawy przewiduje niezbędny wypoczynek, co najmniej godzinny pobyt na świeżym powietrzu, jeśli warunki pozwalają, i 8 godzin snu.', 'Uwzględnij wyjątki i porządek placówki.', ['sen', 'wypoczynek', 'świeże powietrze'])
  ]),

  category('nieletnie-matki', 'Nieletnie matki i szczególne sytuacje opiekuńcze', [sources.placowki, sources.nieletni, sources.internal], [
    item('nieletnia-matka-wsparcie', 'Jakie wsparcie przysługuje nieletniej matce w MOW?', 'MOW zapewnia szczególne wsparcie w okresie ciąży i po urodzeniu dziecka, w tym wyżywienie dostosowane do potrzeb oraz pomoc psychologiczną.', 'Wskaż § 16 rozporządzenia MEiN.', ['nieletnia matka', 'ciąża', 'dziecko']),
    item('dom-matki-dziecka', 'Czym jest dom dla matki i dziecka w MOW?', 'To szczególna forma organizacji pobytu nieletniej matki i dziecka, wymagająca zawiadomień, dokumentacji i współpracy z sądem oraz specjalistami.', 'Wskaż § 17 i kolejne rozporządzenia.', ['dom matki i dziecka', 'MOW', 'dziecko']),
    item('dziecko-urlop-matki', 'Co z dzieckiem podczas urlopu lub przepustki nieletniej matki?', 'Co do zasady wychowanka będąca nieletnią matką opuszcza dom dla matki i dziecka wraz z dzieckiem, z wyjątkami przewidzianymi w rozporządzeniu.', 'Wskaż § 17 ust. 4.', ['urlop matki', 'dziecko', 'przepustka']),
    item('ucieczka-matki-z-dzieckiem', 'Co jeśli nieletnia matka oddali się z dzieckiem?', 'To sytuacja szczególnego ryzyka. Należy niezwłocznie zastosować procedury, powiadomić dyrektora i właściwe osoby lub organy oraz zabezpieczyć dobro dziecka.', 'Nie zwlekaj z powiadomieniami.', ['ucieczka z dzieckiem', 'nieletnia matka', 'ryzyko']),
    item('dokumentacja-dziecka', 'Jak dokumentować pobyt dziecka wychowanki?', 'Rozporządzenie wymaga dokumentacji związanej z pobytem dziecka. Szczegóły należy prowadzić zgodnie z przepisami i lokalną procedurą.', 'Chroń dane dziecka.', ['dokumentacja dziecka', 'pobyt dziecka']),
    item('opieka-nad-dzieckiem', 'Kto sprawuje opiekę nad dzieckiem wychowanki?', 'Zasady opieki wynikają z rozporządzenia, decyzji dyrektora i sytuacji wychowanki. W szczególnych przypadkach wskazuje się osobę sprawującą opiekę.', 'Dopytaj o okoliczności pobytu.', ['opieka nad dzieckiem', 'wychowanka', 'dom matki']),
    item('zajecia-dla-matki', 'Czy nieletnia matka ma dodatkowe zajęcia?', 'Rozporządzenie przewiduje wsparcie i zajęcia związane z opieką nad dzieckiem oraz budowaniem więzi, zależnie od organizacji placówki.', 'Wskaż rolę specjalistów.', ['zajęcia', 'opieka nad dzieckiem', 'więź']),
    item('sad-opiekunczy', 'Kiedy pojawia się sąd opiekuńczy?', 'W sprawach pobytu dziecka z nieletnią matką i zgód związanych z dzieckiem znaczenie może mieć sąd opiekuńczy. Trzeba sprawdzić decyzje i dokumentację.', 'Nie zastępuj decyzji sądu.', ['sąd opiekuńczy', 'zgoda', 'dziecko']),
    item('dane-dziecka-ai', 'Czy dane dziecka wychowanki można wpisywać do AI?', 'Nie. To dane szczególnie wrażliwe organizacyjnie. Do AI wolno użyć tylko opisu zanonimizowanego i niezbędnego.', 'Chroń dane dziecka i matki.', ['dane dziecka', 'AI', 'anonimizacja']),
    item('specjalna-opieka-matki', 'Jak odpowiadać na pytania o nieletnią matkę bez pełnych danych?', 'Dopytaj o bezpieczne, nieidentyfikujące informacje: czy chodzi o ciążę, pobyt dziecka, urlop, opiekę, dokumentację czy sytuację kryzysową.', 'Nie proś o pełne dane osobowe.', ['nieletnia matka', 'dopytaj', 'bez danych'])
  ]),

  category('bhp-ewakuacja', 'BHP, pożar i ewakuacja', [sources.bezpieczenstwo, sources.internal], [
    item('pozar', 'Co zrobić przy pożarze?', 'Alarmuj, ewakuuj zgodnie z instrukcją, wezwij służby, przelicz wychowanków, powiadom dyrektora i dokumentuj po opanowaniu sytuacji.', 'Priorytetem jest życie i zdrowie.', ['pożar', 'ewakuacja', 'straż']),
    item('ewakuacja-liczenie', 'Dlaczego przy ewakuacji trzeba liczyć wychowanków?', 'Przeliczenie pozwala ustalić, czy wszyscy opuścili zagrożone miejsce. Wynik trzeba przekazać osobie kierującej ewakuacją.', 'Nie wracaj po rzeczy.', ['liczenie', 'ewakuacja', 'wszyscy']),
    item('alarm', 'Co zrobić po usłyszeniu alarmu?', 'Postępuj zgodnie z instrukcją alarmową placówki, zabezpiecz grupę, kieruj do miejsca zbiórki i wykonuj polecenia kierującego akcją.', 'Nie ignoruj alarmu jako ćwiczenia bez potwierdzenia.', ['alarm', 'miejsce zbiórki', 'BHP']),
    item('wypadek', 'Jak dokumentować wypadek wychowanka?', 'Najpierw pomoc i zabezpieczenie, potem powiadomienia i dokumentacja zgodnie z BHP oraz procedurą MOW.', 'Nie opóźniaj pomocy przez dokumenty.', ['wypadek', 'BHP', 'dokumentacja']),
    item('sliskie-schody', 'Co zrobić przy zagrożeniu technicznym w budynku?', 'Zabezpiecz miejsce, ostrzeż osoby, zgłoś dyrektorowi lub właściwej osobie i odnotuj, jeśli zagrożenie wpływa na bezpieczeństwo wychowanków.', 'Nie pozostawiaj zagrożenia bez oznaczenia.', ['schody', 'usterka', 'zagrożenie']),
    item('wyjscie-poza-osrodek', 'Jak przygotować wyjście grupy poza osrodek?', 'Sprawdź zgodę, cel, listę uczestników, opiekę, trasę, ryzyka, kontakt i dokumentację zgodnie z procedurą MOW.', 'Nie wychodź bez wymaganej zgody.', ['wyjście', 'grupa', 'poza osrodek']),
    item('zajecia-sportowe', 'Co sprawdzić przed zajęciami sportowymi?', 'Stan miejsca, sprzęt, liczebność grupy, przeciwwskazania, zasady bezpieczeństwa i nadzór. Zdarzenia dokumentuj.', 'Nie zostawiaj grupy bez nadzoru.', ['sport', 'sala', 'boisko']),
    item('apteczka', 'Jak traktować informację o miejscu apteczki?', 'Jako bieżącą informację organizacyjną ważną dla bezpieczeństwa. Aplikacja powinna zapisać miejsce, datę i źródło komunikatu.', 'Nie zastępuje to procedury pierwszej pomocy.', ['apteczka', 'pierwsza pomoc', 'miejsce']),
    item('zatrucie-zbiorowe', 'Co zrobić przy podejrzeniu zatrucia zbiorowego?', 'Wezwij służby, zabezpiecz osoby i potencjalne źródło, powiadom dyrektora, stosuj procedury sanitarne i dokumentuj listę objawów.', 'Nie czekaj na pełne potwierdzenie laboratoryjne.', ['zatrucie zbiorowe', 'sanitarne', 'objawy']),
    item('cwiczenia-ewakuacyjne', 'Jak dokumentować ćwiczenia ewakuacyjne?', 'Zapisz datę, godzinę, uczestników, przebieg, czas ewakuacji, problemy i wnioski do poprawy.', 'Oddziel ćwiczenie od realnego alarmu.', ['ćwiczenia', 'ewakuacyjne', 'wnioski'])
  ]),

  category('ai-aplikacja', 'Bezpieczeństwo aplikacji, AI i tryb testowy', [sources.internal], [
    item('ai-limit', 'Co zrobić, gdy AI pokazuje limit lub pełne serwery?', 'Użyj przycisku Powtórz później albo skorzystaj z banku odpowiedzi. Limit Gemini nie oznacza awarii aplikacji ani błędu wiedzy.', 'Nie ponawiaj seryjnie wielu pytań.', ['limit AI', 'Gemini', 'pełne serwery']),
    item('bank-odpowiedzi', 'Po co bank odpowiedzi w aplikacji?', 'Bank odpowiedzi pozwala udzielić zatwierdzonej odpowiedzi bez użycia AI, gdy pytanie pasuje do znanej intencji. Ogranicza koszty i ryzyko halucynacji.', 'AI zostaje do pytań nowych lub niepewnych.', ['bank odpowiedzi', 'intencja', 'bez AI']),
    item('dopasowanie-intencji', 'Co jeśli pytanie nie jest zadane dokładnie jak w banku?', 'Router intencji porównuje warianty, słowa-klucze i kontekst. Jeżeli dopasowanie jest wysokie, pokaże odpowiedź; jeżeli nie, użyje AI albo dopyta.', 'Nie wymaga pytania 1:1.', ['dopasowanie', 'intencja', 'wariant']),
    item('odpowiedz-niepasuje', 'Co zrobić, jeśli odpowiedź z banku nie pasuje?', 'Użytkownik powinien doprecyzować pytanie albo użyć AI. Takie pytanie warto później dodać do banku jako nowy wariant.', 'To mechanizm uczenia aplikacji.', ['nie pasuje', 'doprecyzuj', 'wariant']),
    item('testy-regresji', 'Po co testy regresji bazy wiedzy?', 'Testy sprawdzają, czy z bazy nie zniknęły kluczowe odpowiedzi i czy nie wróciły stare błędne podstawy, np. pensum 40 zamiast 24.', 'Każdy błąd praktyczny powinien stać się nowym testem.', ['test regresji', 'pensum', 'błąd AI']),
    item('tryb-testera', 'Co widzi tester aplikacji?', 'Tester powinien mieć dostęp do funkcji użytkowych bez tokenów administracyjnych, kluczy API i możliwości zmiany konfiguracji globalnej.', 'Nie udostępniaj ADMIN_TOKEN.', ['tester', 'bezpieczny link', 'token']),
    item('localstorage-ryzyko', 'Jakie jest ryzyko localStorage?', 'Dane są wygodne, ale lokalne: mogą zniknąć po czyszczeniu przeglądarki i zostać na cudzym urządzeniu. Warto robić kopie i czyścić urządzenia testowe.', 'Nie przechowuj niepotrzebnych danych wrażliwych.', ['localStorage', 'kopia', 'urządzenie']),
    item('aktualizacja-pwa', 'Co zrobić, gdy PWA pokazuje starą wersję?', 'Użyć komunikatu aktualizacji albo odświeżyć aplikację. Service worker może przez chwilę trzymać starsze pliki.', 'Podbijanie cache pomaga wymusić nową wersję.', ['PWA', 'service worker', 'cache']),
    item('zalaczniki-ai', 'Czy można dodawać dokumenty do AI?', 'Tak, ale tylko dokumenty potrzebne i najlepiej pozbawione danych identyfikujących. Wrażliwe pliki powinny być analizowane ostrożnie.', 'Nie wysyłaj pełnych danych wychowanka bez potrzeby.', ['załącznik AI', 'dokument', 'analiza']),
    item('lokalny-model', 'Czy lokalny model AI może zastąpić Gemini?', 'Może być trybem prywatnym lub awaryjnym, ale nadal powinien korzystać z tej samej bazy odpowiedzi i testów. Nie zastępuje zatwierdzonej wiedzy MOW.', 'Najpierw bank odpowiedzi, potem lokalny model.', ['Ollama', 'lokalny model', 'LLM'])
  ]),

  category('resocjalizacja-wychowanie', 'Resocjalizacja, rozmowa wychowawcza i praca z grupą', [sources.nieletni, sources.placowki, sources.internal], [
    item('cel-resocjalizacji', 'Jaki jest główny cel pracy wychowawcy w MOW?', 'Celem jest wspieranie procesu resocjalizacji, bezpieczeństwa, edukacji, rozwoju społecznego i przygotowania wychowanka do odpowiedzialnego funkcjonowania poza ośrodkiem.', 'Odwołaj się do indywidualnego planu, obserwacji i dokumentów MOW.', ['resocjalizacja', 'cel pracy', 'wychowawca MOW']),
    item('rozmowa-po-incydencie', 'Jak przeprowadzić rozmowę po incydencie?', 'Najpierw zadbaj o bezpieczeństwo i fakty, potem oddziel emocje od oceny, nazwij naruszone normy, ustal konsekwencje oraz plan naprawczy.', 'Nie prowadź rozmowy wyłącznie jako kary.', ['rozmowa', 'incydent', 'plan naprawczy']),
    item('kontrakt-wychowawczy', 'Kiedy stosować kontrakt wychowawczy?', 'Kontrakt warto zastosować, gdy trzeba jasno opisać oczekiwane zachowania, wsparcie, konsekwencje i sposób sprawdzania postępów.', 'Kontrakt powinien być konkretny i możliwy do wykonania.', ['kontrakt', 'cele', 'postęp']),
    item('motywowanie-wychowanka', 'Jak motywować wychowanka do zmiany?', 'Łącz wymagania z realnym wsparciem: pokazuj konkretne korzyści, krótkie cele, jasne zasady, informację zwrotną i konsekwencję dorosłych.', 'Dopytaj, czy chodzi o naukę, zachowanie, higienę, relacje czy terapię.', ['motywacja', 'zmiana', 'cele krótkie']),
    item('praca-z-oporem', 'Co zrobić, gdy wychowanek odmawia współpracy?', 'Sprawdź przyczynę odmowy, poziom ryzyka, aktualny stan emocjonalny i wymagania procedury. Daj wybór w granicach zasad, ale nie rezygnuj z obowiązku nadzoru.', 'Nie eskaluj siłowo, jeśli nie ma zagrożenia.', ['odmowa', 'opór', 'współpraca']),
    item('mediacja-konflikt', 'Kiedy proponować mediację między wychowankami?', 'Mediacja ma sens, gdy strony są bezpieczne, rozumieją zasady i chcą szukać rozwiązania. Nie stosuj jej przy świeżej przemocy lub silnym zagrożeniu.', 'Najpierw rozdziel strony i ustal fakty.', ['mediacja', 'konflikt', 'przemoc']),
    item('konsekwencje-wychowawcze', 'Jak dobierać konsekwencje wychowawcze?', 'Konsekwencja powinna wynikać z zachowania, być proporcjonalna, zgodna z regulaminem i nastawiona na naprawę oraz naukę odpowiedzialności.', 'Nie stosuj odpowiedzialności zbiorowej bez podstawy.', ['konsekwencje', 'proporcjonalność', 'regulamin']),
    item('pochwala-wzmocnienie', 'Czy warto dokumentować pozytywne zachowania?', 'Tak. Pozytywne zachowania są ważne dla stopni uspołecznienia, opinii, diagnozy postępów i rozmów motywujących.', 'Zapisuj konkret: data, zachowanie, kontekst, efekt.', ['pochwała', 'pozytywne zachowanie', 'postęp']),
    item('praca-z-grupa', 'Jak reagować, gdy grupa wzmacnia złe zachowanie?', 'Zatrzymaj eskalację, rozdziel liderów presji, nazwij zasadę, wzmocnij zachowania bezpieczne i zaplanuj pracę grupową po opanowaniu sytuacji.', 'Nie zawstydzaj publicznie osoby w kryzysie.', ['grupa', 'presja', 'eskalacja']),
    item('ewaluacja-pracy', 'Jak ocenić, czy działania wychowawcze działają?', 'Porównuj zachowanie w czasie, frekwencję, konflikty, realizację ustaleń, stopnie, opinie specjalistów i reakcję wychowanka na wsparcie.', 'Nie opieraj oceny na jednym incydencie.', ['ewaluacja', 'postępy', 'obserwacja'])
  ]),

  category('wspolpraca-rodzina', 'Współpraca z rodziną, opiekunami i środowiskiem', [sources.nieletni, sources.placowki, sources.internal], [
    item('kontakt-z-rodzina', 'Jak prowadzić kontakt z rodziną wychowanka?', 'Kontakt powinien być rzeczowy, udokumentowany i zgodny z uprawnieniami opiekunów, decyzjami sądu oraz procedurą MOW.', 'Zapisz datę, osobę, temat i ustalenia.', ['rodzina', 'kontakt', 'opiekun']),
    item('trudny-rodzic', 'Co zrobić, gdy rodzic jest agresywny w rozmowie?', 'Zachowaj granice, przenieś rozmowę na ustalony kanał, powiadom przełożonego przy eskalacji i dokumentuj treść ustaleń.', 'Nie ujawniaj danych innych wychowanków.', ['agresywny rodzic', 'granice', 'rozmowa']),
    item('uprawnienie-do-informacji', 'Komu wolno przekazać informację o wychowanku?', 'Tylko osobom i instytucjom uprawnionym. Trzeba sprawdzić status prawny, orzeczenia, zgody i procedurę placówki.', 'Nie przekazuj informacji na podstawie samego telefonu bez weryfikacji.', ['informacja', 'uprawnienie', 'dane']),
    item('zgody-opiekunow', 'Kiedy potrzebna jest zgoda rodzica lub opiekuna?', 'Zgoda może być potrzebna przy sprawach zdrowotnych, wyjazdach, dokumentach lub działaniach określonych procedurą. W MOW zawsze sprawdź także decyzję sądu.', 'Dopytaj, jakiej czynności dotyczy zgoda.', ['zgoda', 'opiekun', 'sąd']),
    item('odmowa-wspolpracy-rodziny', 'Co jeśli rodzina odmawia współpracy?', 'Dokumentuj próby kontaktu, informuj przełożonego i stosuj procedury. W sprawach istotnych dla wychowanka konieczne może być poinformowanie właściwych organów.', 'Nie zostawiaj sprawy bez śladu w dokumentacji.', ['odmowa współpracy', 'rodzina', 'dokumentacja']),
    item('przekazanie-urlop', 'Co ustalić przed urlopowaniem do domu?', 'Adres pobytu, osobę odpowiedzialną, termin powrotu, kontakt, warunki bezpieczeństwa, zgodę lub decyzję oraz ewentualne zalecenia wychowawcze.', 'Sprawdź podstawę urlopu z art. 180 i § 14.', ['urlop do domu', 'rodzina', 'powrót']),
    item('telefon-do-rodzica', 'Jak dokumentować rozmowę telefoniczną z rodzicem?', 'Krótko: data, godzina, rozmówca, temat, ustalenia, ewentualne decyzje i dalsze kroki.', 'Nie zapisuj ocen bez wskazania faktów.', ['telefon', 'rodzic', 'notatka']),
    item('spotkanie-z-rodzina', 'Jak przygotować spotkanie z rodziną?', 'Ustal cel, zakres informacji, uczestników, dokumenty, granice poufności i plan dalszych działań.', 'Nie omawiaj danych innych wychowanków.', ['spotkanie', 'rodzina', 'plan']),
    item('kontakt-z-piecza', 'Jak współpracować z pieczą zastępczą?', 'Trzeba ustalić właściwą osobę lub instytucję, zakres uprawnień, decyzje sądu i tryb komunikacji.', 'Nie zakładaj, że każda osoba z rodziny ma prawo do informacji.', ['piecza zastępcza', 'uprawnienia', 'kontakt']),
    item('powrot-z-urlopu-info', 'Jak rozmawiać z rodziną po powrocie wychowanka z urlopu?', 'Zbierz informacje o przebiegu pobytu, trudnościach, punktualności, zachowaniu i ewentualnych ryzykach. Zapisz ustalenia.', 'Nie opieraj się wyłącznie na relacji jednej strony przy sporze.', ['powrót z urlopu', 'rodzina', 'informacja'])
  ]),

  category('organizacja-internatu', 'Organizacja internatu, dyżur i codzienna praca', [sources.placowki, sources.internal], [
    item('przekazanie-dyzuru', 'Co powinno znaleźć się przy przekazaniu dyżuru?', 'Najważniejsze informacje o stanie grupy, nieobecnościach, incydentach, zaleceniach, lekach według procedury, wydarzeniach i zadaniach do kontynuacji.', 'Oddziel sprawy pilne od informacyjnych.', ['przekazanie dyżuru', 'zmiana', 'grupa']),
    item('nadzor-grupy', 'Co oznacza stały nadzór nad grupą?', 'Wychowawca musi organizować pracę tak, aby znać miejsce pobytu wychowanków, reagować na ryzyka i nie zostawiać grupy bez opieki.', 'Dopytaj o sytuację: internat, wyjście, noc, zajęcia.', ['nadzór', 'grupa', 'opieka']),
    item('cisza-nocna', 'Jak egzekwować ciszę nocną?', 'Spokojnie przypomnij zasady, reaguj proporcjonalnie, dokumentuj uporczywe naruszenia i oceń, czy zachowanie wiąże się z ryzykiem.', 'Nie eskaluj konfliktu bez potrzeby.', ['cisza nocna', 'noc', 'porządek']),
    item('posilki', 'Co zrobić, gdy wychowanek odmawia posiłku?', 'Sprawdź, czy to jednorazowa odmowa czy ryzyko zdrowotne, porozmawiaj, obserwuj i zgłoś sprawę przy powtarzalności lub zagrożeniu.', 'Nie zmuszaj fizycznie do jedzenia.', ['posiłek', 'odmowa', 'zdrowie']),
    item('higiena', 'Jak reagować na odmowę higieny?', 'Rozmawiaj rzeczowo, wskaż normy i konsekwencje społeczne, zaproponuj plan, dokumentuj uporczywe problemy i włącz specjalistów przy potrzebie.', 'Nie zawstydzaj publicznie.', ['higiena', 'odmowa', 'plan']),
    item('sprzet-i-klucze', 'Jak zabezpieczać klucze i sprzęt?', 'Zgodnie z lokalną procedurą: kontrola wydania, zwrot, miejsce przechowywania, zgłoszenie braku i dokumentacja.', 'Nie przekazuj kluczy osobom nieuprawnionym.', ['klucze', 'sprzęt', 'zabezpieczenie']),
    item('grupa-feryjna', 'Jak traktować grupę feryjną lub wakacyjną?', 'Stosuj bieżące zarządzenia dyrektora i harmonogram. Zmiany czasowe obowiązują tylko w podanym okresie albo do nowszej decyzji.', 'Sprawdź datę obowiązywania komunikatu.', ['ferie', 'wakacje', 'zarządzenie czasowe']),
    item('zajecia-wolnoczasowe', 'Jak planować zajęcia wolnoczasowe?', 'Uwzględnij bezpieczeństwo, liczebność, zainteresowania, cele wychowawcze, miejsce, czas i możliwość nadzoru.', 'Nie traktuj zajęć jako luźnego czasu bez odpowiedzialności.', ['zajęcia', 'wolny czas', 'nadzór']),
    item('sprawdzenie-obecnosci', 'Kiedy sprawdzać obecność wychowanków?', 'Zgodnie z rozkładem dnia i sytuacją: po pobudce, przed wyjściem, po powrocie, przed snem, przy zmianie miejsca i po zdarzeniu.', 'Braki zgłaszaj natychmiast według procedury.', ['obecność', 'liczenie', 'brak wychowanka']),
    item('zadania-dyrektora-internatu', 'Jak traktować polecenia dyrektora internatu?', 'Polecenia organizacyjne są bieżącym źródłem pracy internatu, jeśli są zgodne z prawem i procedurami. Aplikacja powinna zapisywać datę, źródło i zakres.', 'Przy wątpliwości poproś o doprecyzowanie pisemne.', ['dyrektor internatu', 'polecenie', 'organizacja'])
  ]),

  category('wzory-pisma', 'Wzory pism, opinie i gotowe dokumenty', [sources.dokumentacja, sources.internal, sources.nieletni], [
    item('opinia-o-wychowanku', 'Jak napisać opinię o wychowanku?', 'Opinia powinna zawierać dane sprawy, okres obserwacji, fakty, funkcjonowanie w grupie, edukację, zachowanie, postępy, trudności, działania MOW i wnioski.', 'Oddziel fakty od ocen i użyj aktualnego wzoru MOW.', ['opinia', 'wychowanek', 'wzór']),
    item('opinia-semestralna', 'Co powinna zawierać opinia semestralna?', 'Krótki opis funkcjonowania w semestrze, realizację celów, zachowanie, naukę, relacje, stopnie, incydenty, mocne strony i zalecenia.', 'Nie przepisuj wyłącznie listy kar lub pochwał.', ['opinia semestralna', 'semestr', 'zalecenia']),
    item('wniosek-urlopowanie', 'Jak przygotować wniosek o urlopowanie wychowanka?', 'Wniosek powinien wskazywać podstawę, termin, miejsce pobytu, osobę odpowiedzialną, uzasadnienie, ocenę ryzyka i wymagane zgody.', 'Sprawdź art. 180 ustawy i § 14 rozporządzenia.', ['wniosek', 'urlopowanie', 'art 180']),
    item('wniosek-urlop-do-dyrektora', 'Jak napisać wniosek o urlop do dyrektora?', 'Użyj wzoru MOW, wskaż osobę, termin, powód, organizację zastępstwa lub konsekwencje dla dyżuru, jeśli dotyczy pracownika.', 'Dopytaj, czy chodzi o wychowanka czy pracownika.', ['wniosek urlop', 'dyrektor', 'pracownik']),
    item('notatka-sluzbowa', 'Jak napisać notatkę służbową po zdarzeniu?', 'Zapisz datę, godzinę, miejsce, osoby, przebieg, działania, powiadomienia, skutki i podpis. Nie dodawaj domysłów bez oznaczenia.', 'Najpierw bezpieczeństwo, potem notatka.', ['notatka służbowa', 'zdarzenie', 'fakty']),
    item('raport-z-dyzuru', 'Co powinien zawierać raport z dyżuru?', 'Najważniejsze zdarzenia, obecności, stan grupy, realizację zadań, informacje do następnej zmiany i sprawy wymagające reakcji.', 'Nie wpisuj zbędnych danych wrażliwych.', ['raport', 'dyżur', 'zmiana']),
    item('plan-pracy-wychowawczej', 'Jak przygotować plan pracy wychowawczej?', 'Plan powinien wynikać z diagnozy, celów resocjalizacyjnych, potrzeb grupy, dokumentów MOW i mierzalnych działań.', 'Cele formułuj konkretnie i możliwie sprawdzalnie.', ['plan pracy', 'wychowawcza', 'diagnoza']),
    item('sprawozdanie-z-dzialan', 'Jak przygotować sprawozdanie z działań wychowawczych?', 'Opisz cele, działania, frekwencję, efekty, trudności, wnioski i rekomendacje. Podeprzyj się faktami z dokumentacji.', 'Nie twórz sprawozdania bez okresu i kryteriów.', ['sprawozdanie', 'działania', 'wnioski']),
    item('protokol-spotkania', 'Jak sporządzić protokół ze spotkania?', 'Wpisz datę, uczestników, cel, przebieg, ustalenia, odpowiedzialnych za zadania i termin realizacji.', 'Protokół nie powinien zawierać dygresji ani danych niepotrzebnych.', ['protokół', 'spotkanie', 'ustalenia']),
    item('mail-do-dyrekcji', 'Jak napisać rzeczowego maila do dyrekcji?', 'Krótko: temat, fakty, ryzyko, dotychczasowe działania, czego oczekujesz i termin, jeśli sprawa jest pilna.', 'Nie wysyłaj danych wychowanków szerzej niż trzeba.', ['mail', 'dyrekcja', 'zgłoszenie'])
  ])
];

const answerBank = categories.flatMap(cat => cat.items.map((entry, index) => ({
  id: `${cat.key}-${String(index + 1).padStart(2, '0')}-${entry.key}`,
  category: cat.title,
  categoryKey: cat.key,
  intent: entry.question,
  questions: [
    entry.question,
    `Co zrobić, gdy ${entry.short || lowerFirst(entry.question.replace(/[?？]$/u, ''))}?`,
    `Jak postąpić w sprawie: ${entry.short || lowerFirst(entry.question.replace(/[?？]$/u, ''))}?`
  ],
  variants: entry.variants,
  keywords: [...new Set([...entry.keywords, ...entry.question.split(/\s+/).filter(word => word.length > 4)])].slice(0, 22),
  answer: entry.answer,
  action: entry.action,
  askIfUnclear: entry.askIfUnclear,
  doNotAnswer: entry.doNotAnswer,
  sources: cat.sources,
  priority: entry.priority,
  risk: entry.risk,
  updatedAt: '2026-06-30'
})));

if (answerBank.length !== 250) {
  throw new Error(`Bank odpowiedzi powinien mieć 250 wpisów, ma ${answerBank.length}.`);
}

const dataJs = `/* Generated by scripts/generate-answer-bank.mjs */\nconst MOW_ANSWER_BANK = ${JSON.stringify(answerBank, null, 2)};\nif (typeof window !== 'undefined') window.MOW_ANSWER_BANK = MOW_ANSWER_BANK;\n`;
fs.writeFileSync(path.join(root, 'assets', 'js', 'data-answer-bank.js'), dataJs, 'utf8');

const md = [
  '# Bank 250 odpowiedzi wzorcowych MOW',
  '',
  'Status: aktywna baza odpowiedzi do rozpoznawania intencji i ograniczania użycia zewnętrznego AI.',
  'Zasada: jeżeli pytanie użytkownika pasuje do intencji z wysoką pewnością, aplikacja może odpowiedzieć z banku bez użycia Gemini/OpenAI.',
  '',
  ...answerBank.map((entry, index) => [
    `## ${index + 1}. ${entry.intent}`,
    '',
    `Kategoria: ${entry.category}`,
    `Słowa-klucze: ${entry.keywords.join(', ')}`,
    `Warianty: ${entry.variants.join(' | ')}`,
    '',
    `Odpowiedź: ${entry.answer}`,
    '',
    `Praktycznie: ${entry.action}`,
    '',
    `Gdy niejasne: ${entry.askIfUnclear}`,
    '',
    `Nie odpowiadaj: ${entry.doNotAnswer}`,
    '',
    `Źródła: ${entry.sources.join('; ')}`,
    ''
  ].join('\n'))
].join('\n');
fs.writeFileSync(path.join(root, 'backend', 'knowledge', '07_bank_odpowiedzi_mow_250.md'), md, 'utf8');

console.log(`Generated ${answerBank.length} answer-bank records.`);

function category(key, title, sourceGroups, items) {
  return {
    key,
    title,
    sources: sourceGroups.flat(),
    items
  };
}

function item(key, question, answer, action, keywords, options = {}) {
  return {
    key,
    question,
    answer,
    action,
    keywords,
    variants: options.variants || buildVariants(question, keywords),
    askIfUnclear: options.askIfUnclear || 'Dopytaj o datę, osoby, miejsce, dokument źródłowy, aktualny status sprawy oraz czy istnieje bezpośrednie zagrożenie.',
    doNotAnswer: options.doNotAnswer || 'Nie zastępuj decyzji dyrektora, sądu, lekarza, Policji ani oficjalnej procedury MOW.',
    priority: options.priority || inferPriority(question, keywords),
    risk: options.risk || inferRisk(question, keywords),
    short: options.short || ''
  };
}

function buildVariants(question, keywords) {
  const base = question.replace(/[?？]$/u, '');
  const main = keywords.slice(0, 4).join(' ');
  return [
    base,
    `Jak postąpić: ${base}`,
    `Co mówi procedura o: ${main}`,
    `Podstawa prawna: ${main}`,
    `Co mam zrobić, gdy pojawia się problem: ${main}`
  ];
}

function inferPriority(question, keywords) {
  const text = `${question} ${keywords.join(' ')}`.toLowerCase();
  if (/112|samob|pożar|zatruc|pogot|przemoc|uciecz|przymus|narkot|alkohol|krzywd/.test(text)) return 'high';
  if (/sąd|polic|dane|urlop|przepust|pensum|czas pracy/.test(text)) return 'medium';
  return 'normal';
}

function inferRisk(question, keywords) {
  const text = `${question} ${keywords.join(' ')}`.toLowerCase();
  if (/112|samob|pożar|zatruc|pogot|przemoc|narkot|alkohol|przymus|krzywd/.test(text)) return 'safety';
  if (/dane|pesel|zdjęcie|wizerunek|poufne/.test(text)) return 'privacy';
  if (/sąd|urlop|przepust|pensum|czas pracy|polic/.test(text)) return 'legal';
  return 'practice';
}

function lowerFirst(value) {
  if (!value) return value;
  return value.charAt(0).toLowerCase() + value.slice(1);
}
