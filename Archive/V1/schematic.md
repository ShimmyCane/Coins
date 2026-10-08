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
- **Sort ×5 / Sort ×10** (built): animates coins (CSS transform transition, ~0.7s) into stacks of 5 or 10, one band per coin type, each band labelled e.g. "pennies: 9 piles of 5 = 45 coins · 45¢" (leftovers shown as "extra"). The table grows taller when needed. Any add/remove/drag clears the sorted layout and labels.
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

### 4) Graphical — Solution Space
- With 2 free variables the solutions are points on a line/lattice; with more, use projection.
- **As built — graph of all solutions.** With 4 coin types and two rules (count, value), choosing two coin types for the axes forces the other two, so every point is a complete answer. Axis pickers choose which two to plot.
- Big dots = complete integer answers (hover shows all coin counts; click loads it; green = already found). The count matches the Solutions list.
- Green polygon = region where the two forced coins stay ≥ 0; its two edges (blue/orange lines) are where each forced coin hits 0. Small grey dots = grid points inside the region that need a fractional coin (not answers), which explains the lattice pattern.
- Red ring = current table combo.
- With 5–6 coin types, two are solved automatically and the rest are held fixed with +/− steppers; with exactly 2 types the answer is a single point.
- *Superseded:* an earlier version drew only a count line and value line with the other coins held fixed; it showed a single crossing point and confused the user.

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
- **Problem Map** — heat map of amount (x) × coin count (y) coloured by number of solutions; hover shows counts, click loads that problem.
- **Sweeps** — bar charts of solution count holding count fixed (varying amount) and holding amount fixed (varying count); click a bar to load.
- **Surprise me** — random solvable problem.
- **Predict first** — optional: guess the number of ways (none / 1 / 2–5 / 6–20 / 21+) before the answer is revealed; tracks a streak. Solutions, Graph and Map are hidden until guessed.
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

## Layout specification (as built in `index.html`)
- Single self-contained `index.html` (inline CSS and JS, no dependencies).
- Header: problem bar (amount, coins, coin-type chips, action buttons), status chips, predict card.
- Left: Table Top (drag from tray, drag off to remove, double-click to remove, auto-arrange).
- Right: toggle buttons grouped as Views (Table, Equations, Graph, Map), Strategies (Trade, Two-step, Peel-off, Bounds, Two types, Balance, Families), Progress (Solutions, History). Each button is **+ / −**; any number of panels can be open at once and stack vertically without overwriting each other, each with a − close button in its corner. Hidden panels keep their state. Only Table is open by default. (*Supersedes* the original one-panel-at-a-time tab strip.)
- Narrow screens stack the Table Top above the panels.

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
`index.html` is a single self-contained file implementing all four representations, all seven strategies and the permutation engine for Coins 1. Coins 2–5 tabs are disabled placeholders. Verified by scripted browser checks (no JS errors, dot count = solutions list, sort labels, panel toggles); touch input and very large sorts are untested. Constants: amount ≤ 1000¢, count ≤ 200, Map covers 1–300¢ × 1–100 coins. Summary: `index_summary.html`.

## Open questions
- Target age/reading level (affects wording and default numbers)?
- Include half-dollar and dollar coin by default, or only via settings?
- Should the Table Top enforce the count (stop at N) or allow overshoot with feedback? (Suggest feedback, not blocking.)
- Quiz/lives mechanic like Primes 01, or free exploration only?
- Graph for >3 coin types: slice/projection vs restricting to 2 free variables.

## Acceptance criteria
- Default problem (50 coins = $1.00 with P/N/D/Q) loads and lists all valid combos.
- Changing the combo in any view updates the other three immediately.
- Coins can be dragged on and off the table with mouse and touch.
- Status line correctly reports count and value differences.
- Equations show substituted values and stay consistent with the table.
- Graph highlights valid integer solutions and the current combo; clicking a point loads it.
- Problems with no solutions show a clear message.
- Works on tablet-size screens without horizontal scrolling.
