// Org-wide custom document template library, stored in localStorage (not
// scoped to a single case) so every field office's uploaded templates are
// available across all cases, mirroring how the built-in six documents work
// but for organization-supplied files instead of AI-generated text.
const TEMPLATES_KEY = 'trace_templates_v1';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const PDF_MIME = 'application/pdf';

function readAll() {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(templates) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function listTemplates() {
  return readAll().sort((a, b) => b.uploadedAt - a.uploadedAt);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('Failed to read the uploaded file.'));
    reader.readAsDataURL(file);
  });
}

export function templateKind(mimeType) {
  if (mimeType === DOCX_MIME) return 'docx';
  if (mimeType === PDF_MIME) return 'pdf';
  return null;
}

export async function saveTemplate(file) {
  const kind = templateKind(file.type);
  if (!kind) {
    throw new Error('Only .docx and .pdf template files are supported.');
  }
  const dataBase64 = await fileToBase64(file);
  const template = {
    id: `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: file.name.replace(/\.(docx|pdf)$/i, ''),
    filename: file.name,
    mimeType: file.type,
    kind,
    sizeBytes: file.size,
    uploadedAt: Date.now(),
    dataBase64
  };
  const templates = readAll();
  templates.push(template);
  writeAll(templates);
  return template;
}

export function deleteTemplate(id) {
  writeAll(readAll().filter((t) => t.id !== id));
}

export function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
