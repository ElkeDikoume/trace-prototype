# TRACE — AI Field Intelligence for Humanitarian Caseworkers

**IOM/UNHCR-compliant case files in under 90 seconds. Offline. In 30+ languages. Deployable in any crisis zone.**

[Live site](https://www.tracecase.app) · [Demo](https://trace-v2-git-v2-demo-trace-prototype.vercel.app/?v2&tour)

---

## What TRACE is

TRACE is an AI decision-support system for humanitarian field workers. A caseworker speaks — in Hausa, Somali, Arabic, French, or any of 30+ languages — and TRACE listens, understands, assesses risk, explains its reasoning, and recommends action. The caseworker decides. TRACE handles the cognitive and documentation load.

This is not a form-filling tool. KoBoToolbox and ODK are good at collecting data. TRACE thinks with it.

---

## The problem

A humanitarian caseworker conducting a protection interview in N'Djamena or Kakuma faces a dual burden: be fully present with the person in front of them, and simultaneously produce structured documentation that meets IOM/UNHCR reporting standards. In practice, one of these suffers. Usually the documentation.

The result: caseworkers spend 2–3 hours per case on paperwork. Risk indicators go unrecorded. Referral patterns are invisible. Organizations cannot identify emerging threats in their caseload because the data doesn't exist in a form that can be analyzed.

TRACE closes that gap.

---

## How the AI works

A TRACE session follows four steps:

**1. Voice intake**
The caseworker conducts an interview and speaks their notes into TRACE — in any language. Freeform narration, not structured questions.

**2. Transcription + translation**
Voice is transcribed using Meta SeamlessM4T, which handles low-resource languages (Hausa, Fulfulde, Zarma, Amharic, Somali) that most AI models cannot process. Audio is converted to text and translated to the caseworker's working language in a single step.

**3. AI structuring**
The Claude API (Anthropic) processes the transcript and populates IOM-standard intake fields: demographics, presenting situation, risk indicators, movement history. TRACE leaves fields blank when it cannot reliably infer the value, rather than guessing. The caseworker reviews the output before anything is saved.

**4. Risk assessment + documentation**
TRACE scores risk against structured indicator sets — including trafficking (CTDC), GBV, and child protection frameworks — and surfaces the specific phrases from the transcript that triggered each flag. The caseworker can ask "why did you flag this?" and get a grounded answer. One click generates a referral letter or case summary, all editable before submission.

---

## What makes TRACE different

**Offline-first.** Case data lives on the caseworker's device. Sync happens when the caseworker initiates it. The system works in areas with no reliable connectivity — the intake flow, risk scoring, and referral directory (cached IOM/UNHCR data) are all available offline.

**Explainable AI.** Every risk flag shows its source in the transcript. The caseworker always knows why TRACE flagged something, and always has the final call.

**Low-resource language support.** Not just interface translation. TRACE handles voice input in languages that mainstream AI providers cannot transcribe.

**Humanitarian data standards.** IOM/UNHCR-standard intake form types (including HTCDS), IASC data protection alignment, on-device storage by default, remote wipe for seized devices. Voice audio is deleted from device memory immediately after transcription — only the text transcript is stored and synced.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend / Auth / DB | Supabase (PostgreSQL + Supabase Auth) |
| AI — structuring + reasoning | Anthropic Claude API |
| AI — voice + translation | Meta SeamlessM4T |
| Deployment | Vercel |
| Offline sync | Progressive Web App architecture |

---

## Deployment context

TRACE is designed for the field conditions of sub-Saharan Africa, the Sahel, and other areas of humanitarian operation. The reference scenario is the Lake Chad Basin — N'Djamena, Chad — where IOM and UNHCR field offices manage mixed migration and protection caseloads with severe connectivity constraints.

The system is designed to run on mid-range Android devices, requires no IT infrastructure beyond a browser, and caseworkers can be onboarded remotely. Organizations can request access at tracecase.app; pilot scope and timelines are scoped to each field office's operational and data protection requirements.

---

## Current status

TRACE is in active beta. The guided demo shows the full caseworker flow: language selection, voice input in Hausa or Somali, real-time structuring, risk scoring with explicit receipts, referral recommendations, and document generation.

**Try the demo:** https://trace-v2-git-v2-demo-trace-prototype.vercel.app/?v2&tour

---

## Pilot access

Organizations interested in piloting TRACE can request access at [tracecase.app](https://www.tracecase.app).

**Contact:** hello@tracecase.app  
**Security inquiries:** security@tracecase.app

---

## License

This repository is source-available for evaluation purposes. Redistribution and commercial use require written permission. Contact hello@tracecase.app.

---

*Built by [Elke-Esmeralda Dikoume](https://www.linkedin.com/in/elke-dikoume). 3rd place, Call for Code AI: United Against Trafficking — Austin AI Hub x UN Human Rights.*
