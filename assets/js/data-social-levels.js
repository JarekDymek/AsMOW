const STOPNIE = [
  {id:"sn2",lvl:"–2",title:"Stopień –2",cls:"st-n2",kies:"20% kwoty bazowej",mode:"event",
   crit:["czyn karalny na terenie MOW lub poza nim – po ustaleniu faktów i zastosowaniu właściwej procedury"],
   przyw:["Kieszonkowe 20%","Brak telefonu komórkowego","Brak przepustek","Ograniczenie TV (piątki/soboty do 21:00)","Obniżenie oceny z zachowania","Powiadomienie sądu rodzinnego","Rozmowa ostrzegawcza wychowawcy i dyrektora"]},
  {id:"sn1",lvl:"–1",title:"Stopień –1",cls:"st-n1",kies:"40% kwoty bazowej",mode:"event",
   crit:["ucieczka – po zakończeniu działań bezpieczeństwa i ustaleniu faktów","samookaleczenie – dopiero po udzieleniu pomocy i rozpoznaniu kryzysu, bez stygmatyzowania wychowanka"],
   przyw:["Kieszonkowe 40%","Brak telefonu komórkowego","Brak przepustek do miasta","Ograniczenie TV","Wzmożony nadzór wychowawcy"]},
  {id:"s0",lvl:"0 (adaptacyjny)",title:"Stopień zerowy",cls:"st-0",kies:"60% kwoty bazowej",mode:"all",
   crit:["realizuje powierzane dyżury w internacie i szkole","przestrzega rozkładu dnia","poprawnie odnosi się do kolegów i pracowników","dba o higienę własną i mienie ośrodka","aktywnie uczestniczy w zajęciach nauki własnej","bez oporu uczestniczy w zajęciach grupy wychowawczej i szkoły"],
   przyw:["Kieszonkowe 60% kwoty bazowej","Imprezy kulturalne, sportowe i rekreacyjne na terenie MOW","Zajęcia dodatkowe w ramach zajęć grupy","Pochwała wychowawcy na forum grupy z wpisem do arkusza spostrzeżeń","Dyplom","Możliwość ubiegania się o urlop – decyzję podejmuje Dyrektor","Telewizja w piątki i soboty do 21:30","Telefon trzy razy w tygodniu po 30 minut w miejscu wyznaczonym przez wychowawcę; nie dotyczy stopnia zero uzyskanego przez obniżenie z wyższego stopnia"]},
  {id:"sp1",lvl:"+1",title:"Stopień +1",cls:"st-p1",kies:"80% kwoty bazowej",mode:"all",
   crit:["samodzielnie realizuje powierzane dyżury w internacie i szkole","przestrzega rozkładu dnia w internacie i szkole","poprawnie odnosi się do kolegów i pracowników","ma wyrobione nawyki higieniczno-porządkowe","nadrabia zaległości szkolne przez aktywny udział w lekcjach i nauce własnej","otrzymuje pozytywne oceny odpowiednio do swoich możliwości i uczestniczy w zajęciach grupy oraz szkoły","jeżeli jest taka potrzeba, systematycznie uczestniczy w zajęciach wyrównawczych, korekcyjnych i terapeutycznych","nawiązuje prawidłowe relacje z kolegami i pracownikami ośrodka","rozwija swoje mocne strony i zainteresowania","podejmuje próby niwelowania swoich słabych stron","punktualnie powraca z przepustek i urlopów"],
   przyw:["Kieszonkowe 80% kwoty bazowej","Reprezentowanie grupy i ośrodka w zawodach oraz konkursach","Imprezy kulturalne, sportowe i rekreacyjne w MOW i poza placówką","Zajęcia dodatkowe i rozwijanie zainteresowań na terenie miasta","Dyplom uznania, również w gablocie samorządu","Telefon zgodnie z regulaminem, w miejscu wyznaczonym przez wychowawcę","Możliwość ubiegania się o przepustkę do miasta i urlopowanie do domu","Wyjście do miasta z osobą odwiedzającą","Pochwała na forum grupy lub ośrodka z wpisem do arkusza spostrzeżeń"]},
  {id:"sp2",lvl:"+2",title:"Stopień +2",cls:"st-p2",kies:"100% kwoty bazowej",mode:"all",
   crit:["spełnia wszystkie kryteria wymagane przy stopniu +1","z kulturą i szacunkiem odnosi się do kolegów i pracowników, nie używa wulgaryzmów","wykazuje gotowość pomocy innym wychowankom w różnych obszarach życia codziennego","w miarę swoich możliwości otrzymuje dobre wyniki w nauce","systematycznie uczestniczy w zajęciach grupy wychowawczej","jeżeli jest taka potrzeba, systematycznie uczestniczy w zajęciach wyrównawczych, korekcyjnych i terapeutycznych","realizuje dodatkowe zadania wyznaczone przez wychowawcę","zawsze terminowo powraca z przepustek i urlopów","samodzielnie organizuje sobie czas wolny","systematycznie pracuje nad pokonaniem swoich słabych stron","wspiera słabszych kolegów i wychowanków nowo przybyłych","reprezentuje grupę w działaniach i przedsięwzięciach na terenie ośrodka"],
   przyw:["Kieszonkowe 100% kwoty bazowej","Reprezentowanie grupy i ośrodka w zawodach, konkursach i innych imprezach","Imprezy kulturalne, sportowe i rekreacyjne w MOW i poza placówką","Zajęcia dodatkowe i rozwijanie zainteresowań na terenie miasta","Dyplom uznania, również w gablocie samorządu","Telefon zgodnie z regulaminem, również we własnej sypialni","Możliwość ubiegania się o przepustkę i urlopowanie, także o dodatkowe dni wolne od zajęć szkolnych","Nagrody rzeczowe","Dopuszczenie do śródrocznej promocji do wyższej klasy","List pochwalny do rodziców","Pochwała wychowawcy lub dyrektora","Wpis do księgi nagród"]},
  {id:"sp3",lvl:"+3",title:"Stopień +3",cls:"st-p3",kies:"120% kwoty bazowej",mode:"all",
   crit:["spełnia wszystkie kryteria wymagane przy stopniu +2","samodzielnie realizuje dyżury i podejmuje się innych prac na terenie grupy oraz ośrodka","wzorowo odnosi się do kolegów i pracowników MOW","otrzymuje dobre i bardzo dobre wyniki w nauce","systematycznie uczestniczy w zajęciach poza placówką","przez minimum 2 miesiące prowadzi zdrowy, higieniczny i wolny od nałogów tryb życia","aktywnie uczestniczy w projektach edukacyjnych, akademiach i uroczystościach","podejmuje inicjatywy na rzecz grupy i zespołu klasowego","umie zadbać o własne zdrowie i prowadzi higieniczny tryb życia"],
   przyw:["Kieszonkowe 120% kwoty bazowej","Reprezentowanie grupy i ośrodka w zawodach oraz konkursach","Imprezy kulturalne, sportowe i rekreacyjne w MOW i poza placówką","Zajęcia dodatkowe i rozwijanie zainteresowań na terenie miasta","Dyplom uznania, również w gablocie samorządu","Telefon zgodnie z regulaminem, również we własnej sypialni","Możliwość ubiegania się o przepustkę i urlopowanie, także o dodatkowe dni wolne od zajęć szkolnych","Wyjście na imprezę organizowaną przez środowisko lokalne","Nagrody rzeczowe","Dopuszczenie do śródrocznej promocji do wyższej klasy","Poparcie wniosku o wcześniejsze zwolnienie z ośrodka","List pochwalny do rodziców","Pochwała wychowawcy lub dyrektora","Wpis do księgi nagród"]}
];

