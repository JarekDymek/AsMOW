function setupTestAccessFromUrl() {
  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(String(window.location.hash || '').replace(/^#/, ''));
  const token = (url.searchParams.get('tester') || url.searchParams.get('test') || hashParams.get('tester') || '').trim();
  if (token) {
    localStorage.setItem(TEST_ACCESS_KEY, JSON.stringify({
      token,
      enabled: true,
      createdAt: new Date().toISOString()
    }));
    url.searchParams.delete('tester');
    url.searchParams.delete('test');
    if (hashParams.has('tester')) {
      hashParams.delete('tester');
      url.hash = hashParams.toString() ? `#${hashParams.toString()}` : '';
    }
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
  }
}

function getTestAccess() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TEST_ACCESS_KEY) || '{}');
    return parsed && parsed.enabled && parsed.token ? parsed : null;
  } catch {
    return null;
  }
}

function getTestAccessToken() {
  return getTestAccess()?.token || '';
}

function isTestMode() {
  return Boolean(getTestAccessToken());
}

function getTestProfile() {
  try {
    const parsed = JSON.parse(localStorage.getItem(`${TEST_ACCESS_KEY}_profile`) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveTestProfile(profile = {}) {
  localStorage.setItem(`${TEST_ACCESS_KEY}_profile`, JSON.stringify({
    ...profile,
    refreshedAt: new Date().toISOString()
  }));
}

async function refreshTestProfile() {
  const testAccessToken = getTestAccessToken();
  if (!testAccessToken) return null;
  try {
    const response = await fetch(`${getAIBackendBaseUrl()}/api/test-profile`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ testAccessToken })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) throw new Error(data.error || `HTTP ${response.status}`);
    saveTestProfile(data.profile || {});
    applyTestModeUI();
    return data.profile || {};
  } catch (err) {
    showTestAccessBanner(`Tryb testowy wymaga poprawnej konfiguracji backendu. ${err.message}`);
    return null;
  }
}

function applyTestModeUI() {
  if (!isTestMode()) return;
  document.body.classList.add('test-mode');
  const profile = getTestProfile();
  const educator = document.getElementById('weekly-educator');
  const backend = document.getElementById('weekly-backend-url');
  const token = document.getElementById('weekly-token');
  if (educator && !educator.value) educator.value = profile.weeklyEducator || 'Dymek';
  [backend, token].forEach((el) => {
    if (!el) return;
    el.value = 'ustawione bezpiecznie przez link testowy';
    el.disabled = true;
  });
  if (educator) educator.disabled = true;

  const syncToken = document.getElementById('current-info-sync-token');
  const syncAuto = document.getElementById('current-info-sync-auto');
  if (syncToken) {
    syncToken.value = 'ustawione bezpiecznie przez link testowy';
    syncToken.disabled = true;
  }
  if (syncAuto) {
    syncAuto.checked = true;
    syncAuto.disabled = true;
  }
  document.querySelectorAll('[data-test-admin-only="true"]').forEach((el) => {
    el.style.display = 'none';
  });
  showTestAccessBanner('Tryb testowy aktywny. Aplikacja używa bezpiecznej konfiguracji bez ujawniania tokenów.');
}

function showTestAccessBanner(text) {
  let banner = document.getElementById('test-access-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'test-access-banner';
    banner.className = 'test-access-banner';
    document.body.prepend(banner);
  }
  banner.textContent = text;
}
