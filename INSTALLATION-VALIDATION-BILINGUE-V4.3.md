# ClinicaAI V4.3 — Bilingual AI-Assisted Physician Validation

## Installation (Windows CMD)

1. Back up your current ClinicaAI folder.
2. Unzip this complete project into a new folder (for example Desktop\\clinicaai-v43).
3. Copy your existing `.env.local` into that folder (do not share its Gemini key).
4. Open CMD inside the project and run:

```cmd
npm install
npm run build
npm run dev
```

5. Open http://localhost:3000/validation or use the Physician Validation button in the consultation home page.

## Features
- English first, with an EN/FR language control at the top of the physician page.
- All portal controls, options, help, and progress text switch between languages.
- Five clinical cases; 165 fact-level reviews with source labels and side-by-side FR/EN clinical text.
- Free heuristic checks; optional Gemini request returns reasoning in the selected language, suggested wording separately in FR and EN.
- Separate browser-local review records per reviewer ID; CSV export. The previous localStorage version-one data is kept and automatically imported for a matching reviewer ID.
- Gemini does not approve clinical facts; only clinicians can establish publication fidelity.

## Privacy and limitations
The validation page and Gemini validation API remain disabled in **production** (`NODE_ENV=production`) until real physician authentication is implemented. The prototype is local-development only. Do not put patient-identifiable data in the Gemini request. The free rule checks are heuristic and may incorrectly flag or miss inconsistencies. Clinical text is sent to the Gemini service only when the reviewer explicitly requests an analysis. Publication PDFs are not uploaded to Gemini and cannot be authenticated by the AI. Local review data are browser-specific; export CSV regularly.

The simulator and benchmark source files were not modified by this version. Existing benchmark history stored in your browser is unaffected.
