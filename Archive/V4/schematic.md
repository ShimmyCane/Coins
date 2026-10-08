# Coins 01 — Coin Combos

## Objective
A lightweight, tablet-friendly visualizer that helps a child understand "make an amount with N US coins" problems (e.g. *use exactly 50 coins to make $1.00*). The same problem is shown four ways — figurative, diagrammatic, symbolic, graphical — linked together so a change in one updates all the others. Built as a static HTML/CSS/JS app (same stack as Primes 01), no build step.

## Problem class (Coins 01)
Given a target amount `A` (cents) and a coin count `N`, find all non-negative integer solutions of:

- `1p + 5n + 10d + 25q + 50h + 100s = A` (value)
- `p + n + d + q + h + s = N` (count)

where p/n/d/q/h/s are pennies, nickels, dimes, quarters, half-dollars, and dollar coins.

Notes:
- Coin set is configurable (toggle half-dollar and dollar coin off by default, so the default is P/N/D/Q).
- A problem may have 0, 1, or many solutions. The app must say so clearly ("No way!" / "1 way" / "12 ways").
- Default problem: 50 coins = $1.00 (cents `A=100`, `N=50`).

## Core behavior
- Problem bar at top: amount, coin count, and enabled coin types (all editable).
- The app enumerates all solutions (bounded search, trivially small for these ranges) and keeps a "current combo".
- The current combo is the single source of truth; all four views render from it.
- Editing in any view (drag a coin, edit a table cell, change a variable, click a graph point) updates the current combo and the others.
- Status line: current coin count vs N, current value vs A, with ✓ / "need 3 more coins" / "$0.40 too much" feedback.
- A "Solutions" list lets the user jump to any valid combo; a "Show me one" button picks one; "Reset" empties the table.
- Simplify mode: reduces the problem (fewer coin types, smaller amount, smaller N) to build intuition, with a "Make it harder" stepper that walks back up to the full problem.

## The four views (tabs/panels within a problem)

### 1) Figurative — Table Top
- A felt-like table with a coin tray (an unlimited supply of each enabled coin) and a play area.
- Child drags coins from the tray onto the table, drags them around, and drags them off (or taps) to remove.
- Coins are drawn as realistic SVG (size ratios correct: dime < penny < nickel < quarter < half < dollar; copper/silver/gold colors; value label).
- **Sort** (built, single button): animates coins (CSS transform transition, ~0.7s) into piles sized for easy counting, one labelled band per coin type: pennies 5s (10s if >20), nickels pairs (10s if >10, so each pair = 10¢), dimes 5s (10s if >20), quarters always 4 (= $1.00), halves pairs (10s if >6), dollars 5s (10s if >20). Labels read e.g. "quarters: 1 pile of 4 ($1.00 each) + 2 extra = 6 coins · $1.50". The table grows taller when needed; any add/remove/drag clears the sorted layout.
- Running counters: coins on table, total value.
- Implementation: pointer events (works for mouse and touch), SVG or absolutely positioned elements.

### 2) Diagrammatic — Table
- Spreadsheet-like grid, one row per coin type: Coin | Value | Count (editable, +/- steppers) | Subtotal.
- Totals row: total coins and total value, compared against N and A.
- Optional second grid: all solutions, one per row, with columns per coin type (sortable, click row to load).

### 3) Symbolic — Equations
- Live equations with the current counts substituted:
  - `1(p) + 5(n) + 10(d) + 25(q) = 100`
  - `p + n + d + q = 50`
- Each variable is an editable number; edits flow back to the combo.
- Step-by-step reduction (optional): subtract the count equation from the value equation to show `4n + 9d + 24q = 50`, hinting at the algebraic strategy.
- Color-coded variables matching the coin colors.

