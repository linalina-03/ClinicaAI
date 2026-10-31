# ClinicaAI V1.3 — Installation

1. Sauvegarder `src/app/page.tsx` avant modification.
2. Copier **les fichiers `src/app/page.tsx`, `src/lib/examinerEngine.js` et tout `src/data/rubrics/`** dans le projet existant.
3. Conserver `src/app/layout.tsx`, `src/app/globals.css`, `src/lib/patientEngine.js`, les fichiers `src/data/cases/` et `package.json` du projet existant.
4. Redémarrer `npm run dev`.
5. Essayer le cas EP avec choc : rédiger des réponses dans les 3 zones de texte puis terminer la consultation.

Tests : `node --test tests/examiner-v13.test.mjs` (copier le fichier de test dans le dossier `tests/` du projet).

## Limites

- Le correcteur reconnaît des expressions attendues ; ce n'est **pas** un LLM ni une compréhension médicale complète.
- Des réponses correctes formulées différemment peuvent être sous-notées ; les négations complexes restent risquées.
- L'ensemble des règles et barèmes téléchargés est visible en navigateur ; pas de sécurisation anti-triche.
- Le contenu se base sur les cas PDF transmis (certains historiques) ; les règles pédagogiques doivent être révisées par un clinicien avant tout usage évaluatif réel.
- Les valeurs absentes des supports ne sont pas inventées. Aucun usage pour décision clinique réelle.
