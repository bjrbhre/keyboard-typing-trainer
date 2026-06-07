# Implementation Notes — PRD-001: Mode Libre

Reference: [PRD-001.md](PRD-001.md)

---

## Step 1 — Libre mode shell + visibility toggling ✅

**Statut :** Terminée

### Ce qui a été implémenté

- Onglet "Libre" dans `#mode-tabs` (3e tab, même style que Apprentissage/Entraînement)
- État `mode === 'free'` + `freePhase: 'input' | 'drill'` sur l'instance App
- `#level-bar` en mode Libre : `#level-nav` hidden, bouton action "Commencer · Ctrl+Entrée" visible (disabled)
- Language picker hidden en mode Libre
- Stats (`#stats`) restées visibles en mode Libre (ajustement vs. PRD — voir ci-dessous)
- Keyboard display idle (no highlight) quand `freePhase === 'input'`
- Placeholder "Tape ou colle ton texte ici…" dans `#text-display`
- Mode switch : cliquer Apprentissage/Entraînement restore tout (level bar, lang picker, stats, keyboard highlights)

### Ajustements vs. PRD

| # | PRD | Ajustement | Rationale |
|---|---|---|---|
| Q12 | Stats hidden en input phase | **Stats restées visibles** en mode Libre (toutes phases) | Garder le même display global — pas de layout shift. Stats à 0 CPM / 100% ne sont pas misleading car l'utilisateur comprend qu'il n'est pas en drill. |

### Décisions prises pendant l'implémentation

1. **CSS classes pour visibility toggling** — plutôt que `style.display` inline : `free-mode` sur `#level-bar`, `free-hidden` sur lang picker, `hidden` sur `#stats`. Plus maintenable, cohérent avec le pattern CSS existant.

2. **`_enterFreeMode()` / `_exitFreeMode()` / `_restoreNormalMode()`** — trois méthodes distinctes pour les transitions. `_exitFreeMode()` est un hook pour la persistance (Step 4). `_restoreNormalMode()` rétablit tout et relance `selectLevel()`.

3. **`KeyboardDisplay.clearHighlight()`** — nouvelle méthode pour retirer le highlight sans le réassigner. Utilisée quand le keyboard passe en idle en mode Libre.

4. **`TextDisplay.showFreePlaceholder()`** — méthode dédiée pour afficher le placeholder, sans toucher au render() normal. Remplacée par `showFreeTextarea()` en Step 2.

5. **Bouton action disabled** — le bouton "Commencer · Ctrl+Entrée" est disabled car il n'y a pas encore de textarea (Step 2 ajoutera la validation).

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `index.html` | Onglet Libre + bouton `#free-action` dans `#level-bar` |
| `style.css` | Classes `.free-mode`, `.free-hidden`, `#free-action`, `.free-placeholder`, `#stats.hidden` |
| `js/app.js` | Mode `'free'`, `freePhase`, `_enterFreeMode()`, `_exitFreeMode()`, `_restoreNormalMode()`, `_switchMode()` |
| `js/ui.js` | Méthode `showFreePlaceholder()` |
| `js/keyboard-display.js` | Méthode `clearHighlight()` |

---

## Step 2 — Text input phase ✅

**Statut :** Terminée

### Ce qui a été implémenté

- Textarea éditable dans `#text-display` quand `mode === 'free'` et `freePhase === 'input'`
- Même style que le drill view (font, padding, background, height 7.5rem, scrollbar hidden, no resize)
- Placeholder : "Tape ou colle ton texte ici…"
- Focus : le textarea reçoit le focus, le re-focus global de `#input-capture` est désactivé via flag `_freeInputActive`
- Validation : bouton "Commencer" activé/désactivé selon `textarea.value.trim().length >= 5`
- Ctrl/Cmd+Enter : raccourci clavier sur le textarea, même action que le bouton
- Bouton "Commencer" click → `_startFreeDrill()` (placeholder pour Step 3)

### Décisions prises pendant l'implémentation

1. **Flag `_freeInputActive` sur App** — le handler `document.addEventListener('click')` qui re-focus `#input-capture` vérifie ce flag. Quand actif, le re-focus est skipé. Le textarea libre maintient son propre focus.

2. **`e.stopPropagation()` sur le click du textarea** — empêche le click de buller jusqu'au document et trigger le re-focus de `#input-capture`.

3. **`TextDisplay._freeInputMode` guard** — `render()` ne doit pas écraser le textarea quand en mode libre. Le flag est set à `true` par `showFreeTextarea()` et remis à `false` par `showDrill()`. Sans ce guard, le `engine.reset()` (via `_restoreNormalMode → selectLevel`) déclenche un render qui écrase le textarea.

