# Phase 1 — Audit EKALAN MOBILE

Date : 21 juillet 2026  
Périmètre : `C:\xampp\htdocs\ekalan-mobile` uniquement  
Référence : `C:\xampp\htdocs\ekalan-workspace\roadmap\ROADMAP-MOBILE.md`

## 1. Synthèse

L'application est un prototype Expo Router déjà bien avancé visuellement sur le parcours élève, mais elle n'est pas prête pour une phase de correction ou de connexion backend complète.

- Lint : réussi (`npm run lint`).
- Compilation TypeScript stricte : échouée (`npx tsc --noEmit`) avec 2 erreurs.
- Navigation : routes présentes et liens internes globalement cohérents, mais le parcours interactif complet n'a pas pu être validé dans Expo Web, le serveur de test ayant échoué en mode normal sur une requête réseau puis n'étant pas resté accessible au navigateur en mode hors ligne.
- Authentification : écrans et services présents, mais gestion de session incomplète et retours utilisateur insuffisants.
- Parcours élève : matières, chapitres et leçons partiellement implémentés ; quiz et exercices sont des écrans d'attente.
- Parent : inscription et écran d'attente présents, sans vrai tableau de bord de suivi.
- Enseignant : absent au-delà d'un écran placeholder.
- IA Sacko : absente ; seuls des `console.log` annoncent une future génération IA.

## 2. Fichiers et dossiers analysés

### Références et configuration

- `AGENTS.md`
- `C:\xampp\htdocs\ekalan-workspace\roadmap\ROADMAP-MOBILE.md`
- `package.json`, `package-lock.json`
- `app.json`, `eas.json`, `tsconfig.json`, `eslint.config.js`
- état Git du dépôt mobile

### Navigation et écrans

- `app/_layout.tsx`, `app/index.tsx`
- `app/onboarding.tsx`, `app/login.tsx`, `app/role-selection.tsx`
- `app/register-student.tsx`, `app/register-parent.tsx`, `app/register-teacher.tsx`, `app/register-success.tsx`
- `app/(tabs)/_layout.tsx`, `dashboard.tsx`, `courses.tsx`, `progress.tsx`, `profile.tsx`, `index.tsx`, `explore.tsx`
- `app/subject.tsx`, `chapter.tsx`, `lesson.tsx`, `quiz.tsx`, `exercise.tsx`

### Données, services et présentation

- `src/api/client.ts`
- `src/services/authService.ts`, `classService.ts`, `courseService.ts`, `progressService.ts`, `studentService.ts`
- `src/storage/userStorage.ts`
- `src/types/user.ts`
- `src/theme/colors.ts`, `spacing.ts`, `radius.ts`
- `components/`, `components/ui/`, `hooks/`, `constants/`
- `assets/images/`

## 3. Architecture observée

- Expo 54, React Native 0.81, React 19, Expo Router 6 et TypeScript strict.
- Routage par fichiers dans `app/` avec une pile racine et quatre onglets visibles.
- Couche réseau Axios centralisée dans `src/api/client.ts`.
- Services métier partiels dans `src/services/`.
- Persistance locale minimale de l'utilisateur via AsyncStorage.
- Thème EKALAN partiellement centralisé, mais de nombreuses couleurs et dimensions restent codées directement dans les écrans.
- Plusieurs composants et l'écran `explore.tsx` proviennent encore du template Expo et ne participent pas réellement à l'application.

## 4. État des fonctionnalités