const STOP_QUALIFICATION_RULES = [
  "Nowo przybyły wychowanek otrzymuje stopień zerowy – adaptacyjny.",
  "Po powrocie z wakacji, w pierwszym tygodniu, następuje weryfikacja ostatniego stopnia z uwzględnieniem zachowania podczas wakacji i terminowości powrotu.",
  "Okres na stopniu adaptacyjnym trwa co najmniej 4 tygodnie.",
  "Do 25. dnia miesiąca kwalifikacji dokonują wspólnie wychowawcy grup i klasy, wychowankowie oraz przedstawiciel zespołu wychowawczego.",
  "Podstawą oceny są regulaminy MOW oraz karta obserwacji funkcjonowania wychowanka.",
  "Zmiana na stopień wyższy może nastąpić nie wcześniej niż po 4 tygodniach.",
  "Awans następuje o jeden stopień, a tylko w szczególnych i uzasadnionych przypadkach o dwa.",
  "Zespół wychowawczy może przeprowadzić weryfikację śródmiesięczną."
];

const STOP_EVENT_CHANGES = [
  {icon:"⚖️",event:"Czyn karalny na terenie MOW lub poza nim",effect:"zmiana na stopień –2"},
  {icon:"👊",event:"Pobicie z uszkodzeniem ciała",effect:"spadek o 2 stopnie, nie niżej niż stopień zerowy",safetyFirst:true,procedureId:"p-agresja"},
  {icon:"💊",event:"Posiadanie, odurzanie się lub wniesienie alkoholu albo środków psychoaktywnych",effect:"spadek o 1–2 stopnie, nie niżej niż stopień zerowy",safetyFirst:true,procedureId:"p-narkotyki"},
  {icon:"🥊",event:"Pobicie lub bójka",effect:"spadek o 1–2 stopnie",safetyFirst:true,procedureId:"p-agresja"},
  {icon:"💰",event:"Wymuszenie cudzej własności",effect:"spadek o 1–2 stopnie",procedureId:"p-kradziez"},
  {icon:"🖊️",event:"Tatuaż bez pisemnego potwierdzenia zgody rodzica",effect:"zmiana na stopień –1"},
  {icon:"🩹",event:"Samookaleczenie",effect:"regulamin wskazuje stopień –1; najpierw obowiązuje pomoc i ocena kryzysu",safetyFirst:true,procedureId:"p-samo"},
  {icon:"🚪",event:"Ucieczka",effect:"zmiana na stopień –1",safetyFirst:true,procedureId:"p-ucieczka"},
  {icon:"🗯️",event:"Przemoc psychiczna wobec innych wychowanków",effect:"spadek o 1 stopień",procedureId:"p-krzywdzenie"},
  {icon:"💥",event:"Dewastacja lub niszczenie mienia",effect:"spadek o 1 stopień"}
];

const STOP_DISCIPLINARY_ACTIONS = [
  "obniżenie stopnia i utrata części przywilejów",
  "upomnienie lub rozmowa ostrzegawcza wychowawcy albo dyrektora",
  "obniżenie oceny z zachowania",
  "powiadomienie sądu o nagannym zachowaniu",
  "wstrzymanie przepustek do miasta",
  "czasowe ograniczenie oglądania telewizji",
  "cisza nocna o 21:00 dla stopni ujemnych i zerowego",
  "zakaz korzystania z siłowni i innych pracowni",
  "naprawienie wyrządzonej szkody",
  "wstrzymanie udziału w imprezie na terenie MOW lub poza nim"
];

const STOP_APPEAL = {
  submitDays: 3,
  reviewDays: 7,
  text: "Wychowanek może odwołać się od decyzji do Dyrektora Ośrodka w terminie 3 dni. Odwołanie powinno zostać rozpatrzone w ciągu 7 dni od otrzymania."
};
