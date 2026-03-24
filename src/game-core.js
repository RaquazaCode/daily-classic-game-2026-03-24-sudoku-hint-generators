export const STEP_MS = 100;
export const MAX_MISTAKES = 3;
export const HINT_RECHARGE_MS = 20000;
export const MAX_HINT_CHARGES = 3;

const PUZZLE = [
  [0, 0, 4, 6, 0, 8, 9, 1, 2],
  [6, 7, 0, 1, 9, 5, 0, 4, 8],
  [1, 0, 8, 3, 4, 0, 5, 6, 7],
  [8, 5, 9, 0, 6, 1, 4, 2, 0],
  [4, 2, 6, 8, 0, 3, 7, 9, 1],
  [7, 1, 0, 9, 2, 4, 8, 0, 6],
  [9, 6, 1, 0, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 0, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 0],
];

const SOLUTION = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

function cloneGrid(grid) {
  return grid.map((row) => [...row]);
}

function indexToCell(index) {
  return {
    row: Math.floor(index / 9),
    col: index % 9,
  };
}

function cellToIndex(row, col) {
  return row * 9 + col;
}

function createInitialCells() {
  const cells = [];
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const value = PUZZLE[row][col];
      cells.push({
        row,
        col,
        value,
        given: value !== 0,
        conflict: false,
      });
    }
  }
  return cells;
}

function computeCompletion(cells) {
  return cells.every((cell) => cell.value === SOLUTION[cell.row][cell.col]);
}

function findHintTarget(cells) {
  for (const cell of cells) {
    if (cell.given) {
      continue;
    }
    if (cell.value !== SOLUTION[cell.row][cell.col]) {
      return cell;
    }
  }
  return null;
}

export function createGameState() {
  return {
    mode: "title",
    tick: 0,
    elapsedMs: 0,
    score: 0,
    highScore: 0,
    combo: 0,
    mistakes: 0,
    selectedDigit: 1,
    selectedCellIndex: 0,
    hintCharges: 1,
    hintCooldownMs: HINT_RECHARGE_MS,
    lastEvent: "Press Enter to start",
    cells: createInitialCells(),
  };
}

function startRun(state) {
  state.mode = "running";
  state.lastEvent = "Run started";
}

export function resetRun(state, hard = false) {
  const highScore = hard ? 0 : state.highScore;
  const next = createGameState();
  next.highScore = Math.max(highScore, state.score, state.highScore);
  return next;
}

export function setSelectedDigit(state, digit) {
  if (digit >= 1 && digit <= 9) {
    state.selectedDigit = digit;
  }
}

export function selectCell(state, row, col) {
  if (row < 0 || row > 8 || col < 0 || col > 8) {
    return;
  }
  state.selectedCellIndex = cellToIndex(row, col);
}

function finalizeIfComplete(state) {
  if (!computeCompletion(state.cells)) {
    return;
  }
  state.mode = "won";
  state.score += 500;
  state.highScore = Math.max(state.highScore, state.score);
  state.lastEvent = "Puzzle solved";
}

export function applyDigit(state, digit = state.selectedDigit) {
  if (state.mode !== "running") {
    return;
  }
  if (digit < 1 || digit > 9) {
    return;
  }
  const { row, col } = indexToCell(state.selectedCellIndex);
  const cell = state.cells[state.selectedCellIndex];
  if (cell.given) {
    state.lastEvent = "Given cells cannot be edited";
    return;
  }

  const expected = SOLUTION[row][col];
  if (digit === expected) {
    if (cell.value !== expected) {
      cell.value = expected;
      cell.conflict = false;
      state.combo += 1;
      state.score += 100 + Math.min(40, state.combo * 10);
      state.lastEvent = `Placed ${digit} at r${row + 1}c${col + 1}`;
      state.highScore = Math.max(state.highScore, state.score);
      finalizeIfComplete(state);
    } else {
      state.lastEvent = "Cell already solved";
    }
    return;
  }

  state.mistakes += 1;
  state.combo = 0;
  cell.value = digit;
  cell.conflict = true;
  state.score = Math.max(0, state.score - 20);
  state.lastEvent = `Incorrect ${digit} at r${row + 1}c${col + 1}`;

  if (state.mistakes >= MAX_MISTAKES) {
    state.mode = "lost";
    state.lastEvent = "Too many mistakes";
  }
}

export function useHint(state) {
  if (state.mode !== "running") {
    return false;
  }
  if (state.hintCharges <= 0) {
    state.lastEvent = "No hint charges available";
    return false;
  }

  const target = findHintTarget(state.cells);
  if (!target) {
    state.lastEvent = "No hint needed";
    return false;
  }

  target.value = SOLUTION[target.row][target.col];
  target.conflict = false;
  state.hintCharges -= 1;
  state.combo = 0;
  state.score = Math.max(0, state.score - 40);
  state.lastEvent = `Hint filled r${target.row + 1}c${target.col + 1}`;

  finalizeIfComplete(state);
  return true;
}

function tickTimers(state, deltaMs) {
  if (state.mode !== "running") {
    return;
  }
  state.elapsedMs += deltaMs;

  state.hintCooldownMs -= deltaMs;
  while (state.hintCooldownMs <= 0) {
    if (state.hintCharges < MAX_HINT_CHARGES) {
      state.hintCharges += 1;
      state.lastEvent = "Hint generator produced a charge";
    }
    state.hintCooldownMs += HINT_RECHARGE_MS;
  }
}

export function step(state, deltaMs = STEP_MS) {
  if (state.mode === "title") {
    startRun(state);
  }
  state.tick += 1;
  tickTimers(state, deltaMs);
}

export function togglePause(state) {
  if (state.mode === "running") {
    state.mode = "paused";
    state.lastEvent = "Paused";
    return;
  }
  if (state.mode === "paused") {
    state.mode = "running";
    state.lastEvent = "Resumed";
  }
}

export function forceStart(state) {
  if (state.mode === "title") {
    startRun(state);
  }
}

export function advanceTime(state, ms) {
  const loops = Math.max(0, Math.floor(ms / STEP_MS));
  for (let i = 0; i < loops; i += 1) {
    step(state, STEP_MS);
  }
}

export function snapshot(state) {
  return {
    mode: state.mode,
    score: state.score,
    highScore: state.highScore,
    combo: state.combo,
    mistakes: state.mistakes,
    selectedDigit: state.selectedDigit,
    selectedCellIndex: state.selectedCellIndex,
    hintCharges: state.hintCharges,
    hintCooldownMs: state.hintCooldownMs,
    lastEvent: state.lastEvent,
    board: state.cells.map((cell) => ({
      row: cell.row,
      col: cell.col,
      value: cell.value,
      given: cell.given,
      conflict: cell.conflict,
    })),
  };
}

export function renderStateToText(state) {
  const boardRows = cloneGrid(PUZZLE);
  for (const cell of state.cells) {
    boardRows[cell.row][cell.col] = cell.value;
  }

  return JSON.stringify(
    {
      mode: state.mode,
      score: state.score,
      highScore: state.highScore,
      mistakes: state.mistakes,
      hintCharges: state.hintCharges,
      combo: state.combo,
      lastEvent: state.lastEvent,
      rows: boardRows.map((row) => row.join(" ")),
    },
    null,
    2,
  );
}

export const constants = {
  STEP_MS,
  MAX_MISTAKES,
  HINT_RECHARGE_MS,
  MAX_HINT_CHARGES,
  SOLUTION,
};
