# FiniteVerse

FiniteVerse is an interactive visualizer for finite automata theory — build NFAs and DFAs by hand, convert between representations, minimize automata, and step through proofs, all with animated visual feedback instead of pen-and-paper diagrams.

Live at **[finiteverse.online](https://finiteverse.online)**.

## Features

- **Automata Builder** — construct NFAs/DFAs visually on an interactive graph canvas
- **NFA → DFA Converter** — step-by-step subset construction with animated transitions
- **DFA Minimization** — reduce a DFA to its minimal equivalent form
- **Regex → ε-NFA** and **Grammar → FA** conversion
- **FA → Regex** conversion
- **Language-to-automata construction**, including intersection of multiple language conditions
- **FA Equivalence checking** against a target regex
- **Pumping Lemma simulation/proof walkthrough**
- **Google Sign-In** (Firebase Authentication) to access the workspace
- Multiple visual themes (dark, black & white, and a default pink/rose theme)

## Tech stack

- **React 19** + **TypeScript**, built with **Vite 6**
- **Tailwind CSS 4**
- **Firebase** — Authentication (Google provider) + Firestore
- **Framer Motion** (`motion`) for animations
- **Lucide** icons

## Getting started

```bash
npm install
cp .env.example .env   # then fill in VITE_FIREBASE_* values 
npm run dev
```

The app will not render (blank screen) without a valid `.env` — Firebase Auth initialization throws if the config is missing. Get the values from `firebase-applet-config.json` in this repo, or from the project owner.

These are public client-side config values (not secrets) — safe to have in a local `.env`, but `.env` itself stays out of git (already covered by `.gitignore`).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | TypeScript type-check (`tsc --noEmit`) |
| `npm run clean` | Remove `dist/` and `server.js` |


## Privacy

Google Sign-In is used only for authentication. Firestore stores basic profile info (`uid`, `email`, `displayName`, `photoURL`, last sign-in time) — no automata data is currently persisted between sessions. Full policy at [`/privacy.html`](https://finiteverse.online/privacy.html).

## License

No license file — all rights reserved. This is a private/owner project, not published for open-source reuse.
