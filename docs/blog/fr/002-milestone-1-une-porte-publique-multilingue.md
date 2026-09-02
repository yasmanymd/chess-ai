# Milestone 1 : avant la partie, une porte qui mérite d’être ouverte

Après le Milestone 0, Chess AI démarrait de façon fiable. Pourtant, le projet ne ressemblait pas encore à un produit. Il n’y avait ni porte publique, ni identité visuelle, ni choix de langue, ni réponse rassurante en cas d’échec.

Le Milestone 1 a changé cela. Avant de demander à deux personnes de confier une partie à la plateforme, nous avons posé une question plus simple : **la première page fonctionne-t-elle pour une vraie personne, sur un vrai appareil, dans une langue qu’elle comprend ?**

## Le design est une décision produit

Yasmany ne s’est pas présenté comme graphiste. Au lieu de prétendre que le design visuel était secondaire, il a demandé à l’IA d’aider à transformer l’intention produit en direction visuelle.

Les styles éducatif, compétitif-moderne et classique ont été comparés. La décision utile n’était pas de choisir une esthétique définitive, mais de rendre le produit personnalisable dès le départ : les thèmes de l’application seraient séparés de ceux de l’échiquier, un thème accessible serait livré en premier et les utilisateurs pourraient choisir des alternatives sans réécrire l’interface.

## Trois langues, pas une case à cocher pour plus tard

L’anglais, l’espagnol et le français n’ont pas été ajoutés après coup. Le shell a été conçu pour les trois. Le sélecteur mémorise un choix explicite et tout le texte public change de manière cohérente.

Le détail qui rend cela crédible est l’amélioration progressive. Avec JavaScript, le changement est immédiat. Sans JavaScript, un bouton Apply apparaît et la navigation mène à une page localisée rendue côté serveur. Le projet a refusé de faire de « JavaScript a chargé » une condition d’accessibilité.

## Un téléphone a trouvé la faille

Les tests ont aussi été effectués depuis des appareils sur le réseau local. Safari mobile a révélé un défaut : le rendu uniquement côté client pouvait laisser le premier écran incomplet et sans style pendant le chargement des modules. Le rendu serveur a corrigé le problème visible, mais le premier correctif dépendait encore des événements client pour la langue et les boutons.

Le test sur téléphone réel a trouvé cette seconde faille. La version finale a ajouté une navigation de secours côté serveur et un test navigateur sans JavaScript. Le premier succès sur ordinateur ne suffisait pas.

## Échouer de manière sûre

Le milestone a aussi défini la manière dont l’application échoue : les routes inconnues affichent une frontière d’erreur localisée avec une référence sûre et un retour à l’accueil, pas une stack trace. Si l’API est indisponible, le téléphone affiche un avis sûr et récupère lorsque le service revient.

En arrière-plan, le serveur enregistre des requêtes structurées avec des identifiants de corrélation. Ce n’est pas une capture spectaculaire, mais cela rend le diagnostic plus humain.

## La leçon

Le shell est l’endroit où l’architecture rencontre la première impression humaine. Chess AI a appris à traiter la langue, le chargement, les erreurs et les appareils mobiles comme une partie du produit, et non comme du nettoyage ultérieur.

Le milestone suivant permettrait enfin de réclamer une identité temporaire et d’entrer dans le lobby public.

## Sources

- [Fondations du design](../../ai/sessions/011-design-foundations.md)
- [Persistance de la langue](../../ai/sessions/012-locale-persistence.md)
- [Validation de sortie M1](../../ai/sessions/016-milestone-1-exit-validation.md)
