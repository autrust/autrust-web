# Vidéos d’intro (fond selon l’heure)

Vidéos utilisées en arrière-plan de la page d’accueil (`/`).

| Tranche  | Fichier       | Description        |
|----------|---------------|--------------------|
| 6h–8h    | **sunrise.mp4** | Lever du soleil   |
| 8h–12h   | **matin.mp4**   | Matin             |
| 12h–18h  | **jour.mp4**    | Journée           |
| 18h–20h  | **fin-journee.mp4** | Fin de journée  |
| 20h–21h  | **coucher-soleil.mp4** | Couché de soleil |
| 21h–6h   | **nuit.mp4**    | Nuit              |

Pour ajouter d’autres créneaux : ajoute le fichier dans ce dossier, puis mets à jour `getVideoSlot()` et `VIDEO_BY_SLOT` dans `app/page.tsx`.
