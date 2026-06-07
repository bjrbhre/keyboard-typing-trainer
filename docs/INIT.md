Ecris une app (html/css/js) qui aide a apprendre à taper sur un clavier

C'est une app standalone que je peux lancer en local

Deux modes
- apprentissage : on commence par des patterns basiques (jl jl lj ...) pour progressivement maitriser l'ensemble du clavier. On passe de niveau en niveau au bout d'un certian nombre de caractères ET si on arrive au dessus d'un score minimal
- entrainement : texte généré aléatoirement à reproduire

Visuellement, il faut afficher progressivement le texte. Lorsque les caractères sont tapés, le curseur se déplace. Les caractères tapés sont en couleur foncée alors que les caractères a venir sont en couleur grisée

Sous le texte, je peux voir un display du clavier avec un highlight sur la touche à frapper. Ca me permet de garder la tete haute et ne pas regarder mes doigts

En cas d'erreur, le caractère s'affiche en rouge

Je peux revenir en arrière pour corriger. Je peux aussi continuer tel quel

J'ai des scores qui sont calculés. Notamment : 
- vitesse de frappe (caractères par minute)
- taux de succès

Le visuel doit être beau. Utiliser un style de UI moderne