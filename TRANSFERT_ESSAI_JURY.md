# Transférer un essai sauvegardé au jury

L'essai visible dans « Anciennes tentatives » est enregistré dans le localStorage du navigateur local et **ne peut pas être récupéré automatiquement à partir du code source**.

## Sur ton ordinateur actuel
1. Ouvre le simulateur ClinicaAI dans le navigateur contenant l'essai.
2. Si nécessaire, clique sur « Enregistrer cet essai pour le reprendre ».
3. Sous « Anciennes tentatives », clique sur **Exporter JSON** en face de l'essai souhaité.
4. Garde le fichier `.json` obtenu. Il contient le dialogue et les réponses sauvegardées ; évite d'y enregistrer de vraies données de patients.

## Sur la version jury
1. Déploie le nouveau projet.
2. Ouvre le simulateur. Dans « Anciennes tentatives », clique sur **Importer un essai (JSON)**.
3. Choisis le fichier exporté.
4. Clique sur **Restaurer l'essai complet / modifier** pour ouvrir l'essai. Les corrections IA peuvent devoir être relancées après modification.

**Pour qu'un essai apparaisse automatiquement chez tous les membres du jury sans import manuel**, il faudra intégrer le JSON exporté au projet après sa réception. Aucun fichier inventé n'a été ajouté à la présente archive.
