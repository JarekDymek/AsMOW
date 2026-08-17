function openHelp() {
  const title = document.getElementById('det-title');
  const source = document.getElementById('det-source');
  const body = document.getElementById('det-body');
  const view = document.getElementById('detail-view');
  if (!title || !source || !body || !view) return;

  title.textContent = 'Pomoc';
  source.textContent = 'Najważniejsze zasady korzystania z Asystenta MOW';
  body.innerHTML = `
    <div class="help-panel">
      <div class="help-card help-card--strong">
        <h3>Najpierw wybierz zakładkę</h3>
        <p>Dyżur służy do szybkich reakcji, Procedury do zdarzeń, Stopnie do kwalifikacji zachowań, Prawo do podstaw i dokumentów, Inf. do komunikatów dyrekcji, Harmonogram do planu pracy, AI do pytań otwartych.</p>
      </div>

      <div class="help-card">
        <h3>AI i bank odpowiedzi</h3>
        <p>Przy typowych pytaniach aplikacja najpierw korzysta z lokalnego banku odpowiedzi. Nie zużywa wtedy limitu AI. Jeśli pytanie jest nowe albo niepewne, zostanie wysłane do backendu AI.</p>
      </div>

      <div class="help-card">
        <h3>Pytania zbyt ogólne</h3>
        <p>Jeśli pytanie może znaczyć kilka rzeczy, aplikacja powinna dopytać. Dopisz datę, miejsce, osoby, czy jest zagrożenie oraz jaki dokument lub decyzja MOW ma znaczenie.</p>
      </div>

      <div class="help-card help-card--warn">
        <h3>Dane wrażliwe</h3>
        <p>Nie wpisuj pełnych danych wychowanka, PESEL, adresu, danych medycznych ani danych rodzinnych, jeśli nie są konieczne. Używaj inicjałów, grupy i opisu sytuacji.</p>
      </div>

      <div class="help-card">
        <h3>Harmonogram</h3>
        <p>Plan pobierany z generatora pokazuje tygodnie pracy i może zostać przekazany do AI do interpretacji. Przy błędzie sprawdź adres Apps Script zakończony na /exec oraz właściwy token.</p>
      </div>

      <div class="help-card">
        <h3>Bieżące informacje</h3>
        <p>Zakładka Inf. zapisuje komunikaty od dyrekcji bez harmonogramów dyżurów. Przy wiadomościach z załącznikami można użyć podglądu lub pobierania pliku.</p>
      </div>

      <div class="help-card">
        <h3>Gdy aplikacja działa dziwnie</h3>
        <ul>
          <li>odśwież stronę po komunikacie o nowej wersji,</li>
          <li>sprawdź połączenie z Internetem przy AI i synchronizacji,</li>
          <li>zrób kopię danych lokalnych przed czyszczeniem przeglądarki,</li>
          <li>przy ważnej sprawie stosuj aktualne dokumenty MOW i decyzje przełożonych.</li>
        </ul>
      </div>
    </div>
  `;
  view.classList.add('open');
}