### 4) Graphical — three views
- **Coin Walk** (built): each coin is one step, 1 right (uses a coin slot) and up by its value; a solution is a path that ends exactly on the target (N coins, A cents). Dashed lines show the all-smallest-coin and all-largest-coin paths; the green zone between them holds every possible path, so an unreachable target is visibly outside it. Slope of the dotted line to the target = the average coin. Two budget bars (coin slots, cents) must fill together. "Show another solution" draws a grey comparison path. Hover a step to read it.
- **Rose** (built): six spokes (P, N, D, Q, H, dollar), coin icons at the tips. Each solution is a polygon; reach on a spoke = that coin's share of the money (or of the coins, via a toggle); the six shares always sum to 100%. Hover/click a shape to read/load it; green = found, blue = not yet, red = current combo. Draws at most 400 shapes.
- **Map** (see Permutation engine): zoomable heat map.
- *Superseded:* the earlier 2D point graph (two axes, others solved, feasible-region polygon) and the parallel-coordinates "Multi-D Graph" were removed: neither showed *why* a combination works or fit the limits of the coin count.

## Strategies (how to attack the problem)
Representation (how it looks) and strategy (how you attack it) are independent axes. Each strategy is a panel that operates on the same current combo.

1. **Trade (exchange game)** — value-preserving swaps: 1N↔5P, 1D↔2N, 1Q↔2D+1N, 1H↔2Q, 1S↔4Q, etc. Buttons are split (more coins) or merge (fewer coins); each shows the coin-count change. Teaches that *count* and *value* are separate dials.
2. **Two-step** — (a) *Same count first*: fill with N of the smallest coin, then swap-upgrade one coin at a time (P→N +4¢, P→D +9¢, P→Q +24¢) until the value gap closes; the target is `A − N·v₀` using steps `vⱼ − v₀`. (b) *Same value first*: start from the fewest-coin solution for A, then split coins to raise the count.
3. **Peel-off (decision tree)** — choose the number of the largest coin, which leaves a smaller problem (remaining cents, remaining coins, one fewer type). Each option shows how many ways remain; dead branches are greyed.
4. **Bounds (feasibility first)** — min and max coins that can make A, a number line showing where N sits, the counts that actually work, and quick impossibility checks (average coin value outside the coin range, gcd of coin values).
5. **Two types** — solve with just two coin types (a unique linear solution); a pair matrix shows which pairs work for (A, N). "Use only this pair" simplifies the problem.
6. **Balance (average value)** — average = A/N. As built: a table of each coin's difference from the average, the pull (difference × count), pull-down vs pull-up bars, and a "Why the odd ratios?" list showing the arithmetic (e.g. 23 × 1¢ below average = 1 × 23¢ above average → 23 pennies balance 1 quarter). *Superseded:* the original seesaw drawing and unexplained ratios.
7. **Families** — from a solution, the nearest other solutions as step moves (e.g. "+1 D −2 …"), with how many times a step can repeat.

## Permutation engine (many problems, fast)
- **Problem Map** — heat map of amount (x) × coin count (y) coloured by number of solutions; hover shows counts, click loads that problem. Opens zoomed around the current problem (±20¢ × ±10 coins) with Zoom in / Zoom out through four levels up to the full 1–300¢ × 1–100 range; the two sweeps follow the zoom window.
- **Sweeps** — bar charts of solution count holding count fixed (varying amount) and holding amount fixed (varying count); click a bar to load.
- **Surprise me** — random solvable problem.
- **Predict first** — optional: guess the number of ways (none / 1 / 2–5 / 6–20 / 21+) before the answer is revealed; tracks a streak. Solutions, Coin Walk, Rose and Map are hidden until guessed.
- **Find them all** — every distinct valid combo the child builds is collected; progress "Found 3 of 12"; "Show me one" and "Reveal all".
- **History** — every action is recorded; undo and click-to-restore.
- **Coin-set toggles / Simplify** — add or remove coin types, with fewer/more buttons.

## Data model
```
Problem   { amountCents, coinCount, coins: ['P','N','D','Q', ...] }
Combo     { P:int, N:int, D:int, Q:int, H:int, S:int }
Coin      { key, name, valueCents, color, diameterMm }
Solutions Combo[]   // all valid combos for the problem
State     { problem, combo, solutions, activeTab, simplifyLevel }
```
Single store with `setCombo()` / `setProblem()`; each view subscribes and re-renders.

