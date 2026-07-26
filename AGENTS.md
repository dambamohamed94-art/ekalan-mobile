# AGENTS.md — EKALAN MOBILE

Version : 1.0

## Présentation

Ce projet contient la version Mobile officielle d'EKALAN.

Technologies principales :

- Expo
- React Native
- Expo Router
- TypeScript

La version Mobile partage le même backend que la version Web.

Aucune logique métier ne doit être dupliquée lorsque celle-ci existe déjà sur le serveur.

---

# Mission du projet

Développer une application mobile moderne permettant :

- aux élèves d'apprendre ;
- aux parents de suivre leurs enfants ;
- aux enseignants d'accompagner leurs élèves.

Le projet Mobile doit rester synchronisé avec le backend EKALAN.

---

# Architecture

Le projet utilise Expo Router.

Organisation générale :

app/
src/
components/
services/
hooks/
constants/
assets/

Ne jamais modifier cette architecture sans justification.

---

# Sources de vérité

Le backend est la référence.

Les API existantes doivent être réutilisées.

Le Mobile ne recrée jamais une logique métier déjà présente sur le serveur.

---

# IA Sacko

L'IA Sacko existe déjà dans le projet Web.

Le Mobile doit uniquement :

- utiliser les API existantes ;
- proposer une interface adaptée au mobile.

Ne jamais recréer un moteur IA local.

---

# Priorités

Toujours suivre :

ROADMAP-MOBILE.md

Les développements doivent respecter les phases validées.

Ne jamais sauter une phase sans validation.

---

# Développement

Avant toute modification importante :

1. analyser les impacts ;
2. proposer une stratégie ;
3. attendre validation si nécessaire.

Ne jamais effectuer de modifications massives sans analyse.

---

# Qualité du code

Produire un code :

- simple ;
- lisible ;
- modulaire ;
- maintenable.

Limiter les duplications.

Privilégier les composants réutilisables.

---

# Navigation

Utiliser Expo Router.

Respecter l'organisation des écrans.

Ne jamais casser les routes existantes.

---

# Services

Toute communication avec le serveur passe par :

src/services/

Ne jamais appeler directement les API depuis les écrans lorsque des services existent.

---

# Interface

Respecter la charte graphique EKALAN.

Couleurs :

- Bleu EKALAN
- Vert EKALAN

Éviter les couleurs non prévues par la charte.

L'interface doit être :

- moderne ;
- fluide ;
- responsive ;
- adaptée Android et iOS.

---

# Performances

Limiter les re-renders.

Optimiser les listes.

Éviter les calculs inutiles.

Ne jamais dégrader les performances sans raison.

---

# Tests

Après chaque développement :

Vérifier :

- compilation ;
- navigation ;
- écrans ;
- appels API ;
- formulaires ;
- authentification.

Signaler les anomalies détectées.

---

# Ce que Codex peut modifier

- composants React Native
- pages
- services
- navigation
- styles
- hooks
- types
- assets
- configuration Expo lorsque nécessaire

---

# Ce que Codex ne doit jamais faire

Ne jamais :

- modifier directement le projet Web ;
- modifier la base de données ;
- modifier le backend ;
- modifier les API du serveur.

Ces évolutions appartiennent au projet Web.

---

# Documentation

À la fin d'une tâche importante :

Présenter :

- les fichiers modifiés ;
- les raisons des modifications ;
- les tests réalisés ;
- les actions manuelles restantes.

---

# Workflow officiel

Pour une nouvelle fonctionnalité :

1. Lire AGENTS.md.
2. Consulter ROADMAP-MOBILE.md du Workspace.
3. Réaliser uniquement la phase validée.
4. Tester.
5. Documenter les modifications.

---

# En cas de besoin côté serveur

Si une évolution nécessite une modification :

- API
- Backend
- Base de données

Ne jamais modifier ces éléments.

Les documenter dans le rapport de fin de tâche afin qu'ils soient réalisés dans le projet Web.

---

# Objectif

Construire une application mobile EKALAN stable, performante, évolutive et parfaitement synchronisée avec la plateforme Web.