import assert from "node:assert/strict";
import {
  advanceTime,
  applyDigit,
  constants,
  createGameState,
  forceStart,
  renderStateToText,
  selectCell,
  setSelectedDigit,
  useHint,
} from "../src/game-core.js";

const state = createGameState();
forceStart(state);

selectCell(state, 0, 0);
setSelectedDigit(state, 5);
applyDigit(state);
assert.equal(state.score > 0, true, "correct move should increase score");
assert.equal(state.mistakes, 0, "mistakes should stay at zero");

selectCell(state, 8, 8);
applyDigit(state, 4);
assert.equal(state.mistakes, 1, "incorrect move should increment mistakes");

const hintsBefore = state.hintCharges;
advanceTime(state, constants.HINT_RECHARGE_MS);
assert.equal(state.hintCharges, Math.min(hintsBefore + 1, constants.MAX_HINT_CHARGES), "hint charge should regenerate");

const used = useHint(state);
assert.equal(used, true, "useHint should fill one unsolved cell");

const text = JSON.parse(renderStateToText(state));
assert.equal(Array.isArray(text.rows), true, "render output should include rows");
assert.equal(text.rows.length, 9, "rows length should be 9");

console.log("game-core tests passed");
