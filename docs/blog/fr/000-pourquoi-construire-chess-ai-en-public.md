# Pourquoi construire Chess AI en public avec l’aide de l’IA ?

Beaucoup de projets commencent par une fonctionnalité. Chess AI a commencé par une question plus inconfortable : **que se passe-t-il réellement lorsqu’une personne construit un logiciel sérieux avec une IA à ses côtés ?**

Il est facile de montrer un prompt élégant, un écran généré et une démo finale. Il est plus difficile—et plus utile—de montrer les décisions, les hypothèses erronées, les tests cassés, les révisions et le jugement humain entre ces étapes. Voilà l’expérience derrière Chess AI.

## Le produit est réel. Le dossier l’est aussi.

Chess AI est une plateforme web multijoueur en construction : les personnes peuvent jouer, revoir leurs parties et, plus tard, apprendre grâce à du matériel guidé. La première version commence volontairement petit : deux personnes peuvent se retrouver sans compte, jouer une partie validée par le serveur et utiliser les premiers exercices pédagogiques.

L’application n’est que la moitié du projet. L’autre moitié est un journal public de développement. Chaque milestone conserve un plan, des décisions approuvées, des preuves d’implémentation et la trace de ce qui a changé lorsque la réalité a contredit la première proposition.

Il ne s’agit pas de prouver que l’IA remplace les ingénieurs. Il s’agit de rendre l’ingénierie assistée vérifiable.

## Qui décide ?

Yasmany est responsable des décisions. L’IA aide à étudier les options, expliquer les compromis, produire des brouillons, implémenter le travail approuvé et vérifier les hypothèses. Elle ne décide pas discrètement de l’évolution du produit.

Les décisions importantes—faire du serveur l’autorité des coups, publier le processus ou différer les comptes—sont discutées et explicitement approuvées. Les choix répétitifs et à faible risque peuvent être délégués lorsque leur règle est claire.

Le résultat n’est ni « l’IA construit tout seule », ni « l’IA n’est qu’un autocompléteur ». C’est un modèle de collaboration avec une responsabilité visible.

## Pourquoi les échecs sont un test honnête

Les échecs semblent simples. En logiciel, ils deviennent vite un problème de systèmes : navigateur, temps réel, commandes concurrentes, état autoritaire, persistance, récupération, accessibilité, internationalisation et apprentissage.

Ils posent aussi une question qu’une belle interface ne peut résoudre : qui décide qu’un coup est légal ? Chess AI répond que le serveur est l’autorité. Le navigateur propose ; le serveur valide, persiste et publie l’état. Cette frontière permet un jeu équitable aujourd’hui et des replays, de la récupération et des exercices fiables demain.

## Nous publierons aussi les frictions

Une suggestion de l’IA peut être plausible et pourtant fausse. Une version de paquet proposée par l’IA n’existait pas, une migration supposait des choses que TypeScript ne détectait pas, et une configuration de conteneurs créait des dossiers indésirables sur l’hôte. Chaque problème est devenu une correction, un test et une leçon.

Ce journal inclura les approches rejetées, les comportements inattendus sur téléphone et navigateur, les échecs CI et les preuves utilisées pour les résoudre. Ce n’est pas une histoire d’automatisation sans friction, mais un récit pratique sur la façon d’utiliser l’IA pour construire un logiciel digne de confiance.

## Ensuite

Le premier milestone a commencé avant qu’une seule pièce n’apparaisse à l’écran. Il a commencé par une question moins glamour : quelqu’un pourrait-il cloner le projet et commencer à travailler sans reconstruire l’environnement à la main ?
