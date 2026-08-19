function openHelp() {
  const title = document.getElementById('det-title');
  const source = document.getElementById('det-source');
  const body = document.getElementById('det-body');
  const view = document.getElementById('detail-view');
  if (!title || !source || !body || !view) return;

  title.textContent = 'Pomoc';
  source.textContent = 'Instrukcja praktyczna · Asystent MOW v2.4';
  body.innerHTML = `
    <div class="help-panel">
      <div class="help-card help-card--strong">
        <h3>Gdy sytuacja jest pilna</h3>
        <p>Najpierw zabezpiecz życie i zdrowie, wezwij wsparcie oraz odpowiednie służby. Przy bezpośrednim zagrożeniu dzwoń 112. Dopiero potem uzupełniaj dokumentację, oceniaj zachowanie i korzystaj z AI.</p>
      </div>

      <div class="help-card">
        <h3>Dyżur i Procedury</h3>
        <ul>
          <li>Dyżur zawiera rozkład dnia i kafelki najczęstszych zdarzeń.</li>
          <li>W Procedurach wyszukaj zdarzenie albo użyj grup: kryzys, bezpieczeństwo, inne.</li>
          <li>„NA JUŻ” pokazuje pierwsze działania. Niżej rozwiniesz dalsze kroki, dokumentację, zakazy i procedury powiązane.</li>
          <li>Brak wyniku nie oznacza braku zagrożenia. W sytuacji nagłej stosuj 112 i powiadom osobę kierującą dyżurem.</li>
        </ul>
      </div>

      <div class="help-card">
        <h3>Stopnie uspołecznienia</h3>
        <ul>
          <li>Otwórz stopień, aby sprawdzić jego kryteria i przywileje.</li>
          <li>Pomoc w ocenie działa lokalnie, bez AI. Dla +2 i +3 uwzględnia również kryteria wcześniejszych stopni.</li>
          <li>Arkusz tylko porządkuje obserwacje. Kwalifikacja jest zespołowa i opiera się na regulaminie oraz karcie obserwacji.</li>
          <li>Przy zdarzeniu najpierw otwórz właściwą procedurę. Odwołanie do Dyrektora: 3 dni; rozpatrzenie: 7 dni.</li>
        </ul>
      </div>

      <div class="help-card">
        <h3>Prawo i baza wiedzy</h3>
        <ul>
          <li>Podstawy prawne prowadzą do urzędowych stron ELI.</li>
          <li>„Sprawdź teraz” porównuje metadane monitorowanych aktów i nie zużywa limitu AI.</li>
          <li>„Nowe publikacje do oceny” to sygnały do sprawdzenia, a nie gotowa interpretacja prawna.</li>
          <li>Dokumenty MOW określają codzienne postępowanie, ale nie mogą być sprzeczne z ustawą lub rozporządzeniem.</li>
          <li>Zmiany czasowe zapisuj z datą obowiązywania. Nowszy aktywny wpis ma pierwszeństwo przed starszym.</li>
          <li>„Zapisane wpisy bazy wiedzy” to indeks źródeł, a nie historia rozmów. Wpisy centralne są wspólne i tylko do odczytu; wpisy lokalne istnieją wyłącznie na używanym urządzeniu.</li>
          <li>Bank 250 odpowiedzi i testy jakości są mechanizmami aplikacji. Przycisk „Wyjaśnij” opisuje je lokalnie, bez wysyłania treści do zewnętrznego AI i bez zużywania limitu.</li>
        </ul>
      </div>

      <div class="help-card">
        <h3>Inf. i Harmonogram</h3>
        <ul>
          <li>Inf. zapisuje komunikaty dyrekcji bez grafików. Załącznik można najpierw otworzyć, a potem pobrać.</li>
          <li>Synchronizacja poczty pobiera nowe wiadomości od ostatniego zapisanego punktu; poprzednie wpisy pozostają na urządzeniu.</li>
          <li>Harmonogram pokazuje poprzedni, bieżący i dostępne przyszłe tygodnie oraz pozwala sprawdzić wybranego wychowawcę.</li>
          <li>Przy błędzie generatora sprawdź adres Apps Script zakończony na /exec, token i aktualne wdrożenie Code.gs.</li>
        </ul>
      </div>

      <div class="help-card">
        <h3>AI i bank 250 odpowiedzi</h3>
        <ul>
          <li>Typowe pytania są najpierw dopasowywane do lokalnego banku odpowiedzi. Nie zużywa to limitu AI.</li>
          <li>Nowe lub niejednoznaczne pytania są wysyłane do backendu AI i wymagają Internetu.</li>
          <li>Jeśli opis jest zbyt ogólny, dopisz datę, miejsce, zdarzenie, zagrożenie i właściwy dokument MOW.</li>
          <li>AI jest pomocą w odnalezieniu informacji. Nie zastępuje Dyrektora, zespołu, sądu, lekarza, Policji ani obowiązującej procedury.</li>
        </ul>
      </div>

      <div class="help-card help-card--warn">
        <h3>Dane wrażliwe</h3>
        <p>Nie wpisuj do AI pełnego imienia i nazwiska wychowanka, PESEL, adresu, danych medycznych ani rodzinnych, jeżeli nie są konieczne. Używaj inicjałów, grupy i rzeczowego opisu. Załączone dokumenty mogą zostać przesłane do zewnętrznego modelu.</p>
      </div>

      <div class="help-card">
        <h3>Dane urządzenia i aktualizacje</h3>
        <ul>
          <li>Historia, notatki i część ustawień są zapisane na używanym urządzeniu.</li>
          <li>Przed czyszczeniem przeglądarki lub zmianą telefonu pobierz kopię w zakładce Prawo.</li>
          <li>Po komunikacie „Dostępna nowa wersja” wybierz Odśwież. Aplikacja wymieni wtedy pamięć PWA.</li>
          <li>Na współdzielonym urządzeniu wyczyść dane po zakończeniu testów.</li>
        </ul>
      </div>

      <div class="help-card">
        <h3>Gdy aplikacja działa dziwnie</h3>
        <ul>
          <li>odśwież stronę po komunikacie o nowej wersji,</li>
          <li>sprawdź połączenie z Internetem przy AI i synchronizacji,</li>
          <li>ponów nieudaną operację dopiero po sprawdzeniu komunikatu błędu,</li>
          <li>przy ważnej sprawie otwórz źródło, sprawdź datę i stosuj aktualne dokumenty MOW oraz decyzje przełożonych.</li>
        </ul>
      </div>
    </div>
  `;
  view.classList.add('open');
}