4. **`TextDisplay.showDrill()`** — méthode explicite pour sortir du mode libre input et relancer le render normal. Appelée par `_restoreNormalMode()` avant `selectLevel()`.

5. **CSS textarea** — `.free-textarea` hérite de `font-family`, `font-size`, `line-height`, `letter-spacing` via `inherit`. Padding à 0 car le container `#text-display` a déjà son propre padding. `::placeholder` coloré en `var(--overlay0)`.

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `js/app.js` | `_freeInputActive`, `_freeTextarea`, validation input, Ctrl+Enter, `_startFreeDrill()`, click handler bouton, guard re-focus |
| `js/ui.js` | `showFreeTextarea()` remplace `showFreePlaceholder()`, `showDrill()`, guard `_freeInputMode` dans `render()` |
| `style.css` | `.free-textarea` styles (remplace `.free-placeholder`) |

---

## Step 3 — Drill phase: the complete loop ✅

**Statut :** Terminée

### Ce qui a été implémenté

- "Commencer" clique ou Ctrl/Cmd+Enter : `.trim()` le texte → `engine.reset(trimmedText)`, `freePhase = 'drill'`
- Phase switch → drill : textarea hidden, `#text-display` montre le drill, `#input-capture` re-focus, keyboard highlight actif
- Action button change de label : "Commencer · Ctrl+Entrée" → "Modifier le texte · Echap"
- Terminé screen custom hint : "Entrée = recommencer · Esc = modifier le texte"
- Replay (Enter) : `replayDrill()` en mode libre rejoue le **même** texte (pas de régénération)
- Bouton "Modifier le texte · Echap" : retour à la phase input avec textarea pré-rempli
- `_returnToFreeInput()` : restaure le textarea avec le texte du drill, keyboard idle, button label reset

### Ajustements vs. PRD

| # | PRD | Ajustement | Rationale |
|---|---|---|---|
| Q16 | Bouton label "Modifier le texte" | **"Modifier le texte · Echap"** | Symétrique avec "Commencer · Ctrl+Entrée" — les utilisateurs d'une app de typing sont keyboard-oriented, le raccourci doit être visible. |

### Décisions prises pendant l'implémentation

1. **`_freeText` stocké sur App** — le texte trimmé est sauvegardé dans `this._freeText` pour le replay et le pré-remplissage. Step 4 ajoute la persistance via store.

2. **`TextDisplay.customHint`** — propriété optionnelle sur TextDisplay pour remplacer le hint du Terminé screen. Set à la string libre en mode free, `null` en mode normal. Évite de passer une ref App → TextDisplay.

3. **Dual-role du bouton action** — le même `#free-action` bouton sert les deux phases. Le click handler branche sur `freePhase` pour appeler `_startFreeDrill()` ou `_returnToFreeInput()`. Le label change dynamiquement.

4. **`replayDrill()` mode-aware** — en mode free, reset avec `_freeText` (même texte). En mode learning/training, régénère le texte via `_generateText()`.

5. **Caractères non trouvables sur le keyboard** — aucun handling spécial. Le keyboard highlight cherche la clé via `data-char`, s'il ne la trouve pas, pas de highlight. Le curseur avance normalement (erreur = avance). Testé avec 'L' majuscule — pas de highlight, erreur enregistrée, curseur avance.

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `js/app.js` | `_startFreeDrill()` complet, `_returnToFreeInput()`, `_freeText`, `replayDrill()` mode-aware, bouton dual-role, `customHint` |
| `js/ui.js` | `_renderFinished()` avec `customHint` optionnel |

---

## Step 4 — Esc, "Modifier le texte", and persistence ✅

**Statut :** Terminée

### Ce qui a été implémenté

- **Esc pendant le drill** — keydown handler sur `#input-capture` : si `mode === 'free'` et `freePhase === 'drill'`, appelle `_returnToFreeInput()`. Le handler est avant le handler Enter, donc Esc est intercepté en premier.
- **`store.set('lastFreeText')`** — sauvegardé dans `_startFreeDrill()` quand le drill commence, et dans `_exitFreeMode()` quand on quitte le mode Libre.
- **`_enterFreeMode()`** — pré-remplit le textarea depuis `store.get('lastFreeText')` si disponible. Active/désactive le bouton selon la longueur.
- **Page refresh** — `lastFreeText` persisté dans localStorage. Au retour en mode Libre après un refresh, le textarea est pré-rempli.
- **Curseur en fin de texte** — quand le textarea est pré-rempli (`_enterFreeMode` et `_returnToFreeInput`), `selectionStart`/`selectionEnd` sont positionnés à la fin pour éviter que le curseur n'apparaisse au milieu d'un texte scrollé.

### Ajustements vs. PRD

