import {
  advanceTime,
  applyDigit,
  constants,
  createGameState,
  forceStart,
  renderStateToText,
  resetRun,
  selectCell,
  setSelectedDigit,
  snapshot,
  step,
  togglePause,
  useHint,
} from "./game-core.js";

const boardEl = document.querySelector("#board");
const digitsEl = document.querySelector("#digits");
const modeEl = document.querySelector("#mode");
const scoreEl = document.querySelector("#score");
const highEl = document.querySelector("#high-score");
const mistakesEl = document.querySelector("#mistakes");
const hintsEl = document.querySelector("#hints");
const comboEl = document.querySelector("#combo");
const eventEl = document.querySelector("#event");
const hintBtn = document.querySelector("#hint-btn");
const pauseBtn = document.querySelector("#pause-btn");
const resetBtn = document.querySelector("#reset-btn");

let state = createGameState();

function renderDigits() {
  digitsEl.innerHTML = "";
  for (let digit = 1; digit <= 9; digit += 1) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "digit";
    btn.textContent = String(digit);
    btn.setAttribute("aria-label", `Select digit ${digit}`);
    if (digit === state.selectedDigit) {
      btn.dataset.selected = "true";
    }
    btn.addEventListener("click", () => {
      setSelectedDigit(state, digit);
      render();
    });
    digitsEl.appendChild(btn);
  }
}

function renderBoard() {
  boardEl.innerHTML = "";
  for (const cell of state.cells) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cell";
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-label", `Cell r${cell.row + 1} c${cell.col + 1}`);
    if (cell.given) {
      button.dataset.given = "true";
    }
    if (cell.conflict) {
      button.dataset.conflict = "true";
    }
    if (state.selectedCellIndex === cell.row * 9 + cell.col) {
      button.dataset.selected = "true";
    }
    button.textContent = cell.value === 0 ? "" : String(cell.value);
    button.addEventListener("click", () => {
      selectCell(state, cell.row, cell.col);
      render();
    });
    boardEl.appendChild(button);
  }
}

function renderHud() {
  modeEl.textContent = state.mode;
  scoreEl.textContent = String(state.score);
  highEl.textContent = String(state.highScore);
  mistakesEl.textContent = String(state.mistakes);
  hintsEl.textContent = String(state.hintCharges);
  comboEl.textContent = String(state.combo);
  eventEl.textContent = state.lastEvent;
}

function render() {
  renderDigits();
  renderBoard();
  renderHud();
}

function handleStartIfNeeded() {
  if (state.mode === "title") {
    forceStart(state);
    render();
  }
}

function installControls() {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleStartIfNeeded();
      return;
    }
    if (event.key.toLowerCase() === "p") {
      togglePause(state);
      render();
      return;
    }
    if (event.key.toLowerCase() === "r") {
      state = resetRun(state, event.shiftKey);
      render();
      return;
    }
    if (event.key.toLowerCase() === "h") {
      useHint(state);
      render();
      return;
    }
    const numeric = Number.parseInt(event.key, 10);
    if (numeric >= 1 && numeric <= 9) {
      if (event.altKey) {
        setSelectedDigit(state, numeric);
      } else {
        applyDigit(state, numeric);
      }
      render();
      return;
    }

    if (event.key.startsWith("Arrow")) {
      event.preventDefault();
      const row = Math.floor(state.selectedCellIndex / 9);
      const col = state.selectedCellIndex % 9;
      if (event.key === "ArrowUp") {
        selectCell(state, Math.max(0, row - 1), col);
      } else if (event.key === "ArrowDown") {
        selectCell(state, Math.min(8, row + 1), col);
      } else if (event.key === "ArrowLeft") {
        selectCell(state, row, Math.max(0, col - 1));
      } else if (event.key === "ArrowRight") {
        selectCell(state, row, Math.min(8, col + 1));
      }
      render();
    }
  });

  hintBtn.addEventListener("click", () => {
    useHint(state);
    render();
  });

  pauseBtn.addEventListener("click", () => {
    togglePause(state);
    render();
  });

  resetBtn.addEventListener("click", () => {
    state = resetRun(state, false);
    render();
  });
}

function gameLoop() {
  if (state.mode === "running") {
    step(state, constants.STEP_MS);
    renderHud();
  }
  window.requestAnimationFrame(gameLoop);
}

window.advanceTime = (ms) => {
  advanceTime(state, ms);
  render();
  return snapshot(state);
};

window.render_game_to_text = () => renderStateToText(state);
window.__runDeterministicVerification = () => {
  const probe = createGameState();
  forceStart(probe);
  selectCell(probe, 0, 0);
  applyDigit(probe, 5);
  selectCell(probe, 0, 1);
  applyDigit(probe, 3);
  advanceTime(probe, 25000);
  return snapshot(probe);
};

installControls();
render();
window.requestAnimationFrame(gameLoop);
