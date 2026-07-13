# How to Build the TRACE Prototype Using Claude Code
*Beginner's guide — no coding experience needed*

---

## What is Claude Code?

Claude Code is Claude running inside your computer's Terminal (command line). Instead of chatting in a browser, you talk to it directly on your computer — and it can create files, write code, install software, run programs, and fix errors all by itself. Think of it as having a developer colleague sitting at your computer. You describe what you want, it builds it.

---

## Before You Start — One-Time Setup

### Step 1: Open Terminal
Press **Cmd + Space**, type **Terminal**, press Enter. A black or white window with a blinking cursor will appear. That's it.

### Step 2: Check if Node.js is installed
Type this and press Enter:
```
node --version
```
If you see something like `v20.0.0`, you're good. Skip to Step 3.

If you see "command not found", go to **nodejs.org**, download the **LTS** version, install it like any Mac app, then come back.

### Step 3: Install Claude Code
In Terminal, paste this single line and press Enter:
```
curl -fsSL https://claude.ai/install.sh | bash
```
Wait for it to finish (1-2 minutes). Text will scroll — that's normal.

When it's done, confirm it worked by typing:
```
claude --version
```
You should see a version number.

### Step 4: Navigate to your trace-prototype folder
Your folder is already set up in OneDrive. In Terminal, type this exactly and press Enter:
```
cd ~/Library/CloudStorage/OneDrive-Personal/2026\ Jobs/Fellowships/Austin\ AI\ Hub\ Hackathon/trace-prototype
```
You're now inside your project folder. The handoff doc and your API key file are already here.

---

## Building the Prototype

### Step 5: Start Claude Code
Type this and press Enter:
```
claude
```
The first time, it will open a browser window and ask you to log in with your Anthropic account. Log in, then come back to Terminal. When you see a `>` prompt, Claude Code is ready.

### Step 6: Give it the brief
Copy and paste everything between the lines below into Claude Code, then press Enter:

---

Read TRACE_Progress_Handoff_v2.md first for full project context. Then build the TRACE prototype as a React Progressive Web App (PWA).

**Core features to build:**

**1. FORM SELECTOR**
When a caseworker opens a case, they choose from: IOM HTCDS trafficking intake, protection monitoring form, GBV incident report, case progress note, inter-agency referral, consent form, follow-up review, or repatriation form. Each has its own field schema. TRACE pre-populates every field it can from the existing case record for referrals and follow-ups so the caseworker only provides what is new.

