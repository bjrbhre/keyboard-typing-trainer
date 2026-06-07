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

8. **Feedback de fin de drill** — quand le drill est terminé :
   - Le CPM décroissait car `getStats()` divisait par un `elapsed` qui continuait à croître. Corrigé en enregistrant `finishTime` quand `finished = true` et en l'utilisant au lieu de `Date.now()` dans `getStats()`.
   - Le text-display affiche un écran de complétion : titre vert, stats figées, hint "Appuie sur Entrée pour un nouveau drill".
   - Bordure verte sur le conteneur (`#text-display.drill-finished`).
   - `App.replayDrill()` : génère un nouveau drill pour le niveau courant et reset l'engine. Résout aussi le besoin de bouton "Replay".

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

## Étape 5 — Mode entraînement + mots réels ✅

**Statut :** Terminée

### Ce qui a été implémenté

- Corpus anglais (`words-en.js`) : ~800 mots courants (3–5 lettres), flat array filtré au runtime
- Corpus français (`words-fr.js`) : ~400 mots courants (2–5 lettres), avec accents
- Mode entraînement : onglets Apprentissage / Entraînement dans le header
- Toggle langue FR/EN : icône A↔à à côté du globe layout, même pattern de picker
- Filtrage par touches disponibles : `generateTrainingText()` filtre les mots du corpus par `resolveKeys(levelId, layout)`
- Transition naturelle : si < `MIN_WORDS` (10) mots disponibles → fallback automatique vers drill
- Navigation libre en entraînement : tous les niveaux débloqués, pas de seuils de validation
- Pseudo-phrases en entraînement : groupes de 3–6 mots séparés par des espaces

### Décisions prises pendant l'implémentation

1. **Corpus flat array + filtre runtime** — plutôt qu'un index par lettres. Avec ~800 mots, le filtre est instantané. Le fichier reste simple et lisible.

2. **French AZERTY et accents** — les mots français avec accents (é, è, ç, à, ù) ne sont disponibles que quand le layout AZERTY est actif et le niveau inclut les touches accentuées. En QWERTY, ces mots sont filtrés.

3. **Fallback drill quand pas assez de mots** — `MIN_WORDS = 10`. Les premiers niveaux (1–4) n'ont que 0–2 mots réels → drill. Niveau 5 (rangée de base) : 0 mots en AZERTY (pas de voyelles sur la home row), 2 mots en QWERTY français ("la", "sa") → drill. Niveau 6+ : suffisamment de mots → texte réel.

4. **Mode tabs dans le header** — deux boutons "Apprentissage" / "Entraînement" avec bordures arrondies concaténées. Le mode actif est surligné en mauve. Simplicité maximale.

5. **Language picker à côté du globe** — même pattern que le layout picker. Icône A↔à + menu popup. La langue ne change le texte qu'en mode entraînement (les drills sont language-independent).

6. **Bug fix : niveaux 6 et 7 `includeAll`** — les specs des niveaux 6 (Top row) et 7 (Bottom row) avaient `newFingers: []` mais pas `includeAll: true`, ce qui faisait que `resolveKeys` n'ajoutait aucune touche pour ces niveaux. Les drills 6–7 utilisaient donc seulement les touches des niveaux précédents (rangée de base), et le mode entraînement ne pouvait pas trouver de mots. Corrigé.

7. **Pas de validation en entraînement** — `_checkLevelCompletion()` ne s'active que en mode `learning`. En mode `training`, l'info sous les niveaux affiche seulement le nom + la langue, pas les seuils.

8. **Suppression des niveaux verrouillés** — les niveaux ne sont jamais verrouillés. L'utilisateur peut choisir librement n'importe quel niveau dans les deux modes. 3 états visuels pour les boutons :
   - **default** (gris) : niveau non testé
   - **attempted** (jaune) : niveau essayé mais seuils non atteints
   - **completed** (vert) : seuils atteints en mode apprentissage
   - L'état `current` (mauve) se superpose à n'importe lequel des 3
   - `attemptedLevels` tracké dans le store, marqué sur la première frappe via `_markAttempted()`
   - Plus de logique de déverrouillage — `currentLevel` ne change plus automatiquement à la complétion

### Fichiers créés

| Fichier | Rôle |
|---|---|
| `js/words-en.js` | Corpus anglais ~800 mots |
| `js/words-fr.js` | Corpus français ~400 mots |

### Fichiers modifiés

- `js/levels.js` — `generateTrainingText()` + `MIN_WORDS` + fix `includeAll` niveaux 6/7
- `js/app.js` — mode `learning`/`training`, langue, `_generateText()`, tabs, language picker, `attemptedLevels`, `_markAttempted()`
- `js/level-ui.js` — tous niveaux cliquables, 3 états (default/attempted/completed), info mode-aware
- `index.html` — tabs mode + language picker + layout picker refactorisé
- `style.css` — styles mode tabs + picker refactorisé (`.picker-btn`, `.picker-menu`) + `--yellow` + `.level-btn.attempted`

---

## Étape 6 — Polish Catppuccin Mocha ✅ (non nécessaire)

**Statut :** Déjà couvert

Le thème Catppuccin Mocha est déjà appliqué partout via les variables CSS, les transitions sont en place (touches, caractères, boutons), et les micro-détails UX (hover, focus, états) existent. Pas de problème visuel identifié.

---

## Follow-ups

Voir [RFC-001.md](RFC-001.md) pour la liste des améliorations potentielles :
- Shift / Majuscules (priorité haute)
- Ponctuation dans les drills
- Rangée numérique
- Responsive design
- Indicateur de doigt actif
- Historique de progression
- Replay à tout moment
- Corpus plus riche
- Accents en QWERTY français

---

## Sujets transversaux non traités

| Sujet | Statut | Note |
|---|---|---|
| Rangée numérique | 🟡 À discuter | Incluse dans les layouts mais pas dans les niveaux. La garder ? La retirer pour rester minimal ? |
| Mots réels dans les premiers niveaux | 🔴 Bloqué par étape 5 | Les premiers niveaux n'ont que des drills (décision B du grill). Les mots réels arrivent naturellement avec plus de touches. |
| Majuscules / Shift | 🔴 Non traité | Les drills sont en minuscules. Pas de mécanisme Shift pour l'instant. |
| Ponctuation dans les drills | 🟡 Partiel | Les niveaux avancés incluent ; , . / dans les touches, mais les drills ne les génèrent pas spécifiquement. |
| Reset / Nouveau drill | ✅ Résolu | Entrée à la fin du drill lance un nouveau drill via `App.replayDrill()`. |
