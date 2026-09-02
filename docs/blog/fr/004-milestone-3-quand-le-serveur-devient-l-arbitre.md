# Jalon 3 : quand le serveur devient l'arbitre

Pendant un temps, Chess AI pouvait amener deux personnes à la même table. C'est du multijoueur, techniquement. Mais ce n'est pas encore une partie d'échecs.

La question décisive du jalon 3 était facile à exprimer et exigeante à mettre en œuvre : **lorsqu'un joueur touche une case, qui décide qu'un coup d'échecs a réellement eu lieu ?**

La réponse ne pouvait pas être le navigateur. Un navigateur peut être périmé, modifié, momentanément hors ligne ou simplement erroné. S'il décide qu'un cavalier a bougé, chaque joueur finit avec sa propre version de la partie. Le serveur devait devenir l'arbitre.

## Mettre la bibliothèque d'échecs derrière une porte

Nous avons choisi `chess.js` pour les règles des échecs standard, sans laisser volontairement ses types ni son API se répandre dans le projet. Le serveur possède à la place un `ChessRulesPort` : des contrats propres au projet pour les positions FEN, les intentions de coup, les destinations légales, la notation SAN, les faits de fin de partie et la sortie PGN. Un seul adaptateur importe la bibliothèque.

Cette séparation peut sembler formelle pour une première version. Elle s'est révélée utile tout de suite. Des positions de référence ont couvert les coups normaux, les coups illégaux, les échecs, le mat, le pat, le roque, la prise en passant, la promotion, la reconstruction FEN, SAN, les répétitions et les règles de comptage des coups. Un test d'architecture empêche un futur import pratique de contourner cette frontière.

L'IA a aussi commis une erreur instructive. Une hypothèse initiale sur l'API de roque était fausse : la bibliothèque expose des prédicats distincts pour le petit et le grand roque, plutôt qu'un prédicat générique. L'adaptateur a été corrigé avant de devenir un contrat public. Une frontière réduite et isolée a transformé une erreur d'implémentation en leçon circonscrite, au lieu d'en faire une dépendance dispersée dans le projet.

## Un coup est une transaction, pas une animation

Lorsqu'un joueur envoie `e2` vers `e4`, le serveur fait bien plus que déplacer une image :

1. Il authentifie la session temporaire et vérifie que cette identité participe à la partie.
2. Il verrouille l'enregistrement de la partie active et contrôle la version attendue, le trait et l'utilisation éventuelle de la commande.
3. Il demande à l'adaptateur de règles si le coup est légal.
4. Dans une transaction PostgreSQL, il enregistre le SAN accepté, les deux limites FEN, le prochain trait, l'état et un nouveau numéro de version.
5. Après confirmation seulement, il émet `game.updated`, un signal invitant les clients à récupérer l'état confirmé.

Les commandes illégales, périmées, dupliquées, non autorisées ou jouées hors tour sont rejetées avec des codes publics stables et ne modifient pas la partie. C'est pourquoi le produit peut dire que l'échiquier ne change qu'après confirmation du serveur.

Le navigateur n'anime volontairement pas les pièces de façon optimiste. Il rend le FEN confirmé, propose une sélection au clic ou au toucher et des indications de destinations légales, puis attend le serveur. Le modèle d'autorité devient ainsi visible, et non une simple ambition d'architecture.

## Une partie a besoin que le temps compte

Les horloges apportent un autre piège : un minuteur affiché dans un navigateur n'est pas une pendule fiable. Le serveur conserve les deux temps restants et un horodatage de début de trait, calcule le temps écoulé dans la transaction autoritaire, applique l'incrément Blitz uniquement après un coup accepté et termine la partie lorsque le joueur actif tombe au drapeau.

Le navigateur peut estimer l'affichage entre deux instantanés, mais il ne peut pas sauver un joueur dont le temps est déjà écoulé. Cette différence est devenue concrète dans les tests : atteindre `0:00` termine désormais la partie automatiquement, sans attendre qu'une autre action soit tentée.

Le jalon 3 a également ajouté des fins de partie contrôlées par le serveur : mat, pat, matériel insuffisant, abandon, offre et acceptation de nulle, réclamations de nulle éligibles et temps écoulé. Chaque action du cycle de vie est enregistrée avec le résultat final.

## La revue humaine a changé l'écran de jeu

Les règles ne représentaient que la moitié du jalon. L'autre moitié a consisté à ouvrir sans cesse le produit sur de vrais navigateurs et de vrais téléphones.

Cette revue a remodelé l'expérience : choix délibéré de promotion, retours localisés, orientation pour le joueur noir, coordonnées, surbrillance du dernier coup, historique défilant, horloges près de chaque joueur et liste de joueurs permettant de comprendre immédiatement qui vous êtes, quelle couleur vous avez et à qui est le trait. Les parties terminées ont obtenu un vainqueur nommé et un chemin explicite vers le lobby.

Ces éléments ne sont pas décoratifs. Dans une partie à deux, l'incertitude sur le joueur actif ou sur l'acceptation d'un coup est un défaut produit.

## Ce qui reste difficile

M3 n'a pas prétendu résoudre tous les problèmes des systèmes distribués. La relecture durable des réponses de commande, la reconstruction après redémarrage, la livraison par outbox transactionnelle et un durcissement plus profond de la concurrence ont été volontairement reportés au jalon 4. Le jalon protège la transition par une version et rejette les doublons de façon sûre ; il ne prétend pas que l'histoire de la fiabilité s'arrête là.

C'est tout l'intérêt du travail par jalons. À la fin de M3, deux personnes pouvaient achever une partie standard par l'interface, avec un serveur qui applique les règles et les horloges. La question suivante n'était plus de savoir si Chess AI pouvait jouer aux échecs, mais s'il pouvait tenir ses promesses lorsque le réseau, le processus ou la livraison des événements échouaient.

## Sources du journal de construction

- [Plan du jalon 3](../../plan/milestone-3-authoritative-chess-play-plan.md)
- [Session 020 : planification](../../ai/sessions/020-milestone-3-planning.md)
- [Session 021 : frontière des règles](../../ai/sessions/021-milestone-3-rules-boundary.md)
- [Session 022 : transaction de coup autoritaire](../../ai/sessions/022-milestone-3-authoritative-move-transaction.md)
- [Session 025 : horloges, clôture et actions](../../ai/sessions/025-milestone-3-closure-implementation.md)
