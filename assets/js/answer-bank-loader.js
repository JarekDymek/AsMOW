(function () {
  let answerBankLoadPromise = null;

  function ensureAnswerBankLoaded() {
    if (typeof window.resolveAnswerBankIntent === 'function') return Promise.resolve(true);
    if (answerBankLoadPromise) return answerBankLoadPromise;

    answerBankLoadPromise = loadScriptOnce('assets/js/data-answer-bank.js')
      .then(() => loadScriptOnce('assets/js/answer-bank.js'))
      .then(() => typeof window.resolveAnswerBankIntent === 'function')
      .catch(() => false);

    return answerBankLoadPromise;
  }

  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-lazy-src="${src}"], script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === 'true') {
          resolve();
          return;
        }
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.dataset.lazySrc = src;
      script.addEventListener('load', () => {
        script.dataset.loaded = 'true';
        resolve();
      }, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.appendChild(script);
    });
  }

  window.ensureAnswerBankLoaded = ensureAnswerBankLoaded;
})();
