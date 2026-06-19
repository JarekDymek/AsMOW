function toggleVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    appendMsg('err', 'Ta przeglądarka nie obsługuje dyktowania głosowego. Użyj Chrome albo Edge na telefonie lub komputerze.');
    return;
  }
  if (isListening && speechRecognition) {
    speechRecognition.stop();
    return;
  }
  speechRecognition = new SpeechRecognition();
  speechRecognition.lang = 'pl-PL';
  speechRecognition.interimResults = true;
  speechRecognition.continuous = false;
  speechRecognition.onstart = () => setVoiceState(true);
  speechRecognition.onend = () => setVoiceState(false);
  speechRecognition.onerror = e => {
    setVoiceState(false);
    appendMsg('err', `Nie udało się rozpoznać mowy: ${e.error || 'błąd mikrofonu'}`);
  };
  speechRecognition.onresult = e => {
    let finalText = '';
    let interimText = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const transcript = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalText += transcript;
      else interimText += transcript;
    }
    const ta = document.getElementById('chat-input');
    ta.value = (finalText || interimText).trim();
    autoResizeTA(ta);
    if (finalText.trim()) ta.focus();
  };
  speechRecognition.start();
}

function setVoiceState(active) {
  isListening = active;
  const btn = document.getElementById('voice-btn');
  if (!btn) return;
  btn.classList.toggle('listening', active);
  btn.title = active ? 'Zatrzymaj dyktowanie' : 'Dyktuj pytanie';
}

