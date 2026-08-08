# 2.1.0 - Corpus figé (2026-08-08)

- Ajout d'un corpus JSON interne sourcé et versionné.
- Ajout de collections éditoriales séparées du corpus brut.
- Ajout d'une politique de sources explicite.
- Cache PWA étendu aux trois fichiers de données.
- Home affiche le nombre d'entités du corpus chargé.
- Papa conservé (code 1512, auto-lock 15 min).


# 2.0.4 — cartes Top 5 réellement actionnables

- Toutes les 30 cartes visuelles des Top 5 sont maintenant cliquables au niveau de la carte entière.
- Lieux déjà documentés : ouverture directe de la fiche filtrée dans Lieux.
- Expériences : ouverture directe de la bonne expérience dans le catalogue (coasteering, canyoning, escalade/DWS, grottes, kayak, train de Sóller, Drach, Cabrera, etc.).
- Lieux sans fiche détaillée : ouverture d’une recherche Maps explicite plutôt qu’un clic sans effet.
- Ajout de l’expérience Escalade / DWS au corpus actionnable.
- Navigation clavier Enter/Espace ajoutée aux cartes.
- Papa et moteur de contraintes conservés.
# Changelog

## 2.0.3 — Navigation profonde fiabilisée
- Corrige le bug mobile où un clic sur une collection (Plages, Adrénaline, Mer, etc.) pouvait afficher le bas de Découvrir au lieu de la cible.
- Le routeur active désormais le bon panneau AVANT de calculer le scroll vers la sous-section.
- Navigation interne sans scroll natif concurrent : History API + routage contrôlé.
- Retour/avance navigateur et ouverture directe d’une URL avec hash gérés.
- Deep-links Home : snorkeling, adrénaline, plages, mer et famille pointent vers leur collection exacte.
- Conserve le moteur de contraintes 2.0.1 : Camp de Mar préservé jusqu’au 10 août et préférence sans pique-nique.
- Espace Papa conservé, code 1512 et verrouillage automatique.

# 2.0.1 — Contraintes Kairos

- H2O Scuba Academy confirmé : Discover Scuba Diving réalisé à Camp de Mar, juste à côté du centre, profondeur maximale 4–6 m.
- Ajout d’un moteur de contraintes locales : une zone peut être préservée jusqu’à une date spéciale et automatiquement retirée des recommandations.
- Contrainte active par défaut : préserver Camp de Mar jusqu’au 10 août pour le baptême de plongée.
- Préférence active par défaut : éviter les spots explicitement sans services lorsque la sortie implique plage/snorkeling.
- Ajout de l’envie « Snorkeling » dans Kairos.
- Ajout de Cala Santanyí et Cala s’Almunia au corpus de lieux, avec sources officielles.

# Changelog

## 2.0.0
- Refonte experience-first : Découvrir devient la home photo-first.
- Navigation réduite à Découvrir, Kairos, Explorer, Notre séjour, Papa.
- Les anciennes vues restent accessibles depuis les collections et fiches : aucune donnée supprimée.
- Collections Must do / famille / proximité / trajet / aujourd’hui / food.
- Distinction visible entre corpus sourcé et recommandation Kairos.
- Espace Papa conservé, code 1512, auto-verrouillage 15 min.
- Carte Leaflet et géolocalisation conservées.

# 1.9.1 — Explorer lisible et carte robuste

- Corrige les filtres blancs illisibles : couleurs par catégorie + icônes.
- Carte Explorer en plein cadre sur mobile et desktop.
- Correction du rendu Leaflet après ouverture d’un onglet initialement masqué (invalidateSize après activation).
- Marqueurs colorés selon la catégorie.
- Boutons Autour de moi / Voir toute l’île rendus lisibles sur fond clair.
- Service worker versionné pour forcer le rafraîchissement.

# Changelog

## 1.8.0 - Snorkeling documente
- Ajout d'un Top 5 snorkeling sourcé avec photos officielles.
- Classement : Illa del Toro, Cabrera, réserve du Llevant, Cala s'Almunia, Cala Santanyí.
- Scores distincts snorkeling / confort pour éviter de confondre beauté sous-marine et praticité familiale.
- Boutons Maps et sources officielles pour chaque spot.
- Ajout de Cala Sa Nau comme outsider confort.
- Le catalogue Snorkeling renvoie directement vers le Top 5.

## 1.9.0
- Ajout des Top 5 visuels par categorie dans Experiences.
- Plages, adrenaline, famille, nature, decouverte et mer.
- Photos, liens sources et garde-fous activites techniques.

## 1.9.0 source audit - 2026-08-07
- Added explicit source-policy notice to Experiences.
- Diving/baptism category strengthened; family ages 19/16/11 reflected in the decision note without claiming operator availability.
- Active-tourism catalogue grounded in official Balearic tourism sources (diving, snorkeling, kayak, SUP, hiking, climbing, caving, canyoning, coasteering).
- Markets and wine/olive-oil experiences linked to dedicated official sources.
- Clarified that Kairos scores/rankings are editorial; sources validate underlying facts, not the ranking.
