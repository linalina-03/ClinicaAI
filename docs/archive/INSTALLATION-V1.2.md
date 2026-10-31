# ClinicaAI V1.2 — mise à jour moteur de dialogue

## Installation dans le projet Next.js existant
1. Fais une copie de sauvegarde de `src/lib/patientEngine.js`.
2. Copie **seulement** `src/lib/patientEngine.js` de ce ZIP vers `clinicaai/src/lib/patientEngine.js`.
3. (Facultatif) Copie `tests/dialogue-v12.test.mjs` dans `clinicaai/tests/`.
4. Ne remplace pas `package.json`, `src/app/page.tsx`, `src/app/layout.tsx` ou `globals.css`.
5. Exécute `npm run dev` et teste l'interrogatoire dans http://localhost:3000.

## Tests
Le module autonome de ce ZIP peut être testé avec : `npm test` dans le dossier `clinicaai-ep`.
Si tu ajoutes uniquement le fichier de test à ton projet Next.js, lance `node --test tests/dialogue-v12.test.mjs`.

## Modifications
- Séparation des intentions « douleur au mollet » / « opération de la jambe ».
- Séparation « médicaments » / « maladies antérieures ».
- Reconnaissance d'expressions complètes prioritaires, puis mots isolés et fautes simples.
- Refus de fournir une information absente de la fiche ; réponses du patient inchangées.
- Barème V1.1 conservé tel quel afin de ne pas modifier des notes existantes sans validation.

## Limites à ne pas masquer au jury
Ce système n'est pas une IA générative. Il est basé sur des règles et des cas JSON.
Des questions multi-intentions, des paraphrases inédites et les négations complexes peuvent produire une mauvaise correspondance.
Le barème reste expérimental et les « priorités cliniques » sont auto-déclarées via des cases à cocher, pas observées par un examinateur.
Les sources de cas cliniques sont anciennes et des décisions thérapeutiques nécessitent validation par un clinicien et par les recommandations actuelles.
