# ClinicaAI — Generative AI Virtual Patient & Clinical Reasoning Simulator

**Creator and developer:** Nassr Lina  
**Affiliation:** Sixth-year medical student, Mouloud Mammeri University of Tizi Ouzou, Algeria  
**Project stage:** Experimental educational prototype · October 2026

> ClinicaAI helps medical students practise clinical cases through a virtual patient, structured clinical reasoning and indicative AI-generated feedback. It is **not** a medical device or a clinically validated assessment instrument.

## 1. Problem and user insight

Medical education requires more than theoretical knowledge: students must apply what they know to real-world-style clinical situations, from patient history-taking to diagnostic and management decisions.

An analysis of **official grade records for the Appareil locomoteur (Musculoskeletal System) module**, covering **30 medical students**, highlights a specific educational challenge: **83%** scored above **10/20** in the theory examination, compared with **32%** in the clinical-case assessment — a **51-percentage-point gap**. These figures are based on grade records held by the project creator and illustrate the difficulty of translating knowledge into applied clinical reasoning.

**ClinicaAI was designed in response to this documented educational need.** Through interactive cases, students can practise independently, interview a virtual patient, formulate clinical hypotheses, and receive structured educational feedback. Its intended users are medical students seeking to strengthen clinical reasoning and prepare for case-based assessments.

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

## Medical review and validation approach

ClinicaAI includes a medical review portal where physicians can examine virtual-patient answers, assess their clinical relevance, and provide structured observations. Two physicians contributed early feedback to the project.

The system also provides educational feedback on students' clinical reasoning, including an indicative score and personalized recommendations. This approach combines generative AI with medical expertise to progressively strengthen the quality and relevance of simulations.

## Continuous improvement and future development

ClinicaAI follows an iterative development process focused on clinical content quality, answer consistency, and user experience. Planned work includes expanding the case library, improving clinical-reasoning feedback, strengthening safeguards against inconsistent generated answers, and broadening review by healthcare professionals.

The long-term goal is an interactive educational platform adaptable to multiple medical specialties, supported by medical oversight and a rigorous evaluation approach.

**Intended use:** an educational prototype using fictional cases; automated scores are indicative and do not replace medical judgment.

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

## 7. Educational evidence and progress

The prototype demonstrates a complete fictional clinical learning flow, a 100-question benchmark framework, and an initial physician-feedback process. Feedback and scores support learning and are not clinical certifications.

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
