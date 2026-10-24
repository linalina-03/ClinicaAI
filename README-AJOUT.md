# ClinicaAI — ajout du cas EP pendant la grossesse (V1.4)

Cette archive est une **mise à jour incrémentale** pour la V1.3. Elle ne contient pas tout le projet Next.js.

## Installation
1. Sauvegarder `src/app/page.tsx` dans ton projet actuel.
2. Copier `src/data/cases/ep-grossesse.json` et `src/data/rubrics/ep-grossesse.json`.
3. Remplacer `src/app/page.tsx` par le fichier fourni (adapté depuis la V1.3 officielle).
4. Conserver `src/lib/patientEngine.js`, `src/lib/examinerEngine.js`, `src/app/layout.tsx`, `src/app/globals.css` et les trois anciens cas/rubriques.
5. Depuis ton dossier de projet : `npm run dev`, puis ouvrir http://localhost:3000.

## Vérification
Dans le menu des cas, sélectionner « Embolie pulmonaire grave pendant la grossesse (29 SA) ». Demander les symptômes, les antécédents, l'ECG, l'ETT, l'angioscanner et l'évaluation fœtale. Rédiger trois réponses et terminer pour voir le score.

## Provenance et limites
Article Ferreira dos Santos et al., Rev Port Cardiol 2012;31(5):389–394, pp. 390–391. Les données cliniques proviennent du cas publié ; les formulations du dialogue sont des reformulations pédagogiques des observations publiées. L’article est ancien : doses et pratiques historiques ne doivent pas être transposées comme recommandations actuelles. Le barème est illustratif, non validé. Le moteur est déterministe : les négations et synonymes peuvent être mal interprétés.

## Note clinique
Dans l'article, un score de Wells « intermédiaire » est mentionné ; les algorithmes généraux historiques ne doivent pas remplacer une évaluation adaptée à la grossesse et au choc. Une hypotension persistante est un marqueur central d'EP à haut risque. La discussion de reperfusion nécessite une équipe spécialisée et une appréciation du risque de saignement materno-fœtal.

N’ajoute pas d’images du PDF au dépôt public sans vérifier les droits de reproduction de l’éditeur.
