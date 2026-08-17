# TRACE — AI Field Intelligence for Humanitarian Caseworkers

> **Note on status.** This is the original TRACE prototype, built for Call for Code AI: United Against Trafficking (Austin AI Hub x UN Human Rights), where it placed 3rd. It is maintained as a working reference implementation and it is the build that makes live Claude API calls. Interface development has moved to [trace-humanitarian](https://github.com/ElkeDikoume/trace-humanitarian).

**IOM HTCDS-aligned case files. Deterministic risk flagging that runs with no connection. Deployable on a mid-range Android phone.**

**Live demo (this repository):** https://trace-prototype-ten.vercel.app/

[Project site](https://www.tracecase.app) · [v2 interface rebuild](https://github.com/ElkeDikoume/trace-humanitarian)

---

## Setup

Requires Node 18 or newer.

```bash
git clone https://github.com/ElkeDikoume/trace-prototype.git
cd trace-prototype
npm install
```

The AI features call Anthropic server-side, so the key never reaches the browser bundle. Local development reads it from a file; production reads it from an environment variable.

**Local development.** Create `API_KEY.txt` in the repository root. It is gitignored. Either format works:

```
ANTHROPIC_API_KEY=sk-ant-...
```

or the bare key on its own line.

**Production (Vercel).** Set `ANTHROPIC_API_KEY` in the project's Environment Variables. `api/claude.js` reads it at request time. Nothing else needs configuring.

Start the dev server. This runs the Express API and the Vite client together:

```bash
npm run dev
```

The client serves on `http://localhost:5173` and proxies `/api` to the Express server on port `8787`. Confirm the key loaded with `curl http://localhost:8787/api/health`, which returns `{"ok":true,"keyLoaded":true}`.

Production build:

```bash
npm run build
npm run preview
```

Without a key the interface still runs. Intake, the deterministic risk scorer, case storage, and document generation all work. Only AI structuring and the assistant fail, and they surface the error rather than falling back to fabricated output.

---

## Usage

The demo is a single-screen caseworker flow. There is no sign-in.

| Step | What to do |
|---|---|
| 1. Pick a language | Language selector, top of the intake panel. Sets the speech recognition locale and the interface strings. |
| 2. Choose a form | Form selector. IOM HTCDS-aligned intake types with different field schemas. |
| 3. Enter notes | Type freeform notes, or press the microphone and dictate. Narration, not structured questions. This is the step to use when evaluating the project. |
| 4. Structure | Sends the notes to Claude through `/api/claude`. Returns populated form fields. Fields it cannot infer are left blank rather than guessed. |
| 5. Review the flags | Risk indicators appear with the field value or phrase that triggered each one. Every flag is traceable. |
| 6. Generate a document | Referral letter or case summary, editable before export. `.docx` and `.pdf`. |

Cases persist in the browser's `localStorage` under `trace_cases_v1` and survive a reload. Clearing site data clears them. There is no server-side database in this repository.

A guided tour is available from the header overflow menu.

---

## What TRACE is

TRACE is an AI decision-support system for humanitarian field workers. A caseworker narrates what happened in an interview, and TRACE structures it into a case record, flags risk indicators with citations, and drafts the referral paperwork. The caseworker reviews and decides. Survivors never interact with the system.

This is not a form-filling tool. KoBoToolbox and ODK are good at collecting data. TRACE works with it.

---

## The problem

A protection caseworker conducting an interview in N'Djamena or Kakuma faces a dual burden: be fully present with the person in front of them, and simultaneously produce structured documentation that meets IOM and UNHCR reporting standards. In practice one of these suffers, and it is usually the documentation.

Risk indicators go unrecorded. Referral patterns stay invisible. Organizations cannot see emerging threats in their own caseload because the data does not exist in a form that can be analyzed.

TRACE closes that gap.

---

## How the AI works

**1. Intake.** The caseworker types or dictates freeform notes. Dictation uses the browser Web Speech API.

**2. Structuring.** The Claude API processes the transcript and populates the selected form's fields: demographics, presenting situation, risk indicators, movement history. Where a value cannot be reliably inferred, the field is left blank. Nothing is saved until the caseworker reviews it.

**3. Risk flagging.** A deterministic scorer matches the record against six CTDC/IOM trafficking indicators: labor recruitment fraud, document confiscation, debt bondage, movement restriction, physical abuse, and sexual exploitation. Each flag surfaces the field value or keyword that triggered it. This runs entirely client-side with no API call, so it works with no connectivity.

**4. Documentation.** One action generates a referral letter or case summary, editable before export.

---

## What is real, and what is not

Stated plainly, because a tool intended for protection work should not overstate itself.

**Real in this build.** Live Claude API calls through a server-side proxy. Deterministic six-indicator CTDC risk scoring with citations. Case persistence in browser `localStorage`. Document generation to `.docx` and `.pdf`. Browser-native speech recognition.

**Not implemented.** There is no GBV indicator set and no child-protection indicator set. The six indicators are trafficking indicators only. There is no server-side database, no multi-tenant model, no remote wipe, and no audit log. No timing or accuracy figures are published because nothing in the codebase is instrumented and any number would be invented.

**Language support is narrower than the picker suggests.** Eight options are offered. Five (English, French, Arabic, Spanish, Portuguese) pass a standard locale to the Web Speech API, and recognition quality depends entirely on the user's browser and device. Three (Hausa, Fulfulde, Zarma) are marked as local languages and route through the online interpretation pipeline, where Claude stands in for a dedicated speech model. Browser speech recognition does not meaningfully serve Sahel languages. Meta's Omnilingual ASR (Apache 2.0) is the intended path and is not yet integrated.

**Offline behavior is partial.** Intake, the risk scorer, the cached referral directory, and local case storage work with no connection. AI structuring and the assistant require the network. "Fully offline" would not be accurate.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| AI | Anthropic Claude API, called server-side via `api/claude.js` (Vercel) or `server/index.js` (local) |
| Storage | Browser `localStorage`. No database in this repository. |
| Voice | Browser Web Speech API |
| Documents | `docx`, `pdf-lib`, `docxtemplater` |
| Deployment | Vercel, installable PWA via `vite-plugin-pwa` |

JavaScript with JSX throughout. No TypeScript build step.

---

## Repository layout

```
api/                Vercel serverless function — Claude proxy
  _lib/anthropic.js Single source of truth for the Anthropic Messages call
server/             Express equivalent for local development
src/components/     Intake, risk flags, panels, document generation
src/data/           Form schemas, CTDC risk indicators, translations
src/lib/            Claude client, speech, storage, templates, tour
src/services/       CTDC, IOM DTM, ACLED, pattern intelligence
```

---

## Deployment context

TRACE is built for the field conditions of the Sahel and sub-Saharan Africa. The reference scenario is the Lake Chad Basin, where IOM and UNHCR field offices manage mixed migration and protection caseloads under severe connectivity constraints.

It runs on mid-range Android devices, requires no infrastructure beyond a browser, and caseworkers can be onboarded remotely. Any pilot would be scoped to a field office's own operational and data protection requirements, including where survivor data is permitted to be stored.

---

## Pilot access

Organizations interested in piloting TRACE can request access at [tracecase.app](https://www.tracecase.app).

**Contact:** hello@tracecase.app
**Security inquiries:** security@tracecase.app

---

## License

Source-available for evaluation purposes. Redistribution and commercial use require written permission. Contact hello@tracecase.app.

---

*Built by [Elke-Esmeralda Dikoume](https://www.linkedin.com/in/elke-dikoume). Eight years across humanitarian and climate programs in emergency response, protection, and disaster risk management. 3rd place, Call for Code AI: United Against Trafficking, Austin AI Hub x UN Human Rights.*
