# Implementation Plan - 2026-03-24 Sudoku Hint Generators

1. Scaffold a new daily game repository in `games/2026-03-24-sudoku-hint-generators`.
2. Implement deterministic Sudoku gameplay core with fixed puzzle and solution.
3. Apply twist: hint charges auto-generate on a deterministic timer.
4. Wire browser UI for cell selection, number entry, pause/resume, reset, and hint use.
5. Expose automation hooks: `window.advanceTime(ms)` and `window.render_game_to_text()`.
6. Add deterministic verification test and Playwright capture script with standard action payload schema.
7. Validate via `pnpm install`, `pnpm test`, `pnpm build`, and `pnpm capture`.
8. Publish with feature-branch flow, PR merge, and post-merge deploy.
