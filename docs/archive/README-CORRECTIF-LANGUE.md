# ClinicaAI V4 — correctif FR/EN (20 octobre 2026)

Source : `file2.zip`, fourni par l'utilisateur.

## Changements

- 44 libellés de la consultation principale sont désormais affichés explicitement selon l'état `language`, sans dépendre exclusivement de la traduction automatique du DOM.
- Boutons et champs importants supplémentaires adaptés (laboratoire, saisie patient, IA locale, examens, constantes BP/HR/RR).
- Les explications du parcours hybride et certains champs de justification sont affichés dans la langue choisie.
- Catégories du benchmark en anglais : `multi-part`, `follow-up`, `rephrasing`, `contextual`, `ambiguous`, `safety`.
- Pré-question de suivi traduite lorsqu'elle correspond à une question prétraduite.
- Tous les fichiers JSON du dossier, les cinq cas, les données du scénario, les trois moteurs et le benchmark sont conservés.
- Aucun appel Gemini ajouté pour ces traductions.

## Installation

1. Décompresser dans un nouveau dossier pour ne pas écraser le projet qui marche actuellement.
2. Copier votre `.env.local` personnel (ne jamais le partager ou le mettre sur GitHub).
3. Ouvrir un terminal dans le dossier contenant `package.json`.
4. Exécuter `npm install` si les dépendances sont absentes, puis `npm run build`, puis `npm run dev`.
5. Vérifier la consultation `/` et le laboratoire `/lab` en EN, FR, puis EN, sans repartir à zéro.

## Contrôles

- 9 tests existants : réussis.
- Analyse syntaxique TypeScript TSX de 4 fichiers : aucune erreur.
- Build Next.js complet et QA navigateur : non exécutés ici.

## Limites

Il reste potentiellement des messages composites produits dynamiquement par les moteurs et certains libellés de résultats/feedback non prétraduits. Les réponses inédites du patient en anglais, en particulier dans les autres cas, doivent être vérifiées cas par cas. Cette mise à jour améliore les défauts signalés, mais elle ne constitue pas une certification d'une application 100 % bilingue.