**2. VOICE OR TEXT INTAKE**
Caseworker speaks (use the browser's built-in Web Speech API, no API key needed) or types freeform notes in French, English, Arabic, Spanish, or Portuguese. AI structures the input into the selected form's fields using the Claude API. If connectivity is offline, notes are saved and structured when the device reconnects.

**3. AI RISK FLAGGING**
After intake completes, compare the structured case against trafficking indicators: labor recruitment fraud, document confiscation, debt bondage, movement restriction, physical abuse, sexual exploitation. Output risk level (low/medium/high) with matched indicators and — critically — list what information is MISSING from the profile that would sharpen or reduce the risk read (e.g., "No information collected on document status — this is a key indicator field"). This missing-info prompt is one of TRACE's core differentiators.

**4. CHATBOT INTERFACE**
Text input where caseworkers ask questions about the current case. Wire to Claude API grounded in IOM HTCDS protocol and current case data. Must handle: "What services fit this case?", "Why was this flagged high risk?", "Generate a referral letter for this case.", "What information am I still missing?"

**5. SERVICE SUGGESTION**
Hardcode 8 real services from IOM/UNHCR West Africa directories (include names, locations, contact info, service types). Surface 2-3 most relevant based on case type and geography. Include a note that online mode would pull live directory data.

**6. SUPPORT & CARE BUTTON**
A persistent button in the UI (heart icon, labelled "Support & Care") visible from every screen. When clicked, it opens a panel with: a breathing exercise (4-7-8 technique, animated), links to IOM Staff Care resources (https://www.iom.int/staff-care), IASC MHPSS guidelines for humanitarian workers, UNHCR Peer Support Network information, and a field for the local supervisor contact (pre-fillable by the organization). This panel also appears automatically after every HIGH risk case is saved — a prompt, not forced. Secondary trauma is a documented risk in trafficking casework and TRACE takes it seriously.

**7. QR CODE PORTABLE CASE RECORD + RECOVERY CODE**
After any case record is saved, generate: (a) a QR code the survivor can carry that encodes a short encrypted case ID, and (b) a 4-word + 4-digit recovery code (e.g., "DAWN-RIVER-7392") they can memorize. If the QR is lost, confiscated, or destroyed, the survivor provides the recovery code at any TRACE-connected agency and their record surfaces. The caseworker coaches the survivor on the recovery code at the point of consent. Both the QR and the code are stored in the encrypted case record so a replacement QR can be reprinted. Add a note in the UI: "Store separately from the survivor. Photograph the QR and file it with the paper case record."

**8. FOLLOW-UP REMINDER SYSTEM (toggleable)**
After a high-risk case is saved, schedule an automatic reminder at 48 hours. Medium-risk cases get a 7-day reminder. The reminder appears as a banner in TRACE when the caseworker logs in. This can be toggled on/off per-case (some security contexts require no digital contact trail). Implement with localStorage and a notification-style UI element.

**9. IN-APP GUIDED TUTORIAL + DEMO MODE**
On first open, a guided walkthrough launches automatically using tooltip overlays (use Shepherd.js or a simple custom implementation). It highlights each section in sequence: form selector → voice input → risk flag → missing info prompts → chatbot → services → Support & Care button. A "?" button in the corner re-triggers it at any time. Also add a "Demo Mode" button on the home screen that pre-loads a realistic hardcoded sample case (a 28-year-old woman, referred from a shelter in N'Djamena, Chad, labor trafficking indicators present, Arabic intake language) so judges and non-tech users can experience the full flow without entering real data.

**10. DARK/LIGHT MODE TOGGLE**
A sun/moon icon in the top right corner. Persists across sessions using localStorage. Default: dark mode (easier on low-light field conditions).

**11. SUPERVISOR DASHBOARD (hardcoded mockup)**
A separate tab labelled "Supervisor View" showing: a geographic risk heat map (use a simple SVG Africa map with 3-4 highlighted regions), a case statistics panel (total cases, risk distribution, cases awaiting follow-up), and a pattern alert panel (hardcode 2 sample pattern alerts: "Same employer name appears in 3 unconnected cases this week" and "New recruitment corridor flagged: Agadez–Tripoli route, 4 cases in 7 days"). Label it "Live in full deployment — demo data shown."

**API key:** Read from API_KEY.txt in the current directory. Parse the line that starts with ANTHROPIC_API_KEY= and strip the value.

**Tech:** React PWA, Tailwind CSS, Claude API (Anthropic), Web Speech API for voice, localStorage for offline case storage, Shepherd.js for tutorial overlay. Mobile-first UI. Navigation tabs: Cases | Chatbot | Supervisor | Support & Care. Clean, professional, accessible — imagine a caseworker using this on a basic Android phone in poor lighting.

**After building:**
1. Create a .gitignore that excludes API_KEY.txt, .env, node_modules, and build/.
2. Create a minimal Express or Vercel serverless function to proxy Claude API calls (so the API key stays server-side when deployed publicly).
3. Tell me how to run the app locally and how to deploy it to Vercel for a public live URL.

---

### Step 7: Let it work
Claude Code will start writing files. You'll see it creating folders, writing code, installing packages. This takes 10-20 minutes.

When it asks **"Do you want to run this command?"** — type `yes` and press Enter.

When it says something like "Run `npm start` to launch" — type that command and press Enter.

### Step 8: Open the prototype in your browser
Claude Code will tell you an address like `http://localhost:3000`. Copy it, paste it into Chrome, and your prototype will appear.

---

## If Something Goes Wrong

Just describe what you see in plain English — you don't need to understand the error. Claude Code does.

- **Error message:** Paste it into Claude Code and say "fix this."
- **Blank screen:** Say "the screen is blank, nothing appears."
- **App crashes:** Describe what you clicked when it happened.

---

## After the Prototype Works

Once the app runs in your browser:

1. **Test the full loop:** select a form → speak or type a case → see the risk flag → ask the chatbot a question
2. **Take 5 screenshots** of the key screens (Cmd + Shift + 4 on Mac)
3. **Record a 3-minute screen recording** (QuickTime → File → New Screen Recording)
4. **Push to GitHub** — tell Claude Code: "Push this project to a public GitHub repo for my hackathon submission."

---

## GitHub — What You Need to Know

**What GitHub is:** A website where developers store and share code. Judges need the link to your project — it goes in the "Repo URL" field on the submission form.

**What "committing" means:** Saving your code to GitHub. Like hitting Save, but the file goes to the GitHub website.

**Why the API key must stay out of GitHub:** GitHub is public. If your key is uploaded, anyone can use it and charge your account. The .gitignore file Claude Code creates will protect it automatically.

**You don't need to do anything technical.** Just tell Claude Code "push to GitHub" and it handles everything. You approve each step.

| Word | What it means |
|---|---|
| Repository (repo) | Your project folder on GitHub |
| Commit | Saving code to GitHub |
| Push | Sending it up to the GitHub website |
| .gitignore | List of files that never get uploaded (protects your API key) |

---

## Quick Reference — Commands You'll Use in Terminal

| Type this | What it does |
|---|---|
| `claude` | Starts Claude Code |
| `npm start` | Runs the prototype app |
| Ctrl + C | Stops the running app |
| `exit` | Exits Claude Code |

---

*TRACE · Austin AI Hub Hackathon · Track 2: Assist & Amplify*
