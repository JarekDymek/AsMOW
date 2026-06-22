/* ────────────────────────────────
   AI CHAT
──────────────────────────────── */
const SYSTEM_PROMPT = `Jesteś asystentem wychowawcy pracującego w Młodzieżowym Ośrodku Wychowawczym nr 1 im. Tadeusza Kościuszki w Malborku. Pomagasz w:
- procedurach postępowania (bójki, ucieczki, narkotyki, próby samobójcze, pożar itp.)
- stopniach uspołecznienia wychowanków (poziomy –2, –1, 0, +1, +2, +3)
- prawie oświatowym i przepisach dotyczących MOW
- technikach wychowawczych i resocjalizacyjnych
- dokumentowaniu zdarzeń

Odpowiadaj po polsku, zwięźle i praktycznie. Używaj list i nagłówków. Gdy chodzi o sytuacje kryzysowe – podkreślaj najważniejsze kroki.
Przy pytaniach o codzienne postępowanie najpierw stosuj dokumenty MOW: statut, procedury, regulamin stopni, standardy ochrony małoletnich, zarządzenia dyrektora i aktualną bazę zmian czasowych. Akty prawne traktuj jako ramę i źródło do uzasadnienia.
Jeżeli pytanie jest zbyt ogólne albo brakuje danych o sytuacji, dopytaj zamiast udzielać odpowiedzi na siłę.
Podstawy prawne: ustawa o wspieraniu i resocjalizacji nieletnich (Dz.U. 2026 poz. 163), rozporządzenie MEiN o publicznych placówkach systemu oświaty (Dz.U. 2023 poz. 651), Prawo oświatowe (Dz.U. 2026 poz. 820), Karta Nauczyciela (Dz.U. 2026 poz. 515), akty BHP, dokumentacyjne, pomoc psychologiczno-pedagogiczna oraz aktualne dokumenty MOW.`;

const DEFAULT_AI_BACKEND_URL = 'https://asmow.onrender.com/api/chat';
const AI_BACKEND_URL = localStorage.getItem('mow_ai_backend_url') || DEFAULT_AI_BACKEND_URL;
const CHAT_STORE_KEY = 'mow_chat_history_v2';
const MOW_DOCUMENTS = [
  'STATUT-M.O.W.pdf',
  'Reg.stopni uspołecznienia.pdf',
  'Procedury, niebezpieczne przedmioty, odwiedziny i korespondencja dotycząca wychowanków MOW w Malborku (2).pdf',
  'STANDARDY-OCHRONY-MALOLETNICH.pdf',
  'Poradnik dla wychowawców w Młodzieżowym Ośrodku Wychowawczym nr 1 w Malborku.docx.pdf',
  'Ustawa o wspieraniu i resocjalizacji nieletnich - tekst jednolity Dz.U. 2026 poz. 163',
  'Rozporządzenie MEiN z dnia 30 marca 2023 r. w sprawie niektórych publicznych placówek systemu oświaty - Dz.U. 2023 poz. 651',
  'Prawo oświatowe - Dz.U. 2026 poz. 820',
  'Karta Nauczyciela - Dz.U. 2026 poz. 515',
  'Awans zawodowy nauczycieli - Dz.U. 2022 poz. 1914',
  'Kodeks pracy - Dz.U. 2025 poz. 277 z późn. zm.',
  'BHP w szkołach i placówkach - Dz.U. 2020 poz. 1604 z późn. zm.',
  'Pomoc psychologiczno-pedagogiczna - Dz.U. 2023 poz. 1798',
  'Dokumentacja przebiegu nauczania, wychowania i opieki - Dz.U. 2024 poz. 50'
];

function getAIHealthUrl() {
  const url = new URL(AI_BACKEND_URL, window.location.href);
  url.pathname = url.pathname.replace(/\/api\/chat\/?$/, '/health');
  return url.toString();
}

function getAIBackendBaseUrl() {
  const url = new URL(AI_BACKEND_URL, window.location.href);
  url.pathname = url.pathname.replace(/\/api\/chat\/?$/, '');
  return url.toString().replace(/\/$/, '');
}

function buildAssistantContext() {
  return {
    role: 'mentor i asystent wychowawcy MOW nr 1 w Malborku',
    rule: 'Dokumenty MOW są nadrzędne przy pytaniach o procedury postępowania. Gdy pytanie jest zbyt ogólne, asystent ma dopytać o kontekst.',
    documents: MOW_DOCUMENTS,
    procedures: PROCS.map(p => ({
      title: stripHtml(p.title),
      description: stripHtml(p.sub),
      source: stripHtml(p.src),
      steps: p.steps.map(stripHtml),
      alert: p.alert ? stripHtml(p.alert.txt) : ''
    })),
    socializationLevels: STOPNIE.map(s => ({
      level: stripHtml(s.lvl),
      pocketMoney: stripHtml(s.kies),
      criteria: s.crit.map(stripHtml),
      privileges: s.przyw.map(stripHtml)
    })),
    legalBases: LAWS.map(l => stripHtml(l.t)),
    weeklyPlan: weeklyPlan ? weeklyPlanToText().slice(0, 12000) : '',
    currentInfo: typeof getCurrentInfoContext === 'function' ? getCurrentInfoContext() : [],
    knowledgeBase: getKnowledgeContext()
  };
}


