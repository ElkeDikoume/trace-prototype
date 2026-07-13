# GitHub — What It Is and What You Need to Know
*For the TRACE hackathon submission*

---

## What GitHub is

GitHub is a website where developers store and share code. Think of it like Google Drive, but specifically for code. Your prototype needs to be there so judges can review it — the submission form has a "Repo URL" field that links to it.

---

## What "committing" means

When you work with Claude Code, every time you save your code to GitHub, that's called a "commit." It's like hitting Save, but the file goes up to the GitHub website instead of just staying on your computer.

---

## Why the API key must stay out of GitHub

GitHub is public by default. If your API key gets uploaded there, anyone in the world can see it and use it to rack up charges on your account. That's why it lives in API_KEY.txt — a separate file that never gets uploaded.

---

## What you actually have to do

Nothing technical. When the prototype is built, tell Claude Code:

> "Push this to GitHub and set up a .gitignore so the API_KEY.txt file is never uploaded."

Claude Code will handle everything — creating the GitHub link, uploading the code, protecting your key. You just approve each step.

---

## Quick glossary

| Word | What it means |
|---|---|
| Repository (repo) | Your project's folder on GitHub |
| Commit | Saving your code to GitHub |
| Push | Sending commits up to GitHub |
| .gitignore | A list of files that should NEVER be uploaded (like your API key) |
| Public repo | Anyone can see it — what you need for the hackathon |
| Private repo | Only you (and people you invite) can see it |

---

*TRACE · Austin AI Hub Hackathon*
