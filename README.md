# ClinicaAI — Simulateur de raisonnement clinique et patient virtuel

**Conception et développement :** Nassr Lina, étudiante en sixième année de médecine, Université Mouloud Mammeri de Tizi Ouzou (Algérie).  
**État :** prototype pédagogique expérimental.

ClinicaAI permet aux étudiants en médecine de s'entraîner à l'interrogatoire, à la sélection d'examens, au raisonnement diagnostique et à la prise en charge, avec un retour indicatif produit par l'IA. Ce n'est ni un dispositif médical ni un outil de certification.

## Problème et public cible

La résolution de cas cliniques exige de mobiliser des connaissances dans un contexte d'incertitude. Lors d'une observation descriptive portant sur 30 étudiants dans un module locomoteur, 83 % ont dépassé 10/20 en théorie, contre 32 % à l'épreuve clinique. Ces valeurs sont déclaratives et non auditées; elles ne prouvent ni l'origine de cet écart ni l'efficacité de ClinicaAI. Le public visé est celui des étudiants souhaitant préparer les cas cliniques et travailler de façon autonome.

## Fonctionnement

1. Choisir un scénario clinique fictif.
2. Interroger le patient virtuel en langage naturel.
3. Sélectionner les examens complémentaires et analyser les résultats disponibles.
4. Rédiger l'évaluation de la gravité, les hypothèses diagnostiques et la conduite à tenir.
5. Terminer l'essai pour obtenir une note pédagogique indicative sur 100 et une rétroaction section par section.
6. Sauvegarder ou restaurer une tentative et consulter le PDF de démonstration.

## Choix technologique et comparaison

Le dialogue principal est assuré par une **IA générative** via l'API Google Gemini, côté serveur. Une exploration initiale menée sur un petit échantillon a motivé ce choix sans établir sa supériorité. Le laboratoire de comparaison examine trois approches : règles explicites, rapprochement sémantique et génération. Le benchmark contient 100 questions : Q01–Q50 pour le développement et Q51–Q100 pour l'évaluation. Les données de référence et les réponses doivent être harmonisées avant toute comparaison crédible.

## Vérification médicale et limites

Le portail de validation peut importer des réponses anonymisées A/B/C et enregistrer des évaluations de compréhension, fidélité clinique, naturel et inventions potentielles. Deux médecins ont apporté des retours préliminaires, mais aucune validation indépendante et complète des 100 questions par chacun n'est établie. Des fichiers de notation générés par IA sont **simulés** et ne doivent jamais être présentés comme des avis médicaux indépendants. Les scores ne certifient pas les compétences des étudiants. Les cas restent fictifs, le stockage des tentatives est local au navigateur, et les réponses générées peuvent comporter des erreurs.

## Architecture technique

- Next.js 16, React 19, TypeScript, JavaScript et Tailwind CSS.
- API Google Gemini pour les fonctions génératives (clé serveur `GEMINI_API_KEY`).
- Interface principale : `src/app/page.tsx`; laboratoire : `src/app/lab/page.tsx`; validation : `src/app/validation/`.
- Scénarios et questions : `src/data/`; données de session : `localStorage`.

## Installation locale

```bash
git clone https://github.com/linalina-03/clinicaai.git
cd clinicaai
npm install
# Configurer GEMINI_API_KEY dans .env.local (ne jamais publier la clé)
npm run dev
```

Ouvrir http://localhost:3000. Contrôler `npm test` et `npm run build` avant publication. Un déploiement en ligne exige une configuration des secrets côté Vercel.

## Documents et démonstration

- Rapport méthodologique français : `/ClinicaAI_Rapport_Methodologique_FR.pdf`
- Rapport méthodologique anglais : `/ClinicaAI_Methodology_Report_EN.pdf`
- Exemple de tentative fictive (PDF) : `/jury-example-clinical-attempt.pdf`
- Tentative restaurable (JSON) : `/jury-example-saved-attempt.json`

## Prochaines étapes

Mois 1 : élargir et fiabiliser les scénarios, corriger le retour pédagogique et les langues. Mois 2 : réaliser des tests d'utilisabilité documentés avec les étudiants. Mois 3 : organiser une revue médicale indépendante, comparer les erreurs et publier les limites de façon transparente.

**Dépôt :** https://github.com/linalina-03/clinicaai

**Sécurité :** uniquement pour la formation; ne pas introduire de véritables données de patients ni utiliser les réponses pour des décisions cliniques.
