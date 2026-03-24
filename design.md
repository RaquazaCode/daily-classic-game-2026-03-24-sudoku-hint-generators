# Design Notes

## Game Choice
- Source game: Sudoku (digital)
- Twist candidate selected: `hint generators`

## MVP Scope
- Fixed 9x9 Sudoku board with deterministic puzzle and solution.
- Mouse click cell selection and numeric entry for guesses.
- Mistake limit of 3, score and combo tracking, win/lose states.
- Hint generator mechanic: charges regenerate every 20 seconds of active run time.

## Determinism
- No randomization is used in puzzle layout, hint target selection, or timers.
- `window.advanceTime(ms)` advances fixed-step simulation.
- `window.render_game_to_text()` serializes full board/status for reproducible checks.

## Controls
- `Enter`: start from title
- `1-9`: place value in selected cell
- `Alt+1-9`: change selected digit without placing
- `H`: consume hint charge
- `P`: pause/resume
- `R`: soft reset run
- `Shift+R`: hard reset (also clears high score)
