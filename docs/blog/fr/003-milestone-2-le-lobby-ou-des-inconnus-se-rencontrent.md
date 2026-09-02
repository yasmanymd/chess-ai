# Jalons 2 : le lobby où des inconnus se rencontrent

Une partie multijoueur ne commence pas avec le premier coup. Elle commence par une question beaucoup moins spectaculaire : **qui est ce navigateur ?**

Jusqu'au jalon 2, Chess AI disposait d'une porte publique et multilingue. Le produit avait déjà une apparence crédible, mais il ne pouvait pas encore tenir une promesse essentielle du multijoueur : lorsque deux personnes arrivent, le système sait les distinguer, laisser l'une attendre l'autre et s'assurer qu'elles ne prennent pas toutes les deux la même place.

Nous voulions cette expérience sans construire trop tôt des comptes, des mots de passe, une vérification par e-mail ou tout un produit de gestion des utilisateurs. Le résultat a été volontairement réduit : une identité temporaire et un lobby public.

## Un nom n'est pas une authentification

Le premier modèle séduisant était aussi le mauvais : demander un nom affiché et le traiter comme l'identité du joueur. C'est accueillant, mais ce n'est pas sûr. N'importe qui pourrait saisir `Yasmany` et devenir cette personne.

Le nom affiché est donc devenu uniquement la partie humaine de l'identité. Le serveur crée un identifiant de session opaque, l'envoie seulement dans un cookie `HttpOnly`, `SameSite=Lax`, puis ne conserve qu'une empreinte cryptographique de cet identifiant. Un navigateur peut retrouver son identité temporaire après un rechargement ; personne ne peut usurper un joueur simplement en connaissant le nom visible.

Les noms restent uniques à l'échelle du système, mais cette unicité demandait plus qu'une contrainte `UNIQUE` sur du texte brut. Le serveur supprime les espaces inutiles, applique la normalisation Unicode NFKC et compare une forme en minuscules indépendante de la locale, tout en gardant l'orthographe d'origine pour l'affichage. Des variantes visuellement proches ne deviennent ainsi pas silencieusement des identités différentes.

L'idée n'est pas qu'un projet d'échecs de loisir exige un cérémonial maximal. Même une petite fonctionnalité gagne à séparer nettement **ce que les personnes voient** de **ce à quoi le système fait confiance**.

## Un lobby est un problème de concurrence avec une interface sympathique

Le lobby permet d'ouvrir une table en attente, de voir les tables publiques, d'en rejoindre une ou d'annuler la sienne. Il est facile de l'imaginer comme une simple liste avec des boutons. La partie intéressante apparaît lorsque deux navigateurs cliquent sur « Rejoindre » presque au même instant.

Un seul peut devenir l'adversaire.

Le serveur traite donc l'opération comme une transaction PostgreSQL. Il verrouille la ligne de la table en attente, vérifie qu'elle est toujours disponible, attribue l'adversaire et les couleurs, supprime l'entrée d'attente et crée la partie active dans une seule opération atomique. Une requête gagne ; l'autre reçoit une réponse sûre indiquant que la table n'est plus disponible. Il n'y a ni partie à moitié créée ni confiance accordée au navigateur qui a affiché son résultat le premier.

Cela a rappelé une leçon récurrente du développement assisté par l'IA : une proposition d'interface très soignée peut masquer la question la plus importante. Ici, ce n'était pas « À quoi doit ressembler le bouton Rejoindre ? », mais « Qu'est-ce qui doit rester vrai lorsque deux requêtes entrent en collision ? »

## Le temps réel comme signal, pas comme source de vérité

Nous utilisons HTTP pour les lectures et mutations qui font autorité. Socket.IO reçoit un rôle plus étroit : prévenir les navigateurs concernés que le lobby a changé ou que leur partie a commencé. À la réception du signal, le client récupère l'état actuel depuis le serveur.

Ce choix rend les reconnexions et les événements perdus peu dramatiques. Le lobby utilise aussi un léger repli par interrogation périodique pour l'état de la partie en cours, afin qu'une notification manquée ne bloque pas un joueur sur un écran obsolète. Le serveur reste l'autorité ; le navigateur est une vue capable de se rétablir.

## La correction mobile qui a amélioré l'architecture

Une première amélioration tentait d'intercepter les soumissions de formulaires avec React. Sur des pages mobiles chargées partiellement, ce gestionnaire pouvait empêcher l'envoi normal du navigateur sans terminer la requête améliorée. L'expérience était pire que chacune des deux approches prise séparément.

Nous avons supprimé cette interception. Les formulaires HTML natifs et les routes du serveur sont devenus le chemin principal ; JavaScript peut les enrichir, mais il n'est plus nécessaire pour ouvrir ou rejoindre une table. La correction est née de tests du flux réel sur de vrais navigateurs et appareils.

## Ce que le jalon 2 n'a délibérément pas fait

Quand les deux joueurs atteignaient l'écran de partie active, l'échiquier n'était pas encore jouable. Il n'y avait ni horloge, ni validation des coups légaux, ni moteur de règles. Cette retenue comptait. Le jalon a prouvé l'identité, la visibilité du lobby, l'appariement atomique et l'arrivée des deux joueurs avant d'ajouter la complexité propre aux échecs.

Le résultat visible restait modeste : deux personnes pouvaient choisir un nom, se rencontrer dans un lobby public et arriver dans la même partie. Sous la surface, le projet avait franchi une frontière importante. Ce n'était plus seulement une interface qui ressemblait à un jeu d'échecs. Il commençait à devenir un système multijoueur.

## Sources du journal de construction

- [Plan du jalon 2](../../plan/milestone-2-temporary-identity-and-lobby-plan.md)
- [Session 017 : identifiant de session temporaire](../../ai/sessions/017-temporary-session-credential.md)
- [Session 018 : fondation de l'identité temporaire](../../ai/sessions/018-temporary-identity-foundation.md)
- [Session 019 : livraison du lobby et de la partie active](../../ai/sessions/019-lobby-and-active-game-delivery.md)