## Solver
- Recursive/iterative enumeration over coin counts with pruning (remaining count and remaining cents).
- Complexity is small for N ≤ ~200 and ≤ 6 coin types; cache per problem.
- Also reports "no solution" with a short reason where easy (e.g. parity, too few coins).

## Layout specification (as built)
- **Files:** `index.html` (shell), `css/style.css`, and five plain scripts in `js/` sharing one global scope, loaded in this order: `core.js` (constants, state, math, state changes), `table.js` (table top, sort, drag), `views.js` (header + views), `strategies.js` (strategies + progress panels), `app.js` (panel registry, events, boot). No build step. See `index_summary.html`.
- **Two columns on laptops / iPad landscape** (>= 981px wide and >= 520px tall): the page itself does not scroll; each column scrolls independently. Narrow or short windows fall back to one column, play side first.
- **Left (play side):** coin tray + Sort / Clear on top, the table top below, then (bottom) the status pills, Amount, Coins, Surprise me, Show me one and Undo; the predict card sits above these.
- **Right (scrollable):** toggle buttons grouped as Views (Coin Walk, Table, Equations, Rose, Map), Strategies (Trade, Two-step, Peel-off, Bounds, Two types, Balance, Families), Progress (Solutions, History). Each button is **+ / −**; any number of panels stack without overwriting each other, each with a − close button. Only Table is open by default.
- **Settings** (header gear): holds the coin-type chips, Fewer/More types and Predict first. Open by default on large screens, closed on small ones.
- (*Supersedes* the original tab strip and the all-in-one header bar.)

## Layout specification (original)
- Dark app background with a large rounded card (consistent with Primes 01).
- Top: problem bar + status line.
- Main area: tab strip (Table Top | Table | Equations | Graph) for narrow/portrait screens; on wide screens show Table Top left and a selectable second view on the right so two representations are visible together.
- Bottom: solutions list / hints and footer title.
- Large touch targets (≥ 44px), friendly colors, minimal text.

## Multiple problem types (tabs: Coins 1, 2, 3...)
Top-level tabs, each a problem class sharing the coin graphics, store, and views where applicable:

1. **Coins 1 — N coins make A** (this schematic).
2. **Coins 2 — Fewest / most coins** for amount A (change-making; greedy vs optimal).
3. **Coins 3 — Count the ways** to make A (partitions; shows total number of combos).
4. **Coins 4 — Ratio / constraint puzzles** (e.g. "twice as many dimes as nickels", "equal number of quarters and dimes").
5. **Coins 5 — Mystery purse** (given total and count of types, deduce the coins; hints from clues).

Each tab declares: input form, constraints, solver, and which of the four views it supports. A small plugin shape:
`{ id, title, inputs, solve(problem), views[], constraints[] }`.

## Implementation structure
- `index.html`: shell, tab strip, problem bar, view containers.
- `style.css`: theme, card layout, coin art, responsive split vs stacked.
- `app.js`:
  - coin definitions and SVG coin rendering
  - store and subscription helpers
  - solver(s)
  - view modules: tabletop, table, equations, graph
  - problem-type registry (Coins 1…n)
  - settings (enabled coins, max N/A)
- Optional later: `index_summary.html` read-only recap, saved problems in localStorage.

## Build phases
1. Store + solver + status line; Table view (fastest way to validate logic).
2. Symbolic equations view bound to the store.
3. Table Top drag-and-drop with SVG coins.
4. Graph view with clickable solution points.
5. Simplify mode and solutions list.
6. Problem-type tabs and Coins 2+.

