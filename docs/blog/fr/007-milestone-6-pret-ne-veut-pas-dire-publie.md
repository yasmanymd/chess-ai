# Jalon 6 : prêt ne veut pas dire publié

Il existe une phrase dangereuse en logiciel : « ça marche sur ma machine ». Sa version plus dangereuse encore est « c'est prêt à être lancé », alors que personne n'a décidé où l'application tournerait, qui l'exploiterait ou quelles promesses juridiques seraient faites.

Le jalon 6 a formulé une affirmation différente pour Chess AI : le projet pouvait être évalué pour un futur déploiement. Il n'a **pas** créé de compte d'hébergement, acheté de domaine, exposé l'application publiquement ni prétendu que ces décisions étaient déjà prises.

## Rendre la qualité reproductible avant de la rendre publique

Le premier artefact a été un workflow GitHub Actions. Lors des pushes, pull requests et lancements manuels, il installe le runtime épinglé et vérifie formatage, lint, TypeScript, frontières d'architecture, tests unitaires, intégration PostgreSQL, accessibilité navigateur et build Docker de release reproductible.

La première exécution distante a échoué. `pnpm/action-setup` tentait de s'installer avec des hypothèses qui ne tenaient pas sur le runner, tandis que le build de release révélait une erreur de compilation serveur. Ces échecs étaient une preuve utile, pas une honte. Nous avons supprimé la dépendance cachée à l'installeur, aligné CI sur la version explicite de pnpm utilisée par Docker, corrigé le build et documenté la correction. La quatrième exécution a validé tous les jobs.

C'est exactement le rôle du CI : non pas afficher un badge vert, mais révéler ce que l'environnement local pardonnait silencieusement.

## Une forme de production sans fournisseur de production

Nous avons documenté une topologie de référence portable : conteneurs web et API, PostgreSQL géré à l'extérieur et une instance API derrière Caddy. Caddy terminera HTTPS lorsqu'un futur opérateur fournira un domaine, un e-mail d'autorité de certification et une URL de base de données gérée. Aucun de ces éléments n'est commité.

Une expérience isolée proche de la release a construit les vraies images runtime, appliqué les migrations sur un PostgreSQL jetable et servi l'interface ainsi que `/api/ready` par Caddy en HTTP local. Elle a aussi vérifié la base des en-têtes de sécurité à l'edge. Cela prouve la cohérence de configuration ; ce n'est pas une validation HTTPS publique, car aucun domaine réel n'existe encore.

Le jalon a aussi recensé les besoins opérationnels neutres vis-à-vis d'un fournisseur : logs structurés, métriques et traces, corrélation, sauvegarde et restauration, retour arrière, réponse aux incidents, limitation de débit, analyse de dépendances et de secrets, et revue inspirée d'OWASP ASVS. Le choix du fournisseur revient à la personne qui portera le coût et le risque d'exploitation.

## La capacité est un scénario, pas un slogan

L'expérience locale convenue ciblait 100 parties simultanées et 500 connexions Socket.IO authentifiées pendant cinq minutes. Le premier profil de charge a accidentellement créé une rafale synchronisée de 100 commandes. Au lieu de la présenter comme la charge attendue, l'équipe a corrigé le runner pour répartir les coups dans chaque intervalle de 27 secondes et a reconstruit explicitement le client de charge séparé.

L'exécution corrigée a maintenu les 500 connexions, accepté 1 100 coups légaux, enregistré zéro erreur de commande valide et zéro déconnexion, avec 15 ms p50 et 21 ms p95 vus côté client. Dans les conditions locales documentées, elle a rempli le contrat accepté. C'est une preuve de base, non une prédiction de trafic internet mondial.

## La preuve a un public

La préparation a aussi vérifié la façon dont les personnes rencontrent l'application : parcours critiques en anglais, espagnol et français ; Chrome et Safari ; ordinateur et téléphone ; plus les contrôles automatisés d'accessibilité. La documentation rend également visibles les preuves manquantes : les validations manuelles Firefox et Edge restent des bloqueurs pour une sortie publique.

Il en va de même pour les décisions juridiques et opérationnelles. Licence, politique de confidentialité, conditions, fournisseur, domaine, vrai HTTPS, observabilité de production, livraison multi-instance et montée en charge ne sont pas cachés dans un backlog. Ils sont nommés comme bloqueurs.

À la fin de M6, Chess AI était prêt à être évalué pour un déploiement, pas déployé. La différence relève de l'honnêteté d'ingénierie. Une release n'est pas une image Docker qui compile ; c'est un engagement envers les utilisateurs, l'exploitation, la sécurité et les conséquences.

## Sources du journal de construction

- [Plan du jalon 6](../../plan/milestone-6-release-readiness-plan.md)
- [Session 038 : planification de préparation](../../ai/sessions/038-milestone-6-release-readiness-planning.md)
- [Session 039 : CI et build reproductible](../../ai/sessions/039-milestone-6-1-ci-and-release-build.md)
- [Session 040 : correction du premier CI](../../ai/sessions/040-milestone-6-1-first-ci-run-correction.md)
- [Session 041 : base opérationnelle](../../ai/sessions/041-milestone-6-2-production-operations-baseline.md)
- [Session 042 : capacité et résilience](../../ai/sessions/042-milestone-6-3-capacity-resilience-decisions.md)
- [Session 043 : preuves de release](../../ai/sessions/043-milestone-6-4-release-evidence.md)
