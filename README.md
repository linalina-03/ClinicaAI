# ClinicaAI — Clinical Simulation & AI-Assisted Medical Education

**Français** · [English version ↓](#english)

> **Version actuelle : V2.1 — Prototype pédagogique**  
> Cinq scénarios d'embolie pulmonaire · Patient virtuel · Examinateur hybride · Mode ECOS · Suivi de progression  
> **Sans clé API et sans abonnement à un service d'IA.**

**Code source :** https://github.com/linalina-03/clinicaai  
**Démonstration en ligne :**https://clinicai-iuklsprl8-lina-ecee.vercel.app/lab)

---

## Français

### Le problème

Les étudiants en médecine doivent apprendre à mener un interrogatoire, sélectionner les examens pertinents, évaluer la gravité et proposer une prise en charge cohérente. Les questions à choix multiples ne reproduisent pas toujours le déroulement d'une consultation.

**ClinicaAI** est un prototype de simulation clinique interactif : l'étudiant dialogue avec un patient virtuel, prend des décisions et reçoit une évaluation pédagogique argumentée.

### Fonctionnalités — V2.1

- **5 cas cliniques d'embolie pulmonaire** : situation postopératoire, choc, comorbidités cardiaques, grossesse et risque intermédiaire.
- **Interrogatoire libre** : questions rédigées en français, avec réponses limitées aux informations du scénario.
- **Dialogue hybride** : reconnaissance par règles et comparaison sémantique via un modèle d'embeddings exécuté dans le navigateur ; arbitrage et contrôles pour certaines informations non documentées.
- **Examens complémentaires** : demandes d'investigations et restitution des données prévues dans le scénario.
- **Examinateur hybride** : barème indicatif sur 100 points, reconnaissance de certains synonymes médicaux et protection partielle contre les négations et les décisions critiques.
- **Mode ECOS/OSCE** : simulation chronométrée de 10 ou 15 minutes.
- **Rapport explicable** : critères reconnus, éléments manquants ou non reconnus, pistes de révision et copie du bilan.
- **Progression personnelle** : historique des scores dans le stockage local du navigateur et export CSV.

### Barème indicatif

| Domaine | Points |
|---|---:|
| Interrogatoire | 20 |
| Examens complémentaires | 25 |
| Évaluation initiale et gravité | 20 |
| Hypothèse diagnostique | 15 |
| Conduite à tenir | 20 |
| **Total avant pénalités** | **100** |

Le score est **expérimental** : il ne constitue ni une validation des compétences ni une certification ECOS. Les règles de pénalité sont simplifiées et contextualisées.

### Comment fonctionne l'« IA » ?

ClinicaAI n'utilise **pas de LLM génératif** et ne prétend pas produire un raisonnement clinique autonome.

1. Les informations des patients et les barèmes sont définis dans des **fichiers JSON**.
2. Un moteur de **règles** reconnaît les formulations connues.
3. Un modèle d'**embeddings multilingues**, exécuté avec **Transformers.js dans le navigateur**, recherche des questions de sens voisin.
4. Une logique d'**arbitrage et de protection** choisit les réponses documentées ; le modèle ne doit pas inventer de faits cliniques.
5. L'**examinateur** combine critères déterministes et reconnaissance limitée de formulations équivalentes. Les décisions thérapeutiques sensibles ne sont pas validées sur la seule similarité sémantique.

Le premier chargement du modèle nécessite généralement un téléchargement. Les performances dépendent du navigateur et de l'appareil ; le repli sur les règles reste disponible.

### Installation locale

**Prérequis :** Node.js et npm.

```bash
git clone https://github.com/linalina-03/clinicaai.git
cd clinicaai
npm install
npm run dev
```

Ouvrir http://localhost:3000.

Pour vérifier la compilation de production :

```bash
npm run build
npm run start
```

Le projet utilise **Next.js 16, React, JavaScript/TypeScript, Transformers.js** et des fichiers JSON. Le modèle sémantique fonctionne côté navigateur ; aucune clé API n'est requise.

### Structure du projet

```text
src/
  app/                  Interface Next.js (page, layout, CSS)
  data/
    cases/              Les cinq scénarios cliniques JSON
    rubrics/            Les barèmes de chaque cas
  lib/
    patientEngine.js    Réponses du patient / reconnaissance d'intentions
    semanticEngine.js   Similarité sémantique dans le navigateur
    arbitrationEngine.js
    examinerEngine.js
    smartExaminer.js
    diagnosticGuard.js
    feedbackEngine.js
tests/                  Tests automatisés du prototype
```

### Démonstration et utilisation

1. Sélectionner un cas clinique.
2. Activer l'IA sémantique si souhaité et attendre le statut « prêt ».
3. Poser des questions au patient et sélectionner les examens.
4. Renseigner l'évaluation initiale, le diagnostic et la prise en charge.
5. Terminer et consulter la correction, puis l'historique de progression.

**Déploiement :** projet hébergé via Vercel à partir du dépôt GitHub. **Démo :** https://clinicaai-6ddm7vuwh-lina-ecee.vercel.app/

### Limites, sécurité et confidentialité

- **Usage pédagogique uniquement.** Ne pas employer pour diagnostiquer ou traiter une personne réelle.
- Les cas peuvent s'appuyer sur des publications anciennes (notamment de 2011 à 2013). **Une revue médicale indépendante et une actualisation des recommandations sont nécessaires** avant toute utilisation pédagogique encadrée.
- Les sorties peuvent comporter des **faux positifs et faux négatifs** : ni les scores ni la compréhension sémantique n'ont fait l'objet d'une validation clinique ou psychométrique indépendante.
- Les formulations complexes, négations, indications d'examens et traitements peuvent être mal interprétés.
- Le suivi conserve les **scores localement dans le navigateur** (`localStorage`), pas les échanges complets avec le patient ; il peut disparaître si le stockage est effacé. Ne pas saisir de données médicales personnelles réelles.
- Les éléments de correction placés dans les fichiers du site ne constituent **pas un examen sécurisé** ; un étudiant techniquement averti peut inspecter les ressources publiques.
- Avant diffusion à grande échelle : revoir les droits des documents et images, exécuter les tests, examiner `npm audit` et faire valider les barèmes par des cliniciens/enseignants.

### Sources cliniques et références

Les scénarios ont été élaborés à partir de supports pédagogiques et de publications sur l'embolie pulmonaire. Les références ci-dessous servent à contextualiser le projet et **ne signifient pas que tous les barèmes ont été validés par ces organismes**.

- [AHA/ACC — Recommandations 2026 sur l'embolie pulmonaire aiguë](https://professional.heart.org/en/science-news/2026-guideline-for-the-evaluation-and-management-of-acute-pulmonary-embolism-in-adults)
- [ESC/ERS — Recommandations 2019 sur l'embolie pulmonaire](https://doi.org/10.1183/13993003.01647-2019)
- Cas pédagogiques sources : références bibliographiques et autorisations de réutilisation à compléter avant la soumission finale.

### Statut du projet

**Prototype fonctionnel — V2.1.** Le moteur, l'interface, le mode ECOS, le rapport et le suivi des scores ont fait l'objet de tests fonctionnels limités. Ce n'est pas un dispositif médical et il n'existe pas encore de validation indépendante de ses performances.

---

## English

### The problem

Medical students need to practice history-taking, choosing appropriate investigations, assessing severity, and proposing management plans. Multiple-choice questions do not always capture the flow of a real clinical consultation.

**ClinicaAI** is an interactive clinical training prototype where learners interview a virtual patient, make decisions, and receive an explainable educational assessment.

### Features — V2.1

- **Five pulmonary embolism scenarios**: postoperative presentation, shock, cardiac comorbidities, pregnancy, and intermediate-risk presentation.
- **Free-text patient interviews** in French, with replies restricted to case-defined information.
- **Hybrid dialogue engine**: rule-based intent recognition plus browser-side semantic embeddings, with arbitration and safeguards for undocumented facts.
- **Investigation selection** with scenario-defined findings.
- **Hybrid examiner**: an indicative 100-point rubric, recognition of selected medical synonyms, and partial safeguards for negations and high-stakes decisions.
- **Timed OSCE-style mode**: 10- or 15-minute sessions.
- **Explainable feedback**: recognized criteria, missing or unrecognized elements, revision suggestions, and copyable reports.
- **Progress tracking**: browser-local score history and CSV export.

### Indicative scoring rubric

| Area | Points |
|---|---:|
| History-taking | 20 |
| Investigations | 25 |
| Initial assessment and severity | 20 |
| Diagnostic hypothesis | 15 |
| Management plan | 20 |
| **Total before penalties** | **100** |

Scores are **experimental** and are not a validated measure or certification of clinical competence.

### How the AI works

ClinicaAI **does not use a generative large language model**.

- Clinical cases and marking rubrics are stored in **JSON**.
- A **rule-based engine** handles known questions and criteria.
- A multilingual **embedding model running in the browser via Transformers.js** helps identify semantically similar questions.
- **Arbitration and guardrails** aim to prevent answers that are not supported by the scenario.
- The examiner uses primarily controlled scoring criteria, with limited semantic assistance; high-stakes treatment decisions are not approved solely based on text similarity.

The model may need to download on first use. Browser and device performance vary, and rule-based fallback remains available.

### Run locally

Requirements: Node.js and npm.

```bash
git clone https://github.com/linalina-03/clinicaai.git
cd clinicaai
npm install
npm run dev
```

Open http://localhost:3000.

For a production build:

```bash
npm run build
npm run start
```

**Stack:** Next.js 16, React, JavaScript/TypeScript, Transformers.js, JSON. No paid AI API key is required.

### Project layout

```text
src/app/          Next.js user interface
src/data/cases/   Five clinical scenarios
src/data/rubrics/ Case-specific scoring rubrics
src/lib/          Patient, semantic, arbitration and grading engines
tests/            Prototype tests
```

### Quick demo

1. Choose a scenario.
2. Optionally enable semantic AI and wait until it is ready.
3. Interview the patient and request investigations.
4. Enter initial assessment, diagnosis, and management.
5. Finish the simulation and review feedback and progress history.

**Live demo:** https://clinicaai-6ddm7vuwh-lina-ecee.vercel.app/

### Clinical, technical and privacy limitations

- **Education only. Not for real-world diagnosis or treatment.**
- Some source teaching materials are historical; clinical content and rubrics require **independent expert review** against current guidance.
- Semantic matches and scoring can produce false positives or false negatives. **No independent clinical or psychometric validation** has been completed.
- Complex negations, investigation choices and treatment decisions may be misclassified.
- Score history is stored in **browser localStorage**; full patient conversations are not stored in the progression log. Do not enter real personal health information.
- Publicly delivered case data and rubrics are inspectable, so this is **not a secure proctored examination**.
- Before broader release, review dependency vulnerabilities, permissions for any third-party materials, and clinical accuracy.

### References

- [2026 AHA/ACC acute pulmonary embolism guideline](https://professional.heart.org/en/science-news/2026-guideline-for-the-evaluation-and-management-of-acute-pulmonary-embolism-in-adults)
- [2019 ESC/ERS pulmonary embolism guideline](https://doi.org/10.1183/13993003.01647-2019)
- Detailed citations and reuse permissions for historical educational cases should be completed before final submission.

### Project status

**Working educational prototype — V2.1.** Selected end-to-end interactions have been tested. This is **not a medical device** or a clinically validated assessment system.

---

*ClinicaAI — Learn clinical reasoning through simulation.*
