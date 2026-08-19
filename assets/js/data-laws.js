const LAWS = [
  {n:"1",t:"Ustawa o wspieraniu i resocjalizacji nieletnich (Dz.U. 2026 poz. 163) - podstawowy akt dla spraw nieletnich, środków wychowawczych, pobytu w MOW, praw wychowanka i czasowego opuszczania ośrodka."},
  {n:"2",t:"Rozporządzenie MEiN z 30 marca 2023 r. w sprawie niektórych publicznych placówek systemu oświaty (Dz.U. 2023 poz. 651) - organizacja MOW, warunki pobytu, urlopy, przepustki i dokumentacja wychowanka."},
  {n:"3",t:"Rozporządzenie Ministra Sprawiedliwości z 27 grudnia 2022 r. w sprawie kierowania, przenoszenia, zwalniania i pobytu nieletnich w MOW (Dz.U. 2023 poz. 139)."},
  {n:"4",t:"Ustawa - Prawo oświatowe (Dz.U. 2026 poz. 820) - ramy działania placówek systemu oświaty, statut, nadzór, bezpieczeństwo i organizacja."},
  {n:"5",t:"Karta Nauczyciela (Dz.U. 2026 poz. 515) - obowiązki, czas pracy, odpowiedzialność i awans zawodowy nauczyciela-wychowawcy."},
  {n:"6",t:"Rozporządzenie MEiN z 6 września 2022 r. w sprawie uzyskiwania stopni awansu zawodowego przez nauczycieli (Dz.U. 2022 poz. 1914)."},
  {n:"7",t:"Kodeks pracy (Dz.U. 2025 poz. 277 z późn. zm.) - stosowany pomocniczo w sprawach nieuregulowanych Kartą Nauczyciela i regulaminem pracy."},
  {n:"8",t:"Ustawa o środkach przymusu bezpośredniego i broni palnej (Dz.U. 2026 poz. 244) - granice interwencji, bezpieczeństwo i dokumentowanie użycia środka przymusu."},
  {n:"9",t:"Rozporządzenie w sprawie BHP w szkołach i placówkach (t.j. Dz.U. 2020 poz. 1604 z późn. zm.) - bezpieczeństwo wychowanków, pracowników i organizacja działań w placówce."},
  {n:"10",t:"Rozporządzenie w sprawie pomocy psychologiczno-pedagogicznej (Dz.U. 2023 poz. 1798) - rozpoznawanie potrzeb, planowanie wsparcia i współpraca specjalistów."},
  {n:"11",t:"Rozporządzenie o kształceniu, wychowaniu i opiece młodzieży niedostosowanej społecznie (Dz.U. 2020 poz. 1309) - organizacja wsparcia edukacyjnego i wychowawczego."},
  {n:"12",t:"Rozporządzenie o dokumentacji przebiegu nauczania, działalności wychowawczej i opiekuńczej (Dz.U. 2024 poz. 50) - zasady prowadzenia dokumentacji."},
  {n:"13",t:"Statut MOW nr 1 w Malborku, procedury wewnętrzne, regulamin stopni, standardy ochrony małoletnich i zarządzenia dyrektora - pierwszeństwo przy pytaniach o codzienne procedury."},
];

const LAW_SOURCE_META = {
  "1": {url:"https://eli.gov.pl/eli/DU/2026/163/ogl", status:"tekst jednolity", reviewedAt:"2026-08-19"},
  "2": {url:"https://eli.gov.pl/eli/DU/2023/651/ogl", status:"źródło urzędowe", reviewedAt:"2026-08-19"},
  "3": {url:"https://eli.gov.pl/eli/DU/2023/139/ogl", status:"źródło urzędowe", reviewedAt:"2026-08-19"},
  "4": {url:"https://eli.gov.pl/eli/DU/2026/820/ogl", status:"tekst jednolity", reviewedAt:"2026-08-19"},
  "5": {url:"https://eli.gov.pl/eli/DU/2026/515/ogl", status:"tekst jednolity", reviewedAt:"2026-08-19"},
  "6": {url:"https://eli.gov.pl/eli/DU/2022/1914/ogl", status:"sprawdź zmiany", reviewedAt:"2026-08-19"},
  "7": {url:"https://eli.gov.pl/eli/DU/2025/277/ogl", status:"tekst jednolity", reviewedAt:"2026-08-19"},
  "8": {url:"https://eli.gov.pl/eli/DU/2026/244/ogl", status:"tekst jednolity", reviewedAt:"2026-08-19"},
  "9": {url:"https://eli.gov.pl/eli/DU/2020/1604/ogl", status:"tekst jednolity", reviewedAt:"2026-08-19"},
  "10": {url:"https://eli.gov.pl/eli/DU/2023/1798/ogl", status:"tekst jednolity", reviewedAt:"2026-08-19"},
  "11": {url:"https://eli.gov.pl/eli/DU/2020/1309/ogl", status:"tekst jednolity", reviewedAt:"2026-08-19"},
  "12": {url:"https://eli.gov.pl/eli/DU/2024/50/ogl", status:"tekst jednolity", reviewedAt:"2026-08-19"},
  "13": {url:"", status:"dokumenty wewnętrzne", reviewedAt:"2026-08-19"}
};
