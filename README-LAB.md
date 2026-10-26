# ClinicaAI V3 — Premier laboratoire comparatif

## Installation Windows

1. Décompresser ce ZIP dans un nouveau dossier (ou remplacer les fichiers du projet **après sauvegarde**). Aucun `node_modules` ni clé API n’est inclus.
2. Dans CMD, depuis le dossier ClinicaAI : `npm install` puis `npm run dev`.
3. Dans le dossier du projet, créer le fichier `.env.local` (il est ignoré par Git) contenant :

```ini
GEMINI_API_KEY=VOTRE_CLE_GENEREE_DANS_GOOGLE_AI_STUDIO
GEMINI_MODEL=gemini-2.5-flash-lite
```

4. **Redémarrer** `npm run dev` après toute modification de `.env.local`.
5. Aller sur `http://localhost:3000/lab`. Ne jamais envoyer la clé par message, ni la committer dans Git.
6. Pour Vercel : Project → Settings → Environment Variables → ajouter `GEMINI_API_KEY` et (facultativement) `GEMINI_MODEL` puis redéployer.

## Transparence scientifique

Les règles seules et le modèle sémantique utilisent `src/data/cases/ep-postop.json` tandis que Gemini reçoit les faits synthétiques de `src/data/enrichment/ep-postop-enriched.json`. Le laboratoire démontre la **différence d’expérience**, et non une comparaison valide des performances tant que les trois moteurs ne reçoivent pas les mêmes faits et le même contexte. Le dialogue commun utilise la réponse disponible selon une priorité fixe (générative, sémantique, règles), autre limite expérimentale à corriger avant une étude.

Ne saisissez aucune donnée personnelle réelle. L'API gratuite peut avoir des règles de traitement de données différentes des niveaux payants. Une clé gratuite peut être indisponible selon le compte, le modèle ou le quota. Le serveur limite à 12 requêtes/minute/IP en mémoire, ce qui ne constitue **pas** une protection de production suffisante contre les abus ni les coûts. Ne déployez pas publiquement une API payante sans authentification et limites de dépenses.

## Tests

`npm run build` et `npm test`. Vérifier la route `/lab`, comparer « Qu’est-ce qui vous amène ? », « Avez-vous mal au dos ? », « Vous avez une douleur aux mollets ? » et « Prenez-vous des médicaments ? ». Vérifier aussi la réponse d'erreur lorsque GEMINI_API_KEY est absente.

## Cohérence du dossier postopératoire (V4.6)

La première page et le Lab transmettent maintenant **la même banque enrichie** et les **mêmes instructions de dossier à Gemini** pour `ep-postop`, via `src/lib/commonPostopGemini.js`. Les moteurs locaux français de la première page et du Lab utilisent aussi le même moteur de règles et le même moteur sémantique du Lab pour ce cas. Les réponses peuvent néanmoins varier selon l'historique et la méthode ; l'identité des textes ne constitue pas l'objectif scientifique. Les ajouts du dossier sont fictifs, destinés à la pédagogie et à valider par un médecin. La comparaison n'est pas une validation clinique achevée.
