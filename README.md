# Majorque Playbook 2.1.0

## Corpus interne figé

La version 2.1.0 introduit une couche de données structurée et sourcée :

- `data/corpus.json` : lieux + expériences validés, tags, contraintes, services, statut Must, niveau de preuve, source, date de vérification ;
- `data/collections.json` : collections éditoriales Kairos (Must, snorkeling documenté, famille, adrénaline, Tramuntana, etc.) ;
- `data/source_policy.json` : règles de provenance et de validation.

Le corpus est séparé de l'interface afin de pouvoir faire évoluer les recommandations sans réécrire les cartes HTML.

L'espace Papa est conservé avec le code 1512 et l'auto-verrouillage 15 min.

# Majorque Playbook 2.0.4

PWA familiale experience-first. Navigation principale : Découvrir, Kairos, Explorer, Notre séjour, Papa. Les vues détaillées historiques restent accessibles par les cartes et collections. Espace Papa conservé et verrouillé.
