function stripHtml(value) {
  const box = document.createElement('div');
  box.innerHTML = String(value || '');
  return box.textContent.replace(/\s+/g, ' ').trim();
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

