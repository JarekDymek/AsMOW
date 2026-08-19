function normalizeLegalAct(item = {}, key = '') {
  const eli = /^(?:DU|MP)\/\d{4}\/\d+$/i.test(String(item.ELI || ''))
    ? String(item.ELI)
    : '';
  return {
    key: String(key || ''),
    eli,
    displayAddress: String(item.displayAddress || '').slice(0, 100),
    title: String(item.title || '').slice(0, 600),
    status: String(item.status || '').slice(0, 100),
    inForce: String(item.inForce || '').slice(0, 40),
    changeDate: String(item.changeDate || '').slice(0, 40),
    promulgation: String(item.promulgation || item.announcementDate || '').slice(0, 20),
    url: eli ? `https://eli.gov.pl/eli/${eli}/ogl` : ''
  };
}

function dedupeLegalCandidates(items = []) {
  const unique = new Map();
  for (const item of items) {
    if (!item?.eli || unique.has(item.eli)) continue;
    unique.set(item.eli, item);
  }
  return [...unique.values()].sort((a, b) =>
    String(b.promulgation || b.changeDate).localeCompare(String(a.promulgation || a.changeDate))
  );
}

export { dedupeLegalCandidates, normalizeLegalAct };
