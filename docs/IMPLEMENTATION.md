# Implementation Notes — Keyboard Typing Trainer

Reference: [PRD.md](PRD.md)

---

## Étape 1 — Le cœur : texte + frappe + curseur ✅

**Statut :** Terminée

### Ce qui a été implémenté

- Texte statique en dur (`the quick brown fox jumps over the lazy dog`)
- Curseur clignotant type éditeur de code (barre mauve, animation CSS `blink`)
- 3 états de caractère : `correct` (couleur pleine), `upcoming` (grisé), `error` (rouge)
- Backspace pour corriger
- Stats temps réel : CPM + taux de succès (update toutes les 200ms)
- Thème Catppuccin Mocha appliqué dès le départ

### Décisions prises pendant l'implémentation

1. **Les ES modules natifs ne fonctionnent pas en `file://`** (CORS). Solution : lancer un serveur HTTP local (`uv run python -m http.server 8080`).

2. **Comportement sur erreur** — le PRD disait "Backspace autorisé pour corriger, ou on peut continuer sans corriger". La sémantique exacte a été clarifiée :
   - Quand on tape un mauvais caractère → le curseur **avance**, le caractère attendu s'affiche en **rouge**
   - On peut **continuer à taper** le caractère suivant (erreur isolée, pas de cascade)
   - On peut faire **backspace** pour revenir corriger
   - On ne **substitue jamais** le texte affiché : le caractère original reste visible, seule la couleur change

3. **Bug fix : décalage curseur** — `_emit` était appelé avant `this.position++`, ce qui causait un décalage d'un cran entre le curseur visuel et la position logique. Corrigé en inversant l'ordre.

4. **Espace** — `e.preventDefault()` nécessaire aussi pour la barre d'espace (le navigateur scroll par défaut).

### Fichiers créés

| Fichier | Rôle |
|---|---|
| `index.html` | Point d'entrée |
| `style.css` | Thème Catppuccin Mocha, layout |
| `js/app.js` | Orchestration + capture clavier |
| `js/engine.js` | Moteur de frappe (position, erreurs, backspace, événements) |
| `js/stats.js` | Affichage CPM + taux de succès |
| `js/ui.js` | Rendu texte + curseur |

---

## Étape 2 — Le clavier visuel ✅

**Statut :** Terminée

### Ce qui a été implémenté

