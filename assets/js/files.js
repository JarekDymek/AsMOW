async function fileToAttachment(file) {
  const textLike = /\.(txt|csv|tsv)$/i.test(file.name) || /^text\//i.test(file.type);
  if (textLike) {
    return {
      name: file.name,
      mimeType: file.type || 'text/plain',
      text: await readFileText(file)
    };
  }
  const dataUrl = await readFileDataUrl(file);
  const dataBase64 = dataUrl.split(',')[1] || '';
  return {
    name: file.name,
    mimeType: file.type || guessMimeType(file.name),
    dataBase64,
    dataUrl
  };
}

function readFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(String(e.target.result || ''));
    reader.onerror = () => reject(new Error('Błąd odczytu pliku.'));
    reader.readAsText(file, 'UTF-8');
  });
}

function readFileDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(String(e.target.result || ''));
    reader.onerror = () => reject(new Error('Błąd odczytu pliku.'));
    reader.readAsDataURL(file);
  });
}

function guessMimeType(name) {
  if (/\.docx$/i.test(name)) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (/\.xlsx$/i.test(name)) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (/\.xls$/i.test(name)) return 'application/vnd.ms-excel';
  if (/\.doc$/i.test(name)) return 'application/msword';
  if (/\.png$/i.test(name)) return 'image/png';
  if (/\.jpe?g$/i.test(name)) return 'image/jpeg';
  if (/\.webp$/i.test(name)) return 'image/webp';
  return 'application/octet-stream';
}

function isImageAttachment(att) {
  return /^image\//i.test(att.mimeType || '');
}

