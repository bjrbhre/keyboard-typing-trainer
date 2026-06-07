# PRD — Keyboard Typing Trainer

## 1. Problem Framing

Apprendre à taper sur un clavier sans regarder ses doigts est un apprentissage long et frustrant. Les méthodes existantes ont plusieurs défauts :

- **On triche sans s'en rendre compte.** Sans feedback visuel sur les doigts, on finit par regarder le clavier, ce qui casse la posture et ralentit la progression.
- **La progression est trop abrupte.** On passe trop vite de "tappez les touches une par une" à des phrases complètes. Il n'y a pas de gradation qui respecte l'acquisition musculaire progressive.
- **Pas de repère en temps réel.** On ne sait pas si on s'améliore, on ne sait pas quand on est prêt à passer à l'étape suivante.
- **Les apps existantes sont souvent laides ou surchargées.** Ça ne donne pas envie de s'entraîner.

**Le besoin :** Un outil simple, beau, qui guide progressivement la maîtrise du clavier en gardant les yeux sur l'écran — pas sur les doigts. Qui donne des retours clairs sur la progression. Et qu'on peut lancer localement, sans compte ni connexion.

---

## 2. Solution Shaping

### Vision

Une app standalone (HTML/CSS/JS) qui enseigne la dactylo par progression graduelle, avec un affichage clavier visuel qui empêche de regarder ses mains.

### Modes

| Mode | Description |
|---|---|
| **Apprentissage** | Progression par niveaux : on maîtrise les doigts un par un sur la rangée de base, puis les autres rangées, puis des mix. Validation par seuils objectifs. |
| **Entraînement** | Texte réel généré à partir d'un niveau choisi. Pour pratiquer à son rythme. |

### Progression — Niveaux

1. **Rangée de base, doigt par doigt** — touches de repos, on reste sur la home row
2. **Rangée du haut** — on ajoute les touches au-dessus
3. **Rangée du bas** — on ajoute les touches en-dessous
4. **Mix** — on combine les rangées

Chaque niveau définit un ensemble de touches. Les premiers niveaux (peu de touches) génèrent des **drills** (suites de caractères, patterns). Dès qu'on a assez de touches pour former des mots réels, on bascule naturellement en **mots**.

### Validation d'un niveau

Pour débloquer le niveau suivant, il faut :
- **≥ 50 caractères** tapés dans la session
- **≥ 90% de taux de succès**
- **≥ 20 CPM** (caractères par minute)

On peut revenir sur n'importe quel niveau déjà fait, et choisir un niveau précis librement.

### Clavier visuel

- Zone alphanumérique uniquement (pas de pavé numérique)
- **Code couleur par doigt** (ex: index gauche = bleu, index droit = vert, etc.)
- **Highlight sur la touche à frapper** en temps réel
- Permet de garder les yeux sur l'écran

### Layout

- **Toggle AZERTY / QWERTY** — l'utilisateur choisit sa disposition
- Le clavier visuel et les exercices s'adaptent en conséquence

### Texte et langue

- Mots réels, texte lisible qu'on pourrait écrire ou lire
- **Français et anglais** — toggle ou sélection

### Affichage de la frappe

- Le texte s'affiche progressivement, curseur clignotant type éditeur de code
- Caractères tapés correctement : couleur pleine (texte Catppuccin)
- Caractères à venir : couleur grisée
- Erreurs : rouge
- Backspace autorisé pour corriger, ou on peut continuer sans corriger

### Stats — temps réel

Affichées pendant la frappe :
- **Vitesse** (CPM — caractères par minute)
- **Taux de succès** (%)

### Sauvegarde

- **localStorage** : niveau actuel, niveaux complétés, meilleurs scores, préférences (layout, langue)
- Persistance entre les sessions

### Style visuel

- **Thème Catppuccin Mocha** — dark, chaleureux, moderne
- UI épurée, focus sur le contenu
- Pas de sons

### Architecture technique

| Fichier | Rôle |
|---|---|
| `index.html` | Point d'entrée |
| `style.css` | Thème Catppuccin Mocha, layout |
| `js/app.js` | Orchestration, navigation modes |
| `js/keyboard.js` | Layouts QWERTY/AZERTY, mapping doigt → couleur |
| `js/levels.js` | Définition niveaux + génération texte (drill ou mots) |
| `js/words-en.js` | Corpus anglais indexé par lettres disponibles |
| `js/words-fr.js` | Corpus français indexé par lettres disponibles |
| `js/engine.js` | Moteur de frappe : curseur, match, erreurs, backspace |
| `js/stats.js` | Calcul CPM, taux de succès |
| `js/store.js` | localStorage : progression, scores, préférences |
| `js/ui.js` | Rendering : clavier, texte, curseur, stats, sélecteur de niveaux |

ES modules natifs — pas de bundler, pas de dépendances, fichier HTML ouvert dans un navigateur.

### Étapes d'implémentation progressive

Chaque étape produit une app fonctionnelle et testable.

#### Étape 1 — Le cœur : texte + frappe + curseur

Le minimum viable. On ouvre la page, on tape.

- Texte statique en dur (ex: `hello world`)
- Curseur clignotant type éditeur
- Caractères tapés en couleur pleine, à venir en grisé, erreurs en rouge
- Backspace pour corriger, ou continuer sans corriger
- Stats temps réel : CPM + taux de succès

👉 **Testable :** on tape un texte, on voit le curseur avancer, les couleurs changer, les stats bouger.

#### Étape 2 — Le clavier visuel

L'écran du bas apparaît.

- Clavier QWERTY affiché (zone alphanumérique)
- Code couleur par doigt
- Highlight sur la touche à frapper en temps réel
- Le highlight suit le curseur

👉 **Testable :** on tape, on voit la touche s'allumer au bon endroit, les couleurs de doigts sont cohérentes.

#### Étape 3 — Toggle AZERTY / QWERTY

- Layout AZERTY ajouté
- Toggle dans l'UI
- Le clavier visuel se redessine
- Le mapping doigt s'adapte
- Préférence sauvegardée en localStorage

👉 **Testable :** on bascule entre les layouts, le clavier visuel change, les highlights restent corrects.

#### Étape 4 — Niveaux d'apprentissage (drills)

Le mode apprentissage apparaît.

- Définition des niveaux (rangée de base → haut → bas → mix)
- Génération de drills (suites de caractères, patterns)
- Sélection de niveau, progression verrouillée par seuils (50 car. + 90% + 20 CPM)
- Navigation libre une fois débloqué
- Progression sauvegardée en localStorage

👉 **Testable :** on fait un niveau, on valide ou pas, on progresse, on peut revenir en arrière.

#### Étape 5 — Mode entraînement + mots réels

Le mode entraînement apparaît.

- Corpus de mots anglais et français
- Filtrage par touches disponibles selon le niveau choisi
- Génération de texte lisible (phrases, pas juste des mots isolés)
- Toggle langue FR/EN

👉 **Testable :** on choisit un niveau et une langue, on obtient un texte réaliste, on le tape.

#### Étape 6 — Polish Catppuccin Mocha

Le visuel passe de fonctionnel à beau.

- Palette Catppuccin Mocha appliquée partout
- Transitions, animations fluides
- Responsive propre
- Micro-détails UX (hover, focus, états)

👉 **Testable :** on vérifie la cohérence visuelle, le confort, la lisibilité.

À la fin de l'étape 5, l'app est fonctionnellement complète. L'étape 6 est la cerise.
