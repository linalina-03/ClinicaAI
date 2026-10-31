# ClinicaAI V1.6 — installation (mise à jour V1.5)

## 1. Sauvegarder
Sauvegarder `src/app/page.tsx` et `src/lib/patientEngine.js` du projet existant.

## 2. Installer la dépendance dans le terminal du projet

```cmd
npm install @huggingface/transformers
```

Cette opération exige une connexion Internet. Le modèle est ensuite téléchargé au premier clic sur « Activer IA » ; le navigateur peut le garder en cache, sans garantie de disponibilité hors ligne. Le modèle ne doit pas être considéré comme un dispositif médical.

## 3. Copier seulement ces fichiers

- `src/app/page.tsx` (remplacer)
- `src/lib/semanticEngine.js` (nouveau)

**Conserver** `layout.tsx`, `globals.css`, les cinq JSON et `examinerEngine.js` de V1.5. Le moteur `patientEngine.js` de V1.5 est inchangé.

## 4. Lancer

```cmd
npm run dev
```

Ouvrir `http://localhost:3000`, choisir un cas puis cliquer sur **Activer IA**. Attendre que le statut indique « pret ». Le modèle peut être lourd à charger sur certains ordinateurs et peut échouer derrière des pare-feu. En cas d'échec, l'interrogatoire continue avec le moteur V1.5.

## 5. À vérifier

- Le chargement se termine sur le PC du testeur.
- « Avez-vous été opérée de la jambe ? » ne renvoie pas une réponse sur la douleur du mollet.
- « Avez-vous mal au mollet ? » renvoie la donnée du cas.
- « Quels médicaments prenez-vous ? » ne renvoie pas automatiquement tous les antécédents.
- Une question hors fiche ne doit pas faire inventer de faits.
- Le score final reste identique à celui de la V1.5 pour les mêmes intentions réellement reconnues.

## Limites importantes

- C'est un modèle d'embeddings multilingue, pas un agent conversationnel génératif.
- Pas de compréhension fiable des questions négatives, des phrases multi-intentions ou de toutes les variantes : ces cas sont renvoyés vers clarification quand détectés.
- Les seuils de similarité 0,70 et marge 0,08 sont provisoires, à calibrer sur ≥50 questions annotées avec vérification manuelle.
- Aucun diagnostic réel et aucune évaluation certifiante ; seuls les scénarios fictifs et leurs réponses validées servent de base.
- Le service d'hébergement doit pouvoir servir les fichiers JavaScript du modèle et autoriser son téléchargement ; tester en production avant le jury.

Références techniques : https://huggingface.co/docs/transformers.js ; https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2
