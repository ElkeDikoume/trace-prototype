# TRACE

**An AI decision-support system for frontline humanitarian and protection caseworkers.**

[Live site](https://www.tracecase.app) · [Guided demo](https://trace-v2-git-v2-demo-trace-prototype.vercel.app/?v2&tour)

> **Status: working prototype.**
> This repository is a functioning demonstration built for evaluation. It is not a deployed product and has never been used with real case data. The [What is real](#what-is-real-and-what-is-not) section below states precisely which capabilities are implemented and which stand in for a production pipeline. Please read it before evaluating any claim on this page.

---

## What TRACE is

A protection caseworker finishes an interview and then faces a second job: turning what they just heard into a structured record that a reporting system will accept. That second job usually happens hours later, from memory and handwritten notes, and detail is lost at every step.

TRACE is built for the reasoning in between. A caseworker speaks or types their field notes, and TRACE structures them, matches them against published trafficking indicators, shows which specific phrases triggered each flag, and drafts the referral letter or case summary. The caseworker reviews everything and decides. TRACE never acts on its own.

The distinction that matters: KoBoToolbox and ODK are good at collecting data. TRACE is built to think alongside the person holding the caseload.

---

## What is real, and what is not

This is a prototype. The table below is the honest accounting.

| Capability | Status in this repository |
|---|---|
| Voice dictation | **Real.** Browser Web Speech API, 5 locales (English, French, Arabic, Spanish, Portuguese). |
| Hausa, Fulfulde, Zarma input | **Simulated.** Routed through the Claude API as a stand-in for a speech pipeline. Hidden when offline mode is on. |
| Meta SeamlessM4T | **Not integrated.** Referenced as the intended production path for low-resource languages. The Claude API stands in for it today, and the interface says so where it appears. |
| Interface translation (v1 screens) | **Real.** 5 languages (English, French, Arabic, Spanish, Portuguese) at 347 translated strings each, including right-to-left layout for Arabic. |
| Interface translation (v2 shell) | **Partial.** The v2 language picker offers 6 options (adding Russian and Chinese), but the bundles behind it currently cover only 11 navigation and status strings. The rest of the v2 screens render in English regardless of selection. |
| Risk indicator scoring | **Real and offline.** Deterministic keyword and field matching against 6 CTDC/IOM trafficking indicators, client side, no network call. |
| Indicator validation | **Not validated.** The indicator set is derived from published CTDC/IOM standards. It has not been tested against real caseloads or reviewed by a protection specialist. |
| AI structuring, summaries, referral letters | **Real, but online.** Anthropic Claude API via a server proxy that keeps the key server side. These require a connection. |
| Explainability | **Real.** Each flag traces back to the field values and phrases that produced it, and the assistant is instructed not to invent indicators outside the matched set. |
| Offline case management | **Real.** Intake, storage, risk scoring, and the cached referral directory work with no connection. |
| GBV and child protection frameworks | **Not implemented.** One indicator covers sexual exploitation. There is no separate GBV or child protection detection framework. |
| Remote wipe | **Not implemented.** |
| Encryption at rest | **Not implemented.** Case data sits in browser storage on the device. |
| CTDC, IOM DTM, and ACLED context | **Simulated datasets.** Demo data standing in for live integrations. Labelled as such in the interface. |
| Cross-case pattern intelligence | **Demo data.** Runs against the bundled sample caseload, not a live one. |

Do not deploy this with real survivor data. It has no encryption, no audit logging, and no data protection review.

---

## How a session works

**1. Intake.** The caseworker speaks or types field notes in their working language. Freeform narration, not a question script.

**2. Structuring.** The Claude API populates IOM-standard intake fields: demographics, presenting situation, movement history, protection concerns. Fields it cannot reliably infer are left blank rather than guessed. This step needs a connection.

**3. Risk flagging.** A deterministic client-side pass matches the record against 6 CTDC/IOM trafficking indicators: labor recruitment fraud, document confiscation, debt bondage, movement restriction, physical abuse, and sexual exploitation. Each carries a weight, and the result is a score with the matched indicators attached. This runs offline.

**4. Review and output.** The caseworker sees which indicators fired and why, can ask the assistant to explain any flag, and can generate a referral letter, case summary, missing information report, or follow-up plan. Every output is editable and requires caseworker approval.

---

## Running it locally

```bash
npm install
```

Set an Anthropic API key so the server proxy can reach the Claude API:

```bash
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
```

Then start the Express proxy and the Vite client together:

```bash
npm run dev
```

The offline features (intake, storage, risk scoring, referral directory) work without a key. Structuring, summaries, letters, and the assistant do not.

To see the guided walkthrough, append `?v2&tour` to the local URL.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| AI | Anthropic Claude API, via an Express proxy that keeps the key server side |
| Speech | Browser Web Speech API |
| Auth and sync | Supabase, MSAL (optional, not required for the demo) |
| Documents | docx, docxtemplater, pdf-lib |
| i18n | i18next, react-i18next |
| Walkthrough | Shepherd.js |
| Hosting | Vercel |

---

## Design commitments

**The caseworker decides.** No output is submitted, sent, or acted on without explicit review. TRACE surfaces and drafts. It does not determine.

**Every flag shows its work.** A risk score that cannot be traced back to specific evidence is not useful to someone who has to defend a referral decision.

**Offline is the default assumption, not a fallback.** The features a caseworker needs mid-interview are the ones that work with no signal.

**Blank beats guessed.** On an unclear field, leaving it empty is the correct behavior. A confidently wrong demographic detail in a protection record causes real harm.

---

## Repositories

- **[trace-prototype](https://github.com/ElkeDikoume/trace-prototype)** (this repository): the prototype demonstrated for evaluation.
- **[trace-humanitarian](https://github.com/ElkeDikoume/trace-humanitarian)**: the v2 codebase in active development.

---

## Contact

Pilot enquiries and questions: hello@tracecase.app

---

## License

Source-available for evaluation. Redistribution and commercial use require written permission.

---

*Built by [Elke-Esmeralda Dikoume](https://www.linkedin.com/in/elke-dikoume). 3rd place, Call for Code AI: United Against Trafficking, Austin AI Hub x UN Human Rights.*