- Clavier QWERTY visuel (4 rangées + barre d'espace)
- Code couleur par doigt sur chaque touche
- Points de repère (home dots) sur A S D F J K L ;
- Highlight dynamique sur la touche à frapper
- Le highlight suit le curseur en temps réel

### Décisions prises pendant l'implémentation

1. **Deux états visuels pour les touches** :
   - **Lowlight** (défaut) : couleur du doigt à 22% d'opacité, discrète
   - **Highlight** (touche active) : couleur à 55% + glow + soulèvement (`translateY(-2px)`) + label blanc
   - Toutes les touches sont **toujours** colorées — c'est l'intensité qui change, jamais la disparition

2. **Bug fix : highlight qui ne se retirait pas** — le sélecteur cherchait `.kb-key.active` mais la classe ajoutée était `.kb-key-active`. Corrigé.

### Fichiers créés

| Fichier | Rôle |
|---|---|
| `js/keyboard.js` | Données layout QWERTY + mapping doigt → couleur |
| `js/keyboard-display.js` | Rendu du clavier visuel + highlight dynamique |

### Fichiers modifiés

- `index.html` — ajout du conteneur `#keyboard-display`
- `style.css` — styles clavier
- `js/app.js` — intégration du clavier

---

## Étape 3 — Toggle AZERTY / QWERTY ✅

**Statut :** Terminée

### Ce qui a été implémenté

- Layout AZERTY complet (rangée numérique française incluse : ², &, é, ", ', (, -, è, _, ç, à, ))
- Sélecteur de layout via **icône globe** en bas à droite du clavier
- Menu popup avec options QWERTY / AZERTY (layout actif surligné en mauve)
- Préférence sauvegardée en localStorage
- Changement de layout → le clavier se redessine + le drill en cours est regénéré avec les bonnes touches

### Décisions prises pendant l'implémentation

1. **Icône globe au lieu du bouton header** — le PRD mentionnait un "toggle". L'implémentation utilise un menu picker avec icône globe, ce qui est plus propre et moins encombrant.

2. **Le globe était effacé par le render du clavier** — `KeyboardDisplay.render()` remplaçait tout le innerHTML du conteneur, y compris le globe. Corrigé en sortant le layout picker dans un conteneur parent `#keyboard-area` séparé.

3. **La rangée numérique est incluse** — le PRD disait "zone alphanumérique uniquement", mais l'implémentation inclut la rangée numérique (0-9 et caractères spéciaux). **À discuter** : la garder pour les niveaux avancés, ou la retirer pour rester minimal ?

### Fichiers créés

| Fichier | Rôle |
|---|---|
| `js/store.js` | Abstraction localStorage (préférences + progression) |

### Fichiers modifiés

- `js/keyboard.js` — ajout layout AZERTY + export `LAYOUTS`
- `index.html` — icône globe + menu picker + conteneur `#keyboard-area`
- `style.css` — styles layout picker
- `js/app.js` — intégration store + layout picker

---

## Étape 4 — Niveaux d'apprentissage (drills) ✅

**Statut :** Terminée

### Ce qui a été implémenté

- 8 niveaux cumulatifs :
  1. Home — Index + Thumb (f, j, h + espace)
  2. Home — Middle fingers (ajoute d, k)
  3. Home — Ring fingers (ajoute s, l)
  4. Home — Left pinky (ajoute a)
  5. Home — Full row (tous les doigts sur la rangée de base)
  6. Top row
  7. Bottom row
  8. Full keyboard
- Barre de navigation des niveaux (boutons numérotés, états : locked / unlocked / current / completed)
- Info sous les boutons : nom du niveau + seuils temps réel (chars, %, CPM) avec code couleur vert/grisé
- Validation : 50 car. + 90% succès + 20 CPM
- Navigation libre (clic sur niveau débloqué)
- Progression sauvegardée en localStorage (niveau courant, niveaux complétés, meilleurs scores)

### Décisions prises pendant l'implémentation

1. **Niveaux cumulatifs** — chaque niveau ajoute des doigts/rangées aux précédents. Les touches d'un niveau = toutes les touches des niveaux précédents + les nouvelles. Pas des sets isolés.

2. **Génération de drills** — 2 modes :
   - **Structured drill** (≤4 touches) : groupes de 2-3-4 caractères séparés par des espaces (`fj fj fjj ff`)
   - **Random drill** (>4 touches) : pseudo-mots de 3-7 caractères séparés par des espaces

3. **Texte qui déborde** — le texte généré (150 car.) débordait du conteneur. Solution initiale : fenêtre glissante de ~3 lignes autour du curseur, `overflow: hidden` + `max-height: 7.5rem`. **Cette approche avait un bug** (voir § Bug fix ci-dessous). Remplacée par un rendu complet + scroll programmatique.

4. **Architecture modulaire** — le PRD avait `ui.js` comme monolithe (clavier + texte + curseur + stats + sélecteur). L'implémentation sépare en `ui.js` + `keyboard-display.js` + `level-ui.js` + `stats.js`. Plus propre.

5. **CPM = correctKeystrokes / elapsed** — les erreurs ne comptent pas dans la vitesse. Seuls les caractères correctement tapés sont comptés.

6. **Bug fix : scroll du texte (approche C — scrollTop fluide)** — la fenêtre glissante initiale (`CHARS_PER_LINE = 50`) était fausse : en réalité ~42 caractères par ligne avec la police/conteneur utilisés. Le curseur sortait du conteneur à ~40 caractères. La correction :
   - Suppression de `CHARS_PER_LINE` et de la logique de rendu partiel
   - Rendu complet de tous les caractères dans le DOM
   - `_scrollToCursor()` : après chaque render, positionne `scrollTop` pour maintenir le curseur sur la 2ème ligne visible
   - CSS : `height: 7.5rem` (fixe) + `overflow-y: auto` (scrollable programmatiquement) + `scrollbar-width: none` / `::-webkit-scrollbar { display: none }` (scrollbar masquée) + `word-break: break-all` (forcer le wrapping des `<span>` inline pour générer un vrai `scrollHeight`)
   - Le navigateur gère le line-wrapping, pas de calcul manuel

7. **Textarea caché pour la capture clavier** — les événements `keydown` sur `document` ne fonctionnent pas dans WKWebView (cmux browser). Ajout d'un `<textarea id="input-capture">` invisible mais focusable :
   - Auto-focus au chargement, re-focus sur chaque clic
   - `keydown` écouté sur le textarea au lieu de `document`
   - Mapping `CODE_TO_KEY` pour les événements synthétiques WKWebView (`KeyF` → `f`)
   - Vider le textarea après chaque frappe
   - Bonus UX : plus robuste même en utilisation normale (pas de perte de focus si clic hors zone)

### Fichiers créés

| Fichier | Rôle |
|---|---|
| `js/levels.js` | Spécification niveaux + génération drills + validation seuils |
| `js/level-ui.js` | Barre de navigation niveaux + affichage seuils |

### Fichiers modifiés

- `index.html` — barre de niveaux
- `style.css` — styles niveaux
- `js/ui.js` — rendu complet + scroll programmatique (`_scrollToCursor`)
- `js/app.js` — classe App avec logique de niveaux + textarea caché pour capture clavier
- `style.css` — styles niveaux + fix scroll text-display
- `index.html` — barre de niveaux + textarea caché

---

## Étape 5 — Mode entraînement + mots réels ⬜

**Statut :** Non implémentée

### À faire

- Corpus de mots anglais (`words-en.js`) indexé par lettres disponibles
- Corpus de mots français (`words-fr.js`) indexé par lettres disponibles
- Mode entraînement : sélection d'un niveau + langue → génération de texte avec des mots réels
- Toggle langue FR/EN dans l'UI
- Filtrage : ne générer que des mots composés exclusivement des touches du niveau choisi
- Transition naturelle : les premiers niveaux n'ont pas assez de touches pour des mots réels → drills ; les niveaux avancés → phrases

### Questions ouvertes

- Quelle taille de corpus ? (500 mots ? 2000 ?)
- Mots isolés ou phrases construites à partir des mots filtrés ?
- Où placer le toggle langue ? (à côté du globe ? dans un menu ?)

---

## Étape 6 — Polish Catppuccin Mocha ⬜

**Statut :** Non implémentée

### À faire

- Revue complète de la palette Catppuccin Mocha sur tous les composants
- Transitions et animations fluides
- Responsive design
- Micro-détails UX (hover, focus, états, feedback visuel de complétion de niveau)
- Espacement, typographie, cohérence

---

## Sujets transversaux non traités

| Sujet | Statut | Note |
|---|---|---|
| Rangée numérique | 🟡 À discuter | Incluse dans les layouts mais pas dans les niveaux. La garder ? La retirer pour rester minimal ? |
| Mots réels dans les premiers niveaux | 🔴 Bloqué par étape 5 | Les premiers niveaux n'ont que des drills (décision B du grill). Les mots réels arrivent naturellement avec plus de touches. |
| Majuscules / Shift | 🔴 Non traité | Les drills sont en minuscules. Pas de mécanisme Shift pour l'instant. |
| Ponctuation dans les drills | 🟡 Partiel | Les niveaux avancés incluent ; , . / dans les touches, mais les drills ne les génèrent pas spécifiquement. |
| Reset / Nouveau drill | 🟡 Partiel | On peut changer de niveau mais pas relancer le même drill sans recommencer. Un bouton "Replay" serait utile. |
