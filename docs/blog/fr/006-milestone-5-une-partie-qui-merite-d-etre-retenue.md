# Jalon 5 : une partie qui mérite d'être retenue

Lorsqu'une partie se termine, un échiquier en direct a deux choix : disparaître, ou devenir un récit dont quelqu'un peut apprendre.

Le jalon 5 a donné cette seconde vie à Chess AI. Les parties terminées sont devenues des entrées d'archive publiques, rejouables coup par coup, exportables en PGN et utilisées comme frontière pour une expérience d'import PGN privée.

## Publier une partie terminée sans tout coupler

Le raccourci évident aurait été de laisser l'écran d'archive interroger directement les tables actives de Game. Nous ne l'avons pas pris. Le module Game possède le jeu ; Archive possède une projection de lecture conçue pour la découverte et la relecture.

Lorsqu'une partie atteint un état terminal, l'outbox transactionnelle existante écrit un fait durable `game.completed` en même temps que `game.updated`. Un projecteur Archive idempotent consomme ce fait et crée un enregistrement `archived_games` ainsi que ses coups archivés. La projection contient les noms publics, le résultat, la raison de terminaison, l'heure de fin, les FEN initial et final et les coups confirmés.

Le mot _idempotent_ compte. Une livraison peut se répéter sans créer d'archive en double. Au démarrage, une reconstruction répétable traite aussi les parties qui se sont achevées avant l'existence de la projection. Il ne s'agissait pas simplement d'ajouter une page : nous donnions aux parties terminées un chemin de publication durable.

## Une relecture doit être déterministe, pas théâtrale

L'archive publique est volontairement accessible sans cookie de session. Les visiteurs peuvent découvrir des parties terminées, en ouvrir une et parcourir la ligne enregistrée grâce aux contrôles début, précédent, lecture/pause, suivant et fin.

La relecture ne demande pas au service de jeu vivant de reconstruire un instant passé. Elle part du FEN initial archivé et utilise les états `fen_after` enregistrés. L'échiquier, le coup mis en évidence, l'orientation et les coordonnées sont donc une lecture déterministe du document archivé.

Les essais sur ordinateur et téléphone ont changé des détails apparemment modestes, mais essentiels à l'étude : l'échiquier devait rester lisible, le coup sélectionné évident et les contrôles utilisables au toucher. Une relecture est une conversation avec une partie passée ; perdre sa position dans la conversation la brise.

## Le PGN est une promesse aux autres outils d'échecs

Les échecs possèdent un avantage précieux : un langage déjà établi pour les parties. Le PGN permet d'emporter une partie dans une autre application, de la partager ou de la conserver hors du produit.

L'exportateur reçoit le contrat public de relecture d'Archive au lieu d'accéder à la persistance de Game. Il échappe les valeurs des balises, émet la ligne principale SAN confirmée et ajoute le résultat officiel. Le PGN peut être copié ou téléchargé dans un fichier `.pgn` depuis une route du même domaine.

Cette frontière porte le même message que le reste du projet : réutiliser les données via un contrat explicite, et non grâce à un accès privé pratique.

## L'import est privé par conception

Nous voulions aussi qu'une personne puisse coller un PGN ou choisir un fichier `.pgn` pour l'étudier dans Chess AI. Mais importer la partie d'un inconnu ne doit pas la publier silencieusement.

Le contrat d'import accepte un PGN d'échecs standard limité à une partie, valide la ligne principale et la cohérence du résultat, accepte commentaires et variantes tout en n'exposant que la ligne principale vérifiée, puis renvoie une représentation de relecture en mémoire. La page `/import` la conserve uniquement dans l'état de l'onglet courant. Un rechargement, la fermeture de l'onglet ou un nouvel import la supprime. Rien n'est écrit dans Game, Archive ou la base de données.

Cette petite décision de confidentialité a clarifié la fonctionnalité : l'archive publique concerne les parties jouées dans le produit ; l'import privé sert à l'exploration personnelle.

## La frontière du MVP reste visible

Toutes les parties terminées sont publiques dans ce MVP à identité temporaire. Visibilité par compte, modération, sélection de plusieurs parties, navigation des variantes, annotations, édition et variantes d'échecs sont reportées. La limite est explicite, non cachée derrière un vague « bientôt ».

À la fin de M5, Chess AI pouvait faire plus qu'héberger une partie. Il pouvait s'en souvenir, l'expliquer par la relecture et parler une langue standard au-delà de sa propre interface. C'était le pont vers les fonctions éducatives suivantes.

## Sources du journal de construction

- [Plan du jalon 5](../../plan/milestone-5-archive-and-chess-interchange-plan.md)
- [Session 032 : planification](../../ai/sessions/032-milestone-5-planning.md)
- [Session 033 : projection d'archive](../../ai/sessions/033-milestone-5-1-archive-projection.md)
- [Session 034 : archive publique et relecture](../../ai/sessions/034-milestone-5-2-public-archive-and-replay.md)
- [Session 035 : export PGN](../../ai/sessions/035-milestone-5-3-pgn-export.md)
- [Session 036 : import PGN privé](../../ai/sessions/036-milestone-5-4-private-pgn-import.md)
- [Session 037 : validation de sortie](../../ai/sessions/037-milestone-5-exit-validation.md)
