# ClinicaAI V1.5 — 5 cas EP, sans API

## Installation dans le projet Next.js existant

1. Sauvegarder votre dossier `clinicaai`.
2. Copier **les trois dossiers** `src/app`, `src/data`, `src/lib` de cette archive dans votre projet en conservant **src/app/layout.tsx** et **src/app/globals.css** existants. Ne pas effacer les autres fichiers.
3. Dans CMD, à la racine du projet : `npm run dev`.
4. Ouvrir `http://localhost:3000`. Choisir les cinq cas dans la liste.
5. Pour validation : `npm run build`. En cas d'erreur, envoyer le message complet.

L'archive est une **mise à jour** de votre projet Next.js et non une application autonome. N'exécutez pas `npm install` depuis ce dossier extrait : utilisez votre projet déjà créé.

## Contenu

- `src/data/cases/` : 5 fiches patient (4 sources historiques + 1 simulation fictive inspirée de Medscape 2026).
- `src/data/rubrics/` : 5 grilles de correction (20 entretien + 25 examens + 20 triage + 15 diagnostic + 20 prise en charge).
- `src/lib/patientEngine.js` : moteur conversationnel déterministe de la V1.2.
- `src/lib/examinerEngine.js` : notation déterministe de la V1.3 avec adaptations V1.5.
- `src/app/page.tsx` : liste des 5 cas et interface de V1.4 adaptée.
- `tests-v15.mjs` : vérifications automatisées exécutables via `node tests-v15.mjs` **depuis le dossier extrait**.

## Références et traçabilité

Cas 1 — Ouar, *Cas cliniques*, p. 2–11 : patiente postopératoire 45 ans. Le document ne fournit pas tous les examens ; ces résultats restent non documentés.

Cas 2 — UMVF, *Évaluations TVP/EP*, p. 2–4 : femme de 68 ans en choc et embolies bilatérales.

Cas 3 — *cas-clinique-embolie-pulmonaire*, p. 1–14 : homme de 74 ans avec insuffisance cardiaque et TVP proximale ; les diagnostics intriqués ne sont pas artificiellement réduits à une EP simple.

Cas 4 — Ferreira dos Santos et al., *Pregnancy and acute pulmonary embolism*, Rev Port Cardiol 2012;31:389–394, p. 2–3 : grossesse 29 SA, hypotension, angioscanner positif. Données historiques du cas conservées, protocole de thrombolyse historique **non prescrit par l'application**.

Cas 5 — **Patient fictif** élaboré à partir du référentiel général Ouellette et al., *Pulmonary Embolism (PE)*, Medscape, mis à jour le 27 août 2026, en particulier classification A–E, démarche diagnostique et retentissement VD. Toutes les valeurs individuelles du patient sont inventées pour la simulation et identifiées comme telles.

## Précautions

- La classification 2026 est documentée séparément de l'histoire des patients. L'application ne prétend pas remplacer les recommandations complètes de l'AHA/ACC, de l'ESC ou une revue clinique.
- Il s'agit d'une **évaluation par présence de mots / expressions** : erreurs possibles avec négations, périphrases et décisions complexes. Les scores ne constituent pas une validation médicale, même si les tests de calcul passent.
- Certaines affirmations de Medscape peuvent demander une vérification plus détaillée à l'aune des recommandations originales. Ne pas utiliser ce prototype pour soigner des patients réels.
- Aucune donnée de patient réel identifiable ne doit être saisie.
- Les images des articles sont soumises à leurs droits ; cette archive n'en contient pas.
