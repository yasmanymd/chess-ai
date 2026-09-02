# Milestone 0 : un point de départ reproductible

Le premier échiquier visible est arrivé plus tard. La première vraie fonctionnalité était moins photogénique : une commande qui devait fonctionner sur une machine propre.

Le premier coup fut une promesse au prochain développeur : clonez le dépôt, lancez Docker Compose et obtenez base de données, serveur, application web, migrations et rechargement à chaud sans passer l’après-midi à reconstruire l’ordinateur de quelqu’un d’autre.

```text
cloner le dépôt → docker compose up --build → développer
```

Cette promesse est devenue le Milestone 0.

## Pourquoi commencer ici ?

Les échecs multijoueurs ne sont pas seulement un échiquier. Ils exigent frontend, serveur, base transactionnelle, migrations, connexions temps réel et des tests qui vérifient plus que des objets simulés. Si chaque contributeur configure ces éléments différemment, des erreurs invisibles apparaissent avant le premier écran public.

Yasmany a choisi une approche orientée conteneurs : Git et un Docker compatible seraient les seuls prérequis de l’hôte. Le dépôt utiliserait TypeScript, React, Node.js, PostgreSQL, pnpm et Turborepo, mais sans liste privée d’étapes locales.

## L’environnement construit

Le monorepo a débuté avec `apps/web` et `apps/server`. Docker Compose orchestre PostgreSQL, les migrations, le serveur et l’application web. Les versions sont fixées : Node.js 24 LTS, pnpm 11, PostgreSQL 18 et références explicites de conteneurs.

Le détail qui a changé l’expérience fut le montage du code source uniquement. Le premier design montait le dépôt entier dans les conteneurs. Il fonctionnait, mais faisait apparaître `node_modules` et le store pnpm dans le checkout hôte. La conception a évolué : les dépendances sont installées dans l’image de développement et seul le code source est monté pour le rechargement à chaud.

## La réalité a relu le premier brouillon

La première construction de conteneur a fait ce qu’un environnement utile doit faire : remettre en question les hypothèses optimistes.

Une version de `@types/react-dom` proposée par l’IA n’existait pas dans npm. L’installation réelle l’a détectée. pnpm 11 a aussi refusé par défaut le script d’`esbuild`. Au lieu d’autoriser largement les scripts, le workspace n’a permis que l’outil nécessaire.

La première migration a apporté une autre leçon : un import du migrateur Kysely et une valeur de timestamp PostgreSQL ont dû être corrigés pendant une vraie migration. Le typage était utile, mais ne pouvait pas prouver qu’une migration fonctionnerait avec PostgreSQL.

## Ce que terminé signifiait

Des fichiers de configuration ne suffisaient pas. Les preuves exigeaient PostgreSQL sain, migrations terminées, serveur et web accessibles, hot reload, contrôles de qualité dans les conteneurs et tests unitaires, intégration PostgreSQL réelle et navigateur Playwright/axe. L’isolation était aussi vérifiée : le checkout hôte ne conservait ni `node_modules` ni store pnpm.

Une exception a été enregistrée : Testcontainers nécessitait un runner éphémère avec accès au socket Docker ; les services applicatifs sont restés non-root. La reproductibilité ne cache pas les exceptions : elle les documente pour répéter le résultat.

## La leçon

Un environnement reproductible n’est pas du travail administratif avant le « vrai développement ». C’est la première décision produit concernant la vitesse, la sécurité et l’honnêteté avec lesquelles le projet peut évoluer.

Le milestone suivant pouvait se concentrer sur quelque chose de visible : une interface publique, accessible et multilingue. Mais il le faisait sur un environnement qui avait déjà prouvé son fonctionnement.

## Sources

- [Plan du Milestone 0](../../plan/milestone-0-bootstrap-plan.md)
- [Session d’implémentation](../../ai/sessions/010-milestone-0-bootstrap.md)
