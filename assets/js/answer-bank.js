(function () {
  const MIN_DIRECT_CONFIDENCE = 0.62;
  const MIN_CLARIFY_CONFIDENCE = 0.36;
  const AMBIGUOUS_MARGIN = 0.07;
  const STOP_WORDS = new Set([
    'oraz', 'albo', 'czyli', 'jest', 'jaki', 'jakie', 'jaka', 'kiedy', 'gdzie',
    'ktory', 'ktora', 'ktore', 'moge', 'mozna', 'trzeba', 'mam', 'mamy', 'robi',
    'robic', 'postapic', 'postepowac', 'sprawie', 'temacie', 'pytanie', 'prosze',
    'wyjasnij', 'powiedz', 'opis', 'opisac', 'mow', 'mowie'
  ]);
  const TOKEN_ALIASES = new Map(Object.entries({
    etatu: 'etat',
    etacie: 'etat',
    godzin: 'godzina',
    godziny: 'godzina',
    wychowawcy: 'wychowawca',
    wychowawce: 'wychowawca',
    wychowawcow: 'wychowawca',
    nauczyciela: 'nauczyciel',
    urlopu: 'urlop',
    urlopowanie: 'urlop',
    urlopowania: 'urlop',
    przepustki: 'przepustka',
    ucieczki: 'ucieczka',
    ucieczce: 'ucieczka',
    policje: 'policja',
    policji: 'policja',
    sadu: 'sad',
    sadzie: 'sad',
    sadowy: 'sad',
    telefonu: 'telefon',
    telefonow: 'telefon',
    dokumentow: 'dokument',
    dokumenty: 'dokument',
    dokumentacji: 'dokumentacja',
    opinii: 'opinia',
    opinie: 'opinia',
    agresji: 'agresja',
    przymusu: 'przymus',
    dyzuru: 'dyzur',
    dyzury: 'dyzur',
    nocy: 'noc',
    rodzicow: 'rodzic',
    rodzica: 'rodzic'
  }));

  const entries = Array.isArray(window.MOW_ANSWER_BANK) ? window.MOW_ANSWER_BANK : [];
  const index = entries.map(buildIndexEntry);

  function normalizeAnswerBankText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/ł/g, 'l')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokenizeAnswerBankText(value) {
    const tokens = normalizeAnswerBankText(value)
      .split(' ')
      .filter(token => token.length > 2 && !STOP_WORDS.has(token));
    const expanded = new Set();
    tokens.forEach(token => {
      expanded.add(token);
      if (TOKEN_ALIASES.has(token)) expanded.add(TOKEN_ALIASES.get(token));
    });
    return [...expanded];
  }

  function resolveAnswerBankIntent(query) {
    const normalizedQuery = normalizeAnswerBankText(query);
    const queryTokens = [...new Set(tokenizeAnswerBankText(query))];
    if (!normalizedQuery || !queryTokens.length) return null;

    const scored = index
      .map(entry => scoreEntry(entry, normalizedQuery, queryTokens))
      .filter(result => result.confidence >= MIN_CLARIFY_CONFIDENCE)
      .sort((a, b) => b.confidence - a.confidence);

    if (!scored.length) return null;

    const best = scored[0];
    const second = scored[1];
    const ambiguous = second && (best.confidence - second.confidence) < AMBIGUOUS_MARGIN && best.confidence < 0.78;

    if (best.confidence >= MIN_DIRECT_CONFIDENCE && !ambiguous) {
      return {
        type: 'answer',
        confidence: best.confidence,
        entry: best.entry,
        candidates: scored.slice(0, 3)
      };
    }

    return {
      type: 'clarify',
      confidence: best.confidence,
      entry: best.entry,
      candidates: scored.slice(0, 4)
    };
  }

  function formatAnswerBankReply(match) {
    const entry = match?.entry || match;
    if (!entry) return '';

    return [
      '**Odpowiedź z bazy MOW:**',
      entry.answer,
      '',
      `**Co zrobić praktycznie:** ${entry.action}`,
      '',
      `**Gdy brakuje danych:** ${entry.askIfUnclear}`,
      '',
      `**Uwaga:** ${entry.doNotAnswer}`
    ].join('\n');
  }

  function formatAnswerBankClarification(match) {
    const candidates = (match?.candidates || [])
      .slice(0, 3)
      .map(candidate => `- ${candidate.entry.intent}`)
      .join('\n');

    return [
      '**Dopytam, żeby nie odpowiedzieć na siłę.**',
      'Pytanie pasuje do kilku tematów albo jest zbyt ogólne.',
      candidates ? `\nNajbliższe tematy:\n${candidates}` : '',
      '',
      'Dopisz proszę, o który wariant chodzi i podaj najważniejszy kontekst: data, miejsce, osoby, czy jest zagrożenie oraz jaki dokument lub decyzja MOW ma znaczenie.'
    ].filter(Boolean).join('\n');
  }

  function buildIndexEntry(entry) {
    const phrases = [
      entry.intent,
      ...(entry.questions || []),
      ...(entry.variants || []),
      ...(entry.keywords || []),
      entry.category,
      entry.categoryKey
    ].map(normalizeAnswerBankText).filter(Boolean);

    const text = phrases.join(' ');
    const tokens = new Set(tokenizeAnswerBankText(text));
    const keywordTokens = new Set(tokenizeAnswerBankText((entry.keywords || []).join(' ')));

    return {
      entry,
      phrases,
      tokens,
      keywordTokens
    };
  }

  function scoreEntry(indexEntry, normalizedQuery, queryTokens) {
    const tokenHits = queryTokens.filter(token => indexEntry.tokens.has(token));
    const keywordHits = queryTokens.filter(token => indexEntry.keywordTokens.has(token));
    const tokenScore = tokenHits.length / queryTokens.length;
    const keywordBase = Math.min(queryTokens.length, Math.max(1, indexEntry.keywordTokens.size));
    const keywordScore = keywordHits.length / keywordBase;
    const phraseBoost = getPhraseBoost(indexEntry, normalizedQuery);
    let confidence = (tokenScore * 0.52) + (keywordScore * 0.28) + phraseBoost;

    if (queryTokens.length <= 2 && phraseBoost < 0.35) confidence *= 0.72;
    if (tokenHits.length === 1 && phraseBoost < 0.25) confidence *= 0.65;

    return {
      entry: indexEntry.entry,
      confidence: Math.min(0.99, Number(confidence.toFixed(3))),
      tokenHits,
      keywordHits
    };
  }

  function getPhraseBoost(indexEntry, normalizedQuery) {
    let boost = 0;
    for (const phrase of indexEntry.phrases) {
      if (phrase.length < 8) continue;
      if (normalizedQuery === phrase) boost = Math.max(boost, 0.48);
      else if (normalizedQuery.length > 14 && phrase.includes(normalizedQuery)) boost = Math.max(boost, 0.36);
      else if (phrase.length > 14 && normalizedQuery.includes(phrase)) boost = Math.max(boost, 0.34);
    }
    return boost;
  }

  window.normalizeAnswerBankText = normalizeAnswerBankText;
  window.tokenizeAnswerBankText = tokenizeAnswerBankText;
  window.resolveAnswerBankIntent = resolveAnswerBankIntent;
  window.formatAnswerBankReply = formatAnswerBankReply;
  window.formatAnswerBankClarification = formatAnswerBankClarification;
})();
