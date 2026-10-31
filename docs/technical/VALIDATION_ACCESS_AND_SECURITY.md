# ClinicaAI V4.6 — Jury-access Physician Validation

Le portail `/validation` est maintenant utilisable sur Vercel après connexion par code d'accès **vérifié côté serveur**. Le simulateur et `/lab` restent accessibles normalement.

## Installation locale Windows

1. Sauvegarder l'ancien dossier du projet (et notamment `.env.local`).
2. Décompresser le ZIP V4.6 dans un **nouveau dossier** (`Desktop\\clinicaai-v46`).
3. Copier ton ancien fichier `.env.local` à la racine du nouveau projet. Il n'est PAS inclus dans le ZIP.
4. Ajouter dans `.env.local` :

```env
GEMINI_API_KEY=ta_cle_api_gemini
PHYSICIAN_REVIEW_ACCESS_CODE=un_code_aleatoire_de_12_caracteres_ou_plus
PHYSICIAN_REVIEW_SESSION_SECRET=un_secret_aleatoire_independant_de_32_caracteres_ou_plus
```

Ne pas utiliser les exemples littéralement : choisir **deux valeurs secrètes différentes**, longues et imprévisibles. Ne jamais mettre `NEXT_PUBLIC_` devant ces variables.

Dans CMD :

```cmd
cd /d "%USERPROFILE%\\Desktop\\clinicaai-v46"
npm install
npm run build
npm run dev
```

Ouvrir `http://localhost:3000/validation`. Le code d'accès est requis **en local aussi**.

## Déploiement Vercel

1. Envoyer les fichiers V4.6 vers le dépôt GitHub lié à Vercel. Ne jamais ajouter `.env.local` à Git.
2. Dans Vercel > Project > Settings > Environment Variables, enregistrer `GEMINI_API_KEY`, `PHYSICIAN_REVIEW_ACCESS_CODE` et `PHYSICIAN_REVIEW_SESSION_SECRET` pour l'environnement Production (et Preview si désiré).
3. Redéployer et vérifier : `/validation` ouvre le formulaire d'accès ; un mauvais code est rejeté ; un bon code ouvre le portail ; le bouton « Sign out » ferme la session.
4. Tester `/api/validation-ai` sans connexion : doit répondre `401`. Après connexion, tester une seule analyse Gemini et vérifier le quota.
5. Partager le code d'accès uniquement avec les jurés autorisés. Le modifier après la démonstration.

## Limites de sécurité et méthode

- Code partagé **de démonstration**, et non authentification individuelle forte : chaque juré n'a pas de compte personnel, pas de révocation individuelle ni de journal d'audit centralisé.
- Protection par cookie HttpOnly signé, durée 8 heures, SameSite strict, HTTPS sur Vercel ; API Gemini refuse les requêtes non authentifiées.
- Limitation d'essais en mémoire : protection élémentaire, **pas une limite globale garantie sur Vercel**. Ne pas exposer de données de patients réels.
- Les dossiers contiennent des cas pédagogiques fictifs ou synthétiques non validés. Le contenu ne doit pas servir à des décisions de soins.
- Les évaluations des médecins restent dans **localStorage**, sur le navigateur de chacun. Un code partagé ne partage PAS leurs évaluations. Exporter les CSV avant de fermer/réinitialiser le navigateur.
- Gemini peut occasionner des frais/quotas. Ne pas laisser le code de démonstration circuler publiquement.
- Pour des comptes médecins réels, il faudra ultérieurement une authentification individuelle, des autorisations et un stockage sécurisé.

## Contenu préservé

- Simulateur clinique cinq cas bilingues.
- Laboratoire comparatif avec benchmark de 100 questions et export.
- Portail médical deux colonnes, dossier clinique à droite, anglais/français, vérification gratuite et Gemini optionnel.
- Les 165 assertions, notes et scores historiques ne sont pas modifiés.