| Domaine | État | Constat |
|---|---|---|
| Onboarding | Disponible, à valider sur appareils | Carrousel de 4 pages, accès inscription et connexion. Aucun état persistant pour ne l'afficher qu'une fois. |
| Choix du rôle | Disponible | Parent, élève et professeur routent vers leurs pages respectives. |
| Connexion | Incomplète | Appel API et redirection présents. Pas d'indicateur de chargement, message d'erreur visible, validation de formulaire, récupération de mot de passe ni gestion explicite de jeton/session. |
| Inscription élève | Partielle | Formulaire en 2 étapes, récupération des classes et appel d'inscription. Les erreurs ne sont affichées que dans la console. Le champ « Quartier » est envoyé comme `objective`, ce qui paraît incohérent. |
| Inscription parent | Partielle | Formulaire et appel API présents. Aucun retour d'erreur visible ; liaison enfant différée et non fonctionnelle dans l'app. |
| Inscription enseignant | Absente | Simple texte « Inscription Prof », aucun formulaire ni appel au service pourtant existant. |
| Déconnexion | Défectueuse / non validée | Le bouton et le service existent, mais l'erreur du POST peut remonter et empêcher la redirection. L'état d'authentification du layout racine n'est pas réactif. Ceci correspond au défaut déjà annoncé en phase 3 de la roadmap. |
| Dashboard élève | Très incomplet | Carte de bienvenue statique, aucune donnée pédagogique réelle. |
| Dashboard parent | Très incomplet | Écran d'attente de validation uniquement, aucun suivi d'enfant. |
| Dashboard professeur | Absent | Le professeur reçoit le dashboard générique élève/non-parent. |
| Matières | Partielle | Liste issue de `/student/home`, cartes et navigation vers une matière. Aucun état d'erreur ou état vide explicite. |
| Chapitres | Partielle | Chargement et navigation présents, mais appel API direct depuis l'écran. |
| Leçons | Partielle | Affichage texte et marquage « terminé » présents. Pas de contenu riche, média, vidéo, révision ou gestion visible des erreurs. |
| Quiz | Non fonctionnelle | Métadonnées affichées ; le bouton ne fait qu'un `console.log`. Questions, réponses, score et progression absents. |
| Exercices | Non fonctionnelle | Métadonnées affichées ; le bouton ne fait qu'un `console.log`. Interaction et correction absentes. |
| Progression | Partielle | Vue globale et par matière issue de `/student/home`. Aucun détail, historique ou actualisation après retour d'une leçon. |
| Profil | Très incomplet | Contient uniquement le bouton de déconnexion. |
| IA Sacko | Absente | Aucun écran, service ou accès. Aucun moteur local n'a été créé, conformément à `AGENTS.md`. |
| Notifications / hors ligne / accessibilité | Absentes | Aucun mécanisme identifié. |

## 5. Navigation auditée

### Routes déclarées ou présentes

- Entrée : `/` redirige systématiquement vers `/onboarding`.
- Authentification : `/onboarding` → `/role-selection` ou `/login`.
- Inscriptions : `/role-selection` → `/register-student`, `/register-parent`, `/register-teacher` → `/register-success` → `/login`.
- Session : `/login` → `/(tabs)/dashboard` pour tous les rôles.
- Onglets : dashboard, cours, progression, profil.
- Parcours élève : cours → matière → chapitre → leçon / quiz / exercice.

### Anomalies de navigation

1. Le layout racine lit l'utilisateur une seule fois au montage. Après connexion ou déconnexion, il n'existe ni contexte d'authentification ni abonnement à AsyncStorage pour recalculer son état.
2. `/` redirige toujours vers l'onboarding, indépendamment de la session. La combinaison avec le layout conditionnel rend le comportement de retour et de déconnexion fragile.
3. Tous les rôles sont envoyés vers le même dashboard ; le professeur n'a pas de destination dédiée.
4. Les écrans matière/chapitre/leçon/quiz/exercice ne sont pas explicitement déclarés dans le `Stack` conditionnel, ce qui mérite une validation sur Android et iOS même si Expo Router peut les auto-enregistrer.
5. Les boutons de retour utilisent souvent un positionnement absolu avec des valeurs fixes (`left: -160` ou `-170`), potentiellement hors écran selon la largeur et la plateforme.
6. Le fichier template `app/(tabs)/explore.tsx` reste routable par chemin direct bien que caché des onglets.
7. Aucun écran de route inconnue (`+not-found`) n'a été identifié.

## 6. Anomalies techniques

### Bloquantes

1. La compilation TypeScript échoue :
   - `app/(tabs)/courses.tsx` utilise `item.id`, absent du type `Subject`.
   - `src/services/authService.ts` lit `user.class_id`, absent du type `User`.
2. Le client Axios ne configure ni jeton d'authentification, ni intercepteur, ni `withCredentials`. Le stockage local ne conserve que `id`, `role` et une tentative de `class_id`. La capacité des endpoints protégés à reconnaître la session mobile n'est donc pas démontrée.

### Importantes

1. Violation de la règle `AGENTS.md` : `subject.tsx`, `chapter.tsx`, `lesson.tsx`, `quiz.tsx` et `exercise.tsx` appellent directement `api` au lieu de passer par `src/services/`.
2. Les erreurs réseau et de formulaire sont presque toutes limitées à `console.log`; l'utilisateur voit souvent une page vide ou des valeurs à zéro.
3. Aucun verrou anti-double soumission ni état de chargement sur connexion/inscription/progression.
4. Comparaison potentiellement fragile des identifiants de quiz/exercice (`q.id === quiz`) : un ID numérique renvoyé par l'API ne correspondra pas au paramètre de route chaîne.
5. Les barres de progression injectent directement une valeur API dans une largeur en pourcentage sans bornage entre 0 et 100.
6. `courseService.ts` semble inutilisé et duplique une partie de `studentService.ts` et `progressService.ts`, qui interrogent tous `/student/home`.
7. `registerTeacher()` existe dans le service mais n'est relié à aucun formulaire.
8. Le type `User` déclare `admin`, mais aucun parcours ni garde de rôle n'est défini.

