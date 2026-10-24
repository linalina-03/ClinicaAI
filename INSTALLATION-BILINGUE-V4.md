# ClinicaAI — version bilingue FR / EN (prototype V4)

## Objectif
La consultation et le laboratoire comparatif démarrent en anglais pour les nouveaux visiteurs. Le sélecteur FR/EN permet de revenir au français. La langue est mémorisée dans le navigateur.

## Données traduites et travail hors API
- 5 cas : titre, introduction, diagnostic, gravité, **29 réponses cliniques** et **34 résultats d'examens** prétraduits en anglais, reliés aux identifiants français.
- Mme N. : **87 réponses d'enrichissement** et 87 conseils pédagogiques anglais. Les faits ajoutés restent **fictifs**, non issus du cas publié.
- 100 questions de benchmark et leurs références prétraduites.
- 112 traductions d'interface supplémentaires, et aides cliniques en anglais.
- Les textes prétraduits ne nécessitent plus Gemini pour être affichés. Les fichiers d'origine française sont conservés avec les champs *_en.

## Fonctions encore liées à Gemini
La génération de réponses inédites du laboratoire et les trois correcteurs pédagogiques Gemini utilisent toujours l'API. L'anglais est demandé directement au modèle quand il est sélectionné ; aucune requête de traduction supplémentaire n'est nécessaire pour les contenus fixes.

## Limites connues à tester avant toute publication
1. L'interrogatoire libre anglais fonctionne avec un dictionnaire local d'intentions et les réponses anglaises prétraduites. Il **ne garantit pas** la compréhension de toute phrase spontanée : le moteur annonce que l'information n'est pas reconnue lorsque nécessaire. Le moteur français historique est préservé.
2. La notation sur 100 en anglais utilise une passerelle lexicale expérimentale vers les règles françaises. Les scores ne sont pas équivalents ni certifiés : une validation par les médecins reste indispensable.
3. Pour comparer équitablement règles et sémantique dans le benchmark en anglais, sélectionner une des 100 questions traduites. Pour une question anglaise personnalisée, les moteurs locaux affichent une limitation au lieu de produire un résultat trompeur. Gemini peut continuer si son quota le permet.
4. Certaines informations secondaires du feedback historique (notamment le rapport algorithmique original) peuvent rester en français ; ne pas les confondre avec les réponses cliniques traduites.
5. La traduction médicale est une rédaction pédagogique de travail, **non validée par les médecins**. La correspondance factuelle doit être contrôlée avant le concours.
6. Les essais du benchmark existants sont conservés en langue source lors des exports afin de ne pas modifier les données expérimentales.

## Installation sous Windows
1. **Sauvegarder** le dossier `clinicaai` précédent, surtout son `.env.local` (ne l'envoyer à personne).
2. Décompresser cette archive dans un **nouveau dossier**. La racine doit contenir `package.json` et `src`.
3. Copier votre fichier `.env.local` personnel dans cette nouvelle racine, sans mettre la clé dans GitHub.
4. Ouvrir CMD à la racine et exécuter :

   ```cmd
   npm install
   npm run build
   npm run dev
   ```

5. Tester `http://localhost:3000` puis `http://localhost:3000/lab`.
6. Changer la langue FR → EN → FR, et vérifier séparément les cinq cas et leurs examens.
7. Si l'ancienne préférence FR reste enregistrée dans le navigateur, sélectionner EN une fois via le sélecteur.

## Contrôles réalisés
- 9/9 tests existants (`npm test`) réussis.
- Vérification de la présence de toutes les traductions cliniques prévues.
- Vérification syntaxique TypeScript/TSX des composants et routes modifiés.
- Un build `npm run build` complet n'a pas été réalisé dans cet environnement, faute d'une dépendance npm disponible hors ligne. Le vérifier localement avant déploiement.

## Intégrité des expériences
Ne pas mélanger les nouveaux essais en anglais aux résultats français déjà remis aux médecins sans documenter le changement de langue et de protocole. Les 100 questions initiales et le fichier de résultats déjà récolté ne sont pas modifiés.