| # | PRD | Ajustement | Rationale |
|---|---|---|---|
| Q3 | Esc = return to input phase, restart on "Commencer" | Implémenté tel que spécifié — Esc retourne à l'input, Commencer restart | Conforme. Esc = édition, pas pause (RFC §12 est un follow-up séparé). |
| Q8 | `lastFreeText` persisted in store | Implémenté tel que spécifié — sauvegardé au Commencer et à l'exit du mode | Conforme. Survit page refresh et mode switch. |
| Q10 | Switching away from Libre mid-drill: immediate, no confirmation | Implémenté tel que spécifié — drill abandonné, texte sauvegardé | Conforme. `_exitFreeMode()` sauve le texte avant le switch. |

### Décisions prises pendant l'implémentation

1. **Esc vs Pause (RFC §12)** — Esc en mode Libre = retour à l'édition, pas pause. C'est conforme à la PRD (Q3 : "Esc is for editing text, not for pause/resume"). La pause reste un follow-up séparé.

2. **Sauvegarde dans `_exitFreeMode()`** — on sauve le texte en quittant le mode Libre, quelle que soit la phase (input ou drill). Cela couvre le cas où l'utilisateur modifie le texte dans le textarea puis switch de mode sans Commencer.

3. **Curseur en fin de texte** — `textarea.value = text` place le curseur au début par défaut. Sur un texte long qui dépasse le conteneur, le scroll reste au milieu et le curseur est invisible. Forcer `selectionStart = selectionEnd = len` place le curseur à la fin et scroll le textarea pour le rendre visible.

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `js/app.js` | Esc handler, `store.set('lastFreeText')`, pré-remplissage store, curseur en fin, label bouton "· Echap" |

---


| Bug | Cause | Fix | Fichiers |
|---|---|---|---|
| Text wrapping cassé : le texte disparaît après ~40 chars | `word-break: keep-all` empêche le wrapping des `<span>` inline | `overflow-wrap: break-word` + `white-space: pre-wrap` pour préserver les frontières de mots | `style.css` |
| Mots coupés au milieu ("doucement" → "douceme\nnt") | `word-break: break-all` coupe n'importe où + espaces en `\u00A0` (non-breaking) empêchent le browser de reconnaître les limites de mots | Remplacer `\u00A0` par des espaces normales dans `TextDisplay.render()` + `overflow-wrap: break-word` coupe seulement si un mot dépasse la ligne | `js/ui.js`, `style.css` |
| Terminé screen pas centré dans le conteneur pour les textes longs | `.drill-done` avec `height: 100%` ne résout pas dans un conteneur `overflow-y: auto` ; le scroll reste au milieu | `position: absolute; inset: 0;` pour que le Terminé remplisse toujours le viewport visible du conteneur, + `scrollTop = 0` après render | `style.css`, `js/ui.js` |
| Ctrl+Enter ne fonctionne pas sur macOS | macOS utilise ⌘ Cmd, pas Ctrl, pour les raccourcis clavier | Ajouter `e.metaKey` en plus de `e.ctrlKey` dans le keydown handler du textarea | `js/app.js` |
| Textarea écrasé par `TextDisplay.render()` en mode Libre | Le `engine.reset()` (via `_restoreNormalMode → selectLevel`) émet un event `reset` qui trigger `render()`, écrasant le textarea | Ajouter `_freeInputMode` flag sur TextDisplay, guard dans `render()` : `if (this._freeInputMode) return` | `js/ui.js` |
| Curseur textarea au milieu du texte scrollé après pré-remplissage | `textarea.value = text` place le curseur au début, mais le scroll reste dans un état antérieur | Forcer `selectionStart = selectionEnd = value.length` + `focus()` après le set de value | `js/app.js` |


## Summary — fichiers modifiés (all steps)

| Fichier | Changement |
|---|---|
| `index.html` | Onglet Libre + bouton `#free-action` dans `#level-bar` |
| `style.css` | `.free-mode`, `.free-hidden`, `#free-action`, `.free-textarea`, `.drill-done` absolute, `overflow-wrap`, `white-space: pre-wrap` |
| `js/app.js` | Mode `'free'`, `freePhase`, `_freeInputActive`, `_freeTextarea`, `_freeText`, `_enterFreeMode()`, `_exitFreeMode()`, `_restoreNormalMode()`, `_switchMode()`, `_startFreeDrill()`, `_returnToFreeInput()`, `replayDrill()` mode-aware, Esc handler, Cmd+Enter, `lastFreeText` persistence, bouton dual-role |
| `js/ui.js` | `showFreeTextarea()`, `showDrill()`, `_freeInputMode` guard, `_renderFinished()` avec `customHint`, regular spaces, `scrollTop = 0` |
| `js/keyboard-display.js` | Méthode `clearHighlight()` |
| `js/store.js` | No change (uses existing `get/set` for `lastFreeText`) |