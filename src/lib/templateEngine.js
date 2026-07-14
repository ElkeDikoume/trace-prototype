import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { PDFDocument } from 'pdf-lib';
import { base64ToArrayBuffer } from './templateStorage.js';

// Flattens the current case into a placeholder -> value map. Every raw case
// field is available under its own key (so {{recruitmentMethod}} works for
// any HTCDS field), plus friendlier aliases for the fields orgs are most
// likely to put in a handoff/referral template.
export function buildTemplateData({ caseRecord, form, riskResult, services }) {
  const caseData = caseRecord?.data || {};
  const survivorName = caseData.fullName || caseData.clientIdentifier || caseData.survivorIdentifier || 'Not recorded';
  const originCountry = caseData.countryOfOrigin || caseData.nationality || '';
  const suggestedServices = (services || []).slice(0, 3).map((s) => s.name).join(', ');
  const riskScore = riskResult ? riskResult.score : '';
  const riskLevel = riskResult ? riskResult.level.toUpperCase() : '';

  return {
    ...caseData,
    survivor_name: survivorName,
    survivorName,
    origin_country: originCountry,
    originCountry,
    current_location: caseData.currentLocation || '',
    risk_score: riskScore,
    riskScore,
    risk_level: riskLevel,
    riskLevel,
    form_name: form?.name || '',
    formName: form?.name || '',
    suggested_services: suggestedServices,
    suggestedServices,
    date: new Date().toLocaleDateString('en-CA')
  };
}

function generateDocx(template, data) {
  const zip = new PizZip(base64ToArrayBuffer(template.dataBase64));
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => '',
    // Docxtemplater's own default tag syntax is single-brace {tag}. This
    // app's placeholders are documented and uploaded as {{double_brace}},
    // so the delimiters must be set explicitly or every {{tag}} parses as
    // two nested/duplicate single-brace tags and throws.
    delimiters: { start: '{{', end: '}}' }
  });
  try {
    doc.render(data);
  } catch (err) {
    const detail = err.properties?.errors?.map((e) => e.properties?.explanation).filter(Boolean).join(' ');
    throw new Error(detail || 'This template has formatting Docxtemplater could not parse. Check that every {{placeholder}} is typed as plain text with no split formatting.');
  }
  const blob = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
  return { blob, filename: `${template.name}_filled.docx` };
}

async function generatePdf(template, data) {
  const pdfDoc = await PDFDocument.load(base64ToArrayBuffer(template.dataBase64));
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  if (fields.length === 0) {
    throw new Error("This PDF has no fillable form fields. Upload a fillable PDF form, or a .docx template with {{placeholders}} instead.");
  }
  let filledCount = 0;
  fields.forEach((field) => {
    const key = field.getName().replace(/[{}]/g, '').trim();
    const value = data[key];
    if (value === undefined || value === null || value === '' || typeof field.setText !== 'function') return;
    try {
      field.setText(String(value));
      filledCount++;
    } catch {
      // Field type rejected a plain-text value (e.g. a constrained combo box), skip it.
    }
  });
  if (filledCount === 0) {
    throw new Error('None of this PDF\'s field names matched the case data. Name fields to match placeholders like survivor_name, origin_country, or risk_score.');
  }
  const bytes = await pdfDoc.save();
  return { blob: new Blob([bytes], { type: 'application/pdf' }), filename: `${template.name}_filled.pdf` };
}

export async function generateFromTemplate(template, data) {
  if (template.kind === 'docx') return generateDocx(template, data);
  if (template.kind === 'pdf') return generatePdf(template, data);
  throw new Error('Unsupported template type.');
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
