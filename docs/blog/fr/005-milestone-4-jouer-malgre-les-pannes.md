# Jalon 4 : jouer malgré les pannes

La première vraie partie a révélé une vérité que tout système multijoueur finit par rencontrer : un coup légal ne suffit pas. Que se passe-t-il si la requête est réessayée, si la notification échoue, si le serveur redémarre ou si deux requêtes identiques arrivent ensemble ?

Le jalon 4 est la réponse de Chess AI. Son objectif n'était pas de rendre le jeu plus spectaculaire, mais de permettre aux parties confirmées de survivre aux pannes ordinaires sans perdre, dupliquer ni corrompre l'état détenu par le serveur.

## Réessayer ne doit pas jouer deux fois

Les réseaux réessaient. Les navigateurs réessaient. Les personnes touchent deux fois. Considérer chaque requête comme nouvelle peut transformer un seul coup voulu en deux transitions.

Nous avons ajouté un registre durable de commandes, identifié par la partie et l'ID de commande du client. Lorsqu'une commande a déjà réussi, le serveur renvoie le résultat confirmé enregistré au lieu d'exécuter de nouveau la transition. Cette règle s'applique aux coups comme aux actions de partie.

C'est un petit contrat aux conséquences importantes : les clients peuvent réessayer sans risque. Plus important encore, les doublons concurrents sont protégés à la frontière de la base de données. La ligne de la partie est verrouillée avant la consultation du registre ; la première transaction enregistre un seul coup et une tentative concurrente retrouve ce même résultat.

## Enregistrer l'intention de notifier avec le coup

Avant M4, un coup confirmé et une notification temps réel étaient deux actions voisines. Cela semble suffisant jusqu'à ce que le processus échoue entre les deux. La partie peut être correcte alors que les joueurs ne découvrent jamais qu'elle a changé.

La solution a été une outbox transactionnelle. Dans la même transaction PostgreSQL qui enregistre un coup confirmé, un abandon, une action de nulle ou une chute au temps, le serveur enregistre aussi une intention de livraison `game.updated`. Le changement d'état et la promesse de prévenir persistent ensemble, ou pas du tout.

Un répartiteur séparé réclame les enregistrements en attente avec un bail temporaire, les publie puis les marque livrés seulement après réussite. En cas d'échec, il libère le bail et programme une nouvelle tentative avec un retour exponentiel borné. Au redémarrage du serveur, la livraison reprend.

Cela ne fait pas de Socket.IO une autorité. C'est l'inverse : les notifications deviennent explicitement des signaux réessayables, alors que HTTP reste la source de l'état confirmé.

## La récupération est un comportement produit

La réponse du navigateur après une reconnexion n'est pas « espérer recevoir l'événement manqué ». Les écrans de partie et de lobby rechargent leurs données autoritaires lors d'une reconnexion Socket.IO et lorsqu'un onglet caché redevient visible ; une revalidation périodique reste disponible en secours.

Ce choix évite de fusionner des charges utiles de notification fragiles avec l'état local. Le navigateur demande à la source de vérité quel est l'état de la partie maintenant. L'horodatage persistant de début de trait signifie également qu'une pendule continue après le redémarrage du serveur : le temps ne s'arrête pas parce qu'un processus a redémarré.

## La fiabilité comprend aussi les règles d'échecs

M4 a fermé une lacune importante des règles. L'historique confirmé est rejoué via le port de règles du projet afin que la répétition dépende de toute la partie, et non uniquement de la dernière position. La répétition quintuple devient une nulle automatique, tout comme la condition automatique des soixante-quinze coups. Un test de doublons concurrents et une position de répétition de seize demi-coups le démontrent.

## Des limites honnêtes

Les vérifications ont couvert TypeScript, lint, architecture, intégration PostgreSQL isolée, échec de publication injecté, accessibilité navigateur et formatage. Mais le jalon n'a pas prétendu résoudre tous les sujets de production.

La livraison Socket.IO reste au-moins-une-fois et limitée au processus local. L'outbox PostgreSQL est durable, mais n'est ni un bus de messages externe ni une solution multirégion. La récupération par compte et les tableaux d'observabilité ont été volontairement reportés.

Cette honnêteté fait aussi partie de l'architecture. À la fin de M4, Chess AI pouvait conserver une partie cohérente face aux pannes qu'un produit multijoueur local rencontre déjà. Le projet n'avait pas seulement appris à accepter un coup ; il avait appris à continuer à croire au même coup lorsque quelque chose se passe mal.

## Sources du journal de construction

- [Plan du jalon 4](../../plan/milestone-4-durability-recovery-concurrency-plan.md)
- [Session 026 : planification](../../ai/sessions/026-milestone-4-planning.md)
- [Session 027 : registre durable de commandes](../../ai/sessions/027-milestone-4-1-durable-command-ledger.md)
- [Session 028 : outbox réessayable](../../ai/sessions/028-milestone-4-2-outbox-dispatch.md)
- [Session 029 : récupération après redémarrage et reconnexion](../../ai/sessions/029-milestone-4-3-recovery.md)
- [Session 031 : validation de sortie](../../ai/sessions/031-milestone-4-exit-validation.md)
