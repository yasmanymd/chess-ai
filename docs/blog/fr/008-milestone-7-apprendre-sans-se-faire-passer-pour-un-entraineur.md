# Jalón 7 : apprendre sans se faire passer pour un entraîneur

Chess AI devait depuis le début être davantage qu’un endroit où deux personnes se retrouvent pour jouer. La charte du projet réservait une place à une future plateforme éducative : exercices, cours, entraîneurs et élèves. Une fois le multijoueur, les parties persistantes et la relecture en place, il était tentant de passer directement à l’expression que tout produit d’échecs voudrait employer : _coach IA_.

Nous ne l’avons pas fait.

Le Jalón 7 a posé une question plus utile : quelle est la plus petite expérience d’apprentissage que nous puissions rendre vraiment digne de confiance ?

La réponse a été volontairement modeste. Montrer une position. Demander un coup à l’apprenant. Laisser le serveur décider si la tentative est acceptée. Fournir une réponse utile. Laisser la personne essayer de nouveau.

Cela semble presque trop petit pour être intéressant. En pratique, cela nous a obligés à choisir le type de produit éducatif que nous voulions construire.

## Six positions, pas un programme imaginaire

Le premier catalogue contient six exercices publics : deux mats en un coup, deux positions permettant de gagner du matériel et deux exercices de meilleur coup. Chacun possède un coup accepté, une consigne, un indice et une explication en anglais, espagnol et français.

Il n’y a pas de tableau de bord de création. Pas d’éditeur de base de données. Pas de compte. Pas de bouton « générer un exercice ».

Ce n’était pas un raccourci déguisé en fonctionnalité. C’était une décision produit. À ce stade, chaque exercice est un contenu éditorial versionné. Une pull request peut montrer exactement quelle position, quelle explication et quel coup accepté sont publiés. Nous pouvons réviser la leçon, et pas seulement un enregistrement inséré dans une base de données.

Pour un projet public développé au grand jour, cette visibilité compte. Un exercice d’échecs n’est pas seulement une donnée. C’est une affirmation : _ce coup mérite d’être appris et cette explication aide à comprendre pourquoi_.

## Une énigme a aussi besoin d’une autorité

Le navigateur peut dessiner l’échiquier, recevoir les touches et rendre la leçon immédiate. Il ne peut pas être le juge du succès de l’apprenant.

Lorsqu’une personne envoie un coup, le navigateur transmet l’identifiant de l’exercice et le coup normalisé au serveur. Le serveur charge la définition de l’exercice, valide le coup à travers la même frontière de règles d’échecs que celle utilisée par le jeu multijoueur, puis seulement le compare à la solution détenue par le serveur.

Nous réutilisons ainsi un principe qui avait déjà façonné les parties : le client propose ; le serveur décide.

Cette distinction compte même pour un exercice individuel. Un navigateur modifié ne devrait pas pouvoir marquer une énigme comme terminée en déclarant lui-même sa réponse correcte. Surtout, conserver la règle dans un lieu de confiance unique permet à l’interaction pédagogique d’hériter des mêmes contrôles de légalité qu’une vraie partie.

La réponse reste volontairement sobre. Un coup légal mais incorrect reçoit un indice court et localisé, puis ramène l’apprenant à la position initiale. Une réponse correcte reçoit une explication éditoriale concise et une invitation à continuer. Nous ne révélons pas immédiatement la solution après une erreur. Le but est de préserver le petit acte, important, de réfléchir encore.

## L’orientation fait partie de la leçon

Un détail initial semblait relever de la présentation, mais il s’agissait en réalité de conception pédagogique. Chaque exercice est orienté du côté de la personne qui résout : si les Noirs doivent jouer, les pièces noires se trouvent en bas et les coordonnées suivent cette orientation.

L’échiquier ne demande donc pas à l’apprenant de faire pivoter mentalement la leçon avant de la résoudre. Les étiquettes de coordonnées restent aussi cohérentes. Il est facile de reporter des décisions aussi petites jusqu’à ce qu’elles deviennent des incohérences dans tout le produit.

La progression suit la même philosophie, volontairement limitée. Les réussites sont stockées uniquement dans le stockage local du navigateur courant. Le catalogue peut afficher ce qui a été terminé et une action de réinitialisation demande confirmation avant de supprimer cette donnée locale. Aucun compte n’est créé silencieusement ; aucun historique d’apprentissage n’est envoyé ailleurs.

C’est utile aujourd’hui, privé par défaut et explicite sur ses limites.

## La correction ne concernait pas les échecs, mais notre hypothèse

Ce jalón nous a rappelé quelque chose au sujet de la preuve par les tests. Un test initial du serveur supposait que le coup de dame `Qf8` était illégal. L’adaptateur de règles d’échecs a correctement indiqué le contraire. Le code de production n’était pas erroné ; c’était la prémisse du test.

Nous avons corrigé le test pour utiliser un coup qui place réellement le roi en échec. C’est précisément le genre de correction du développement assisté par IA qui mérite de rester dans le dossier public : le test avait l’air sûr de lui, mais l’assurance n’est pas une preuve.

Une seconde correction est apparue à la frontière du navigateur. Une langue choisie dans l’URL pouvait différer de la langue déjà conservée par le client. Pendant l’hydratation, ce décalage pouvait rendre instable une route interactive d’étude. La correction garantit que la langue demandée par l’URL est appliquée avant l’attachement du client. L’internationalisation n’était pas seulement une question de libellés ; elle conditionnait le bon fonctionnement de l’interaction.

## Ce que nous avons refusé de prétendre

Il n’y a pas d’intégration Stockfish. Il n’y a pas de moteur distant. Il n’y a pas d’explications générées en temps réel. Nous ne prétendons pas qu’un modèle fournit un entraînement faisant autorité.

Il n’y a pas non plus de variantes, de lignes à plusieurs coups, de programmes adaptatifs, de contenu payant ou de profils d’apprentissage synchronisés. Ce sont des futurs possibles, pas des fonctionnalités que nous avons mérité de présenter comme terminées.

Le but de ce jalón n’était pas de simuler une école d’échecs complète. Il était d’établir un chemin clair et révisable entre une position d’échecs et une réponse pédagogique faisant autorité.

À la fin, le projet disposait de six exercices traduits, d’un catalogue public, d’échiquiers orientés vers le résolveur, d’une progression uniquement locale, d’une validation côté serveur et de tests navigateur pour l’indice après erreur, la solution acceptée, la persistance et la réinitialisation. Ce n’est pas un coach IA. À ce stade, c’est plus utile : un petit système d’apprentissage qui ne fait que les promesses qu’il peut tenir.

## Sources

- [Plan des fondations éducatives du Jalón 7](../../plan/milestone-7-educational-foundations-plan.md)
- [Session 044 : planification des fondations éducatives](../../ai/sessions/044-milestone-7-educational-foundations-planning.md)