### Interface et qualité

1. L'identité visuelle est partielle : logo bitmap configuré pour l'icône, mais les écrans affichent principalement le texte « E-KALAN » et des emojis.
2. Le thème central inclut violet et cyan en plus du bleu/vert demandé, tandis que beaucoup de couleurs sont dupliquées en dur.
3. Aucun contrôle de contraste, taille de police dynamique, libellé d'accessibilité ou zone sûre systématique n'est visible.
4. Positionnements fixes, grandes marges et barres d'onglets absolues présentent des risques sur petits écrans, tablettes et claviers ouverts.
5. Les formulaires ne gèrent pas explicitement le clavier, l'auto-complétion, la confirmation du mot de passe ou les erreurs par champ.
6. Plusieurs fichiers contiennent encore du code de démonstration Expo inutilisé.
7. Aucun test automatisé, framework de test ou script de test n'est défini dans `package.json`.

## 7. Éléments manquants par rapport à la roadmap

- Phase 2 : identité visuelle finalisée, usage cohérent du logo, splash vérifié, carrousel spécifique à l'IA Sacko.
- Phase 3 : déconnexion robuste et validation complète de la navigation.
- Phase 4 : authentification mobile persistante et vérification contractuelle de toutes les API existantes.
- Phase 5 : vrais dashboards élève, parent et professeur.
- Phase 6 : cours riche, vidéo, révision, quiz interactif, exercices interactifs et progression détaillée.
- Phase 7 : service et interface Sacko réutilisant exclusivement les API Web existantes, avec accès depuis les points prévus.
- Phase 8 : tests Android/iOS, tests automatisés, optimisation, préparation publication.

## 8. Priorités recommandées

### P0 — Stabiliser avant toute refonte

1. Corriger les deux erreurs TypeScript afin d'obtenir une compilation stricte verte.
2. Définir et valider le contrat d'authentification mobile avec le backend existant : cookie ou jeton, persistance, expiration et déconnexion.
3. Mettre en place un état d'authentification réactif et des gardes de routes par rôle.
4. Tester le parcours complet sur Android et iOS avec des comptes de test élève, parent et professeur.

### P1 — Fiabiliser l'existant

1. Déplacer tous les appels API des écrans pédagogiques vers `src/services/`.
2. Ajouter des états visibles de chargement, erreur, vide et nouvelle tentative.
3. Finaliser la déconnexion et empêcher les doubles soumissions.
4. Corriger les comparaisons d'identifiants, borner les progressions et rafraîchir les données après action.
5. Rendre les layouts compatibles Safe Area, petits écrans et clavier.

### P2 — Compléter les rôles et le parcours

1. Réaliser l'inscription et le dashboard professeur.
2. Réaliser le dashboard parent et la sélection/supervision des enfants.
3. Transformer quiz et exercices en fonctionnalités réelles à partir des API existantes.
4. Ajouter vidéo, révision, contenu riche et progression détaillée.

### P3 — Refonte et IA

1. Appliquer la charte EKALAN de façon centralisée et supprimer les restes du template Expo.
2. Valider logo, splash, onboarding et accessibilité.
3. Intégrer Sacko uniquement via les API existantes, après validation de leur contrat côté backend.

### P4 — Qualité et publication

1. Ajouter des tests unitaires, de services et de navigation, puis quelques parcours E2E critiques.
2. Vérifier performances, listes, erreurs réseau et reprise de session.
3. Valider les builds EAS Android/iOS et les exigences des stores.

## 9. Tests réalisés et limites

- `npm run lint` : réussi sans erreur.
- `npx tsc --noEmit` : échoué avec les 2 erreurs documentées.
- Inventaire automatique de toutes les routes et destinations `router.push`, `router.replace`, `Redirect`, `Tabs.Screen` et `Stack.Screen`.
- Inventaire automatique des appels Axios directs et des marqueurs d'incomplétude (`console.log`, écrans « bientôt disponible »).
- Tentative de lancement `expo start --web` : échec en mode normal sur `TypeError: fetch failed`; en mode hors ligne, Metro a commencé la compilation mais l'instance n'est pas restée accessible au navigateur de test. Le parcours tactile/clic n'est donc pas considéré comme validé.
- Aucun appel d'inscription, de connexion ou de progression n'a été déclenché afin de ne pas créer ou modifier de données serveur sans comptes de test dédiés.
- Aucun test Android ou iOS n'a été possible dans l'environnement courant.

## 10. Conclusion de phase 1

La phase 1 est documentée, mais les phases suivantes ne doivent pas commencer avant validation de ce rapport. L'ordre recommandé est : compilation et authentification, navigation par rôle, services et gestion d'erreurs, puis complétion fonctionnelle et refonte graphique.

Le projet Web, le backend, les API et la base de données n'ont pas été modifiés.
