# ClinicaAI — Generative AI Virtual Patient & Clinical Reasoning Simulator

**Creator and developer:** Nassr Lina  
**Affiliation:** Sixth-year medical student, Mouloud Mammeri University of Tizi Ouzou, Algeria  
**Project stage:** Experimental educational prototype · October 2026

> ClinicaAI helps medical students practise clinical cases through a virtual patient, structured clinical reasoning and indicative AI-generated feedback. It is **not** a medical device or a clinically validated assessment instrument.

## 1. Problem and user insight

Clinical case exercises can be harder for students than recalling theory. The creator experienced this while studying medicine and heard similar concerns in informal conversations with classmates.

**Local descriptive observation:** Among the **same 30 students** assessed in the musculoskeletal module, **83% scored above 10/20 in theory**, compared with **32% in the clinical-case component** — a **51-percentage-point difference**. Percentages are reported as supplied; exact underlying counts and grading comparability have not been independently audited. This observation does **not** establish the cause of the difference or the effectiveness of ClinicaAI.

**Target audience:** Medical students preparing for clinical case examinations and independent clinical-reasoning practice.

## 2. What the working prototype does

1. The student selects a fictional clinical scenario (including postoperative breathlessness).
2. The student asks natural-language questions to a virtual patient; the dialogue is preserved.
3. The student selects investigations and writes an initial assessment, diagnostic hypotheses and management plan.
4. Generative AI supplies **indicative**, section-level feedback and a score out of 100. Medical teachers remain the authority for evaluation.
5. Students can save or restore attempts, edit their answers and export a PDF summary.
6. A jury demonstration provides a **static 7-page PDF** and an **editable saved attempt (JSON)** for exploring the same fictional exercise.

The source archive contains multiple pulmonary-embolism scenarios. This is a focused clinical teaching prototype, not a general medical diagnosis system.

## 3. AI methodology and selection

The team selected **Generative AI** for the main virtual-patient experience after an exploratory **small-sample** comparison. This initial observation is not conclusive. ClinicaAI therefore includes the **AI Comparison Lab** to support a more controlled comparison among:

- **Rules-only:** deterministic answers based on predefined case information.
- **Semantic matching:** retrieval/matching of case information by semantic similarity.
- **Generative AI:** model-generated answers based on the shared clinical dossier, using the **Google Gemini API**.

The benchmark provides **100 educational questions**, with **Q01–Q50 designated development** and **Q51–Q100 designated evaluation**. All methods should receive an equivalent clinical reference and be compared on the same questions. Evaluation questions should not be used to retune the approaches before reporting performance.

**Current evidence is preliminary:** 100 questions are a benchmark design, not 100 physician-validated findings or proof of superior clinical accuracy.

## 4. Physician review workflow

The physician portal permits importing blinded A/B/C answers, selecting an independent reviewer ID, scoring understanding, clinical fidelity and naturalness, marking contradictory or invented claims, adding notes and exporting a CSV. The clinical dossier can be examined separately.

Two physicians have provided encouraging informal feedback and answered some evaluation questions. The project has not established a complete **independently recorded** 100-question review from each physician; files labelled simulated reviews **must not** be reported as clinical validation.

## 5. Technical stack and architecture

- **Frontend/application:** Next.js 16, React 19, TypeScript, JavaScript, Tailwind CSS.
- **Generative model service:** Google Gemini API through server-side Next.js routes. The public UI says “Generative AI”; model identity is disclosed here.
- **Comparison methods:** JavaScript rules and semantic methods; package dependencies include `@huggingface/transformers`.
- **Persistence and exports:** browser `localStorage` for attempts/reviews; client-generated CSV, JSON and PDF exports. Browser data does not automatically synchronize between reviewers.
- **Delivery:** GitHub repository and Vercel deployment (verify public availability before submission).

Main code locations: `src/app/page.tsx` (simulator), `src/app/lab/page.tsx` (comparison), `src/app/validation/` (physician portal), `src/app/api/` (server APIs), and `src/data/` (cases and benchmark).

## 6. Run locally

Prerequisites: a recent compatible Node.js version and npm.

```bash
npm install
# Configure your own server-side environment variables; do not commit secrets.
# For generative features use GEMINI_API_KEY in .env.local.
npm run dev
```

Open `http://localhost:3000`. Run `npm test` and `npm run build` before deployment; do not assume tests/build passed without running them. The physician access code, if enabled, is configured server-side using `PHYSICIAN_REVIEW_ACCESS_CODE`; do not expose a real production credential in the UI or README.

**Example simulation:** Open the simulator; use **My attempts → Load jury demo attempt (editable) → Restore full attempt / edit**. The PDF example can also be opened using `/jury-example-clinical-attempt.pdf`. The JSON source is in `/public/jury-example-saved-attempt.json`. These are fictional educational materials, not patient records.

## 7. Evidence and limitations

- **User-need observation:** local cohort of 30 students, 83% theory vs 32% clinical cases above 10/20.
- **Illustrative prototype output:** one simulated clinical attempt with indicative Generative AI score of **55/100** and feedback identifying a potentially unsafe routine-thrombolysis selection.
- **Benchmark:** 100 predefined questions and reference responses; methodological comparison is exploratory.
- **Human feedback:** preliminary physician comments, not a completed independent blinded validation study.

Important limitations: small and non-random user sample; unknown equivalence of the two exams; limited clinical-case coverage; synthetic scenarios; potential hallucinations, contextual errors and scoring inconsistency; non-independent physician observations; local-only data storage; no established improvement in student outcomes.

## 8. Next three months

**Month 1:** Add clinical cases in more specialties, improve case consistency, and fix scoring/interface issues.  
**Month 2:** Pilot usability and structured feedback sessions with medical students; record failures and revise the learning flow.  
**Month 3:** Expand independent, blinded physician review; analyse per-question agreement, safety flags and subgroup performance; publish limitations transparently.

Progress will be measured through documented usability feedback, clinical consistency and the educational usefulness of generated explanations.

## 9. Team contribution and disclosure

**Nassr Lina — project conception and development.** Clinical context and product decisions are informed by the creator's medical training. The application uses the Google Gemini API for its generative features. Other development tools and contributors should be credited accurately where applicable.

**Repository:** https://github.com/linalina-03/clinicaai

**Project resources:** source repository, online prototype, example clinical attempt, technical documentation, methodology report and development roadmap. The interactive demonstration is intended to show an end-to-end clinical learning workflow.

---
**Medical and research disclaimer:** Educational simulation only. Generated explanations and scores are indicative and require independent medical review. No real patient data should be entered into a publicly accessible demonstration.
