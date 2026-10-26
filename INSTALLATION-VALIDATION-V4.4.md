# ClinicaAI — Physician Validation V4.4

## Installation dans le projet actuel

Copier uniquement :

- `src/data/validation/portal.html` → même dossier dans votre projet.

Conserver les pages `src/app/page.tsx`, `src/app/lab/page.tsx`, `src/app/validation/page.tsx`, ainsi que la route API et votre `.env.local` actuels.

Dans CMD :

```cmd
cd /d "%USERPROFILE%\Desktop\clinicaai"
npm run dev
```

Ouvrir http://localhost:3000/validation

## Changements

- Une seule langue visible pour la proposition à valider (EN ou FR) ; la décision de traduction est masquée car elle ne peut pas être évaluée à partir d'une seule langue.
- Dossier de référence intégré à la page, accessible sans navigation et organisé en quatre onglets : résumé, interrogatoire, examens, données du scénario.
- Cinq cas ; seul le cas postopératoire contient 87 réponses complémentaires du scénario.
- Contrôles gratuits et Gemini toujours sur demande ; Gemini affiche sa correction uniquement dans la langue choisie. Les données historiques et les décisions locales restent préservées.

## Limites

- La source originale n'est pas accessible directement ni vérifiée automatiquement. L'onglet reproduit le contenu des JSON de l'application, non une preuve documentaire indépendante.
- Certaines rubriques ne sont pas disponibles dans les deux langues dans les données d'origine : afficher « Not documented » plutôt qu'inventer une traduction ou une information.
- Prototype en local, non sécurisé pour une publication ouverte ; les évaluations doivent être exportées régulièrement.
- `npm run build` doit encore être exécuté sur votre poste.