## Status (as built)
All four representations, all seven strategies and the permutation engine are implemented for Coins 1 (Coin Walk, Rose, zoomable Map, single Sort, side-by-side layout with Settings). Coins 2–5 tabs are disabled placeholders. Code was split into css/ and js/ files ("simplify_code" pass). Verified by scripted browser checks (every panel renders, no JS errors, solution counts match shape counts, sort labels, panel toggles); touch input, real iPad layout and very large sorts are untested. Limits: amount ≤ 1000¢, count ≤ 200, full Map 1–300¢ × 1–100 coins. Summary: `index_summary.html`.

## Open questions
- Target age/reading level (affects wording and default numbers)?
- Include half-dollar and dollar coin by default, or only via settings?
- Should the Table Top enforce the count (stop at N) or allow overshoot with feedback? (Suggest feedback, not blocking.)
- Quiz/lives mechanic like Primes 01, or free exploration only?

## Acceptance criteria
- Default problem (50 coins = $1.00 with P/N/D/Q) loads and lists all valid combos.
- Changing the combo in any view updates the other three immediately.
- Coins can be dragged on and off the table with mouse and touch.
- Status line correctly reports count and value differences.
- Equations show substituted values and stay consistent with the table.
- Coin Walk ends on the target for a solution; Rose shows one shape per solution (count matches the Solutions list); clicking a shape loads it.
- Problems with no solutions show a clear message.
- Works on tablet-size screens without horizontal scrolling.

## Status update (consolidated 2026-10-05) — current source of truth
The "Status (as built)" and layout sections above describe the original Coin Combinations page. Since then the app grew into **three pages** (nav in `index.html`, switched by `S.page`). Where this differs from earlier text, this section wins.

**Pages:** Coin Combinations (original), Crystal Garden (`js/crystals.js`), Coin Club (`js/learn.js`). Script order: core, table, views, strategies, crystals, learn, app.

**Changes superseding earlier text**
- Sort labels now read "pennies: 30 coins - 30¢" (supersedes the "1 pile of 4 ... · $1.50" wording). A white vertical addition (e.g. 10¢ + 10¢ + $1.80 = $2.00) sits in the table's lower right (`sumSvg`).
- Families panel: a 3 s animation (`famAnimate`) after sorting; removed coins are dashed, added coins green; then the table updates (1 s). The animation stays after finishing. The left (main) table does not animate on update.
- Rose view: still present in Views as a panel. *Separately*, the **Rose prism** crystal shape was replaced (see below).
- Dollar coin label is now "w" (whole dollar), e.g. "d10 w2".
- Shared actions bar is hidden on the Coin Club page.

**Crystal Garden (current)**
- Each solution is a crystal on a tabletop physics canvas; coin shares drive size, colour and shape. Half dollars and dollars (H, S) included when enabled.
- Shapes: **Spiky prism** (default; rotating 3D, alternating spikes, double-sided faces), **Snowflake**, **Gem** (front-view brilliant cut; six features driven by P, N, D, Q, H, S shares).
- Palettes: **jewel** (default), **candy**, **aurora**, as swatch strips.
- *Historical/removed:* the earlier shapes (rose prism, 3D, conical, others) and the 4 colour buttons / 8 themes.

**Coin Club (current):** flash-card deck of coin facts plus coin photos from `assets/`. Deck size is locked (`.fact-card` 390px, `#deck` min 526px, `.deck-nav` 96px) so lower content does not jump.

**Verified (browser, scripted/visual):** Crystal Garden shows 3 shapes and 3 palettes, no console errors, Gem varies across a 12-coin $3.00 set with H and S enabled, labels use "w".
**Unverified:** Spiky prism double-sided faces and rotation after the last edit; Snowflake and Candy/Aurora after the theme cut; the user-reported "flip through cards doesn't update correctly" bug was not reproduced (assumed layout shift); touch and iPad use.
**Open:** the green note under the Crystal Garden canvas overlaps the canvas bottom (user screenshot); the user's last message about moving something was cut off.
**Folders:** `V1/`, `V2/`, `V3 - love this/` are earlier snapshots; `V3` is the user's favoured earlier version. Do not edit them.