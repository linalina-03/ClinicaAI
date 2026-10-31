# ClinicaAI — Simulateur de raisonnement clinique et patient virtuel

**Conception et développement :** Nassr Lina, étudiante en sixième année de médecine, Université Mouloud Mammeri de Tizi Ouzou (Algérie).  
**État :** prototype pédagogique expérimental.

ClinicaAI permet aux étudiants en médecine de s'entraîner à l'interrogatoire, à la sélection d'examens, au raisonnement diagnostique et à la prise en charge, avec un retour indicatif produit par l'IA. Ce n'est ni un dispositif médical ni un outil de certification.

## Problème et public cible

L'apprentissage médical ne se limite pas à la maîtrise des connaissances théoriques : il exige aussi leur mobilisation face à des situations cliniques concrètes, de l'interrogatoire jusqu'aux décisions diagnostiques et thérapeutiques.

L'analyse du **relevé de notes du module Appareil locomoteur**, portant sur **30 étudiants en médecine**, révèle un enjeu pédagogique précis : **83 %** ont obtenu une note supérieure à **10/20** à l'épreuve théorique, contre **32 %** à l'épreuve de cas cliniques, soit **51 points de pourcentage d'écart**. Ces résultats s'appuient sur un document de notes disponible auprès de la porteuse du projet ; ils mettent en lumière le défi du passage de la théorie à la pratique du raisonnement clinique.

**ClinicaAI apporte une réponse pédagogique concrète à ce besoin identifié :** l'étudiant s'exerce en autonomie sur des scénarios interactifs, échange avec un patient virtuel, formule ses hypothèses et reçoit une rétroaction structurée. Le projet s'adresse aux étudiants en médecine qui souhaitent consolider leur raisonnement clinique et mieux se préparer aux évaluations par cas cliniques.

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
