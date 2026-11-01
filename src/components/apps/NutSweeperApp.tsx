import React, { useState, useEffect } from 'react';
import { sound } from '../../audio/soundEngine';

interface Cell {
  row: number;
  col: number;
  hasMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

const ROWS = 9;
const COLS = 9;
const TOTAL_MINES = 10;

const generateBoard = (): Cell[][] => {
  const newGrid: Cell[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < COLS; c++) {
      row.push({
        row: r,
        col: c,
        hasMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      });
    }
    newGrid.push(row);
  }

  let placed = 0;
  while (placed < TOTAL_MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!newGrid[r][c].hasMine) {
      newGrid[r][c].hasMine = true;
      placed++;
    }
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!newGrid[r][c].hasMine) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
              if (newGrid[nr][nc].hasMine) count++;
            }
          }
        }
        newGrid[r][c].neighborMines = count;
      }
    }
  }
  return newGrid;
};

export const NutSweeperApp: React.FC = () => {
  const [grid, setGrid] = useState<Cell[][]>(() => generateBoard());
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [mineCount, setMineCount] = useState<number>(TOTAL_MINES);
  const [timer, setTimer] = useState<number>(0);
  const [isPressing, setIsPressing] = useState<boolean>(false);

  // Re-initialize board
  const initBoard = () => {
    setGrid(generateBoard());
    setGameOver(false);
    setGameWon(false);
    setMineCount(TOTAL_MINES);
    setTimer(0);
  };

  // Timer tick
  useEffect(() => {
    if (gameOver || gameWon) return;
    const interval = setInterval(() => {
      setTimer(t => Math.min(999, t + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameOver, gameWon]);

  // Reveal cell with flood fill for 0-neighbor cells
  const revealCell = (r: number, c: number) => {
    if (gameOver || gameWon || grid[r][c].isRevealed || grid[r][c].isFlagged) return;

    sound.playClick();
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));

    if (newGrid[r][c].hasMine) {
      // Hit a mine!
      sound.playError();
      setGameOver(true);
      // Reveal all mines
      for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
          if (newGrid[i][j].hasMine) {
            newGrid[i][j].isRevealed = true;
          }
        }
      }
      setGrid(newGrid);
      return;
    }

    const floodReveal = (rowIdx: number, colIdx: number) => {
      if (rowIdx < 0 || rowIdx >= ROWS || colIdx < 0 || colIdx >= COLS) return;
      const cell = newGrid[rowIdx][colIdx];
      if (cell.isRevealed || cell.isFlagged || cell.hasMine) return;

      cell.isRevealed = true;
      if (cell.neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr !== 0 || dc !== 0) {
              floodReveal(rowIdx + dr, colIdx + dc);
            }
          }
        }
      }
    };

    floodReveal(r, c);

    // Check Win
    let unrevealedSafe = 0;
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (!newGrid[i][j].hasMine && !newGrid[i][j].isRevealed) {
          unrevealedSafe++;
        }
      }
    }

    if (unrevealedSafe === 0) {
      sound.playStamp();
      setGameWon(true);
    }

    setGrid(newGrid);
  };

  // Flag cell on right-click
  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || gameWon || grid[r][c].isRevealed) return;

    sound.playClick();
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    const cell = newGrid[r][c];

    if (cell.isFlagged) {
      cell.isFlagged = false;
      setMineCount(m => m + 1);
    } else {
      cell.isFlagged = true;
      setMineCount(m => m - 1);
    }
    setGrid(newGrid);
  };

  const getNumberColor = (num: number) => {
    switch (num) {
      case 1: return '#0000ff';
      case 2: return '#008000';
      case 3: return '#ff0000';
      case 4: return '#000080';
      case 5: return '#800000';
      case 6: return '#008080';
      case 7: return '#000000';
      case 8: return '#808080';
      default: return '#000000';
    }
  };

  const renderSmiley = () => {
    if (gameOver) return '😵';
    if (gameWon) return '😎';
    if (isPressing) return '😮';
    return '🙂';
  };

  return (
    <div 
      className="flex-1 flex flex-col items-center justify-between p-2 select-none h-full bg-[#c0c0c0]"
      onMouseDown={() => setIsPressing(true)}
      onMouseUp={() => setIsPressing(false)}
    >
      {/* Top Header / Scoreboard */}
      <div className="w98-inset w-full p-1.5 bg-[#c0c0c0] flex items-center justify-between mb-2">
        {/* Mine counter */}
        <div className="w98-led-counter text-xl">
          {String(Math.max(0, mineCount)).padStart(3, '0')}
        </div>

        {/* Smiley Reset Button */}
        <button
          onClick={initBoard}
          className="w98-outset w-7 h-7 flex items-center justify-center text-base hover:bg-gray-200 active:scale-95"
          title="Restart Game"
        >
          {renderSmiley()}
        </button>

        {/* Timer */}
        <div className="w98-led-counter text-xl">
          {String(timer).padStart(3, '0')}
        </div>
      </div>

      {/* Minesweeper Grid */}
      <div 
        className="w98-inset p-1 bg-[#808080] inline-block shadow-inner"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 22px)`,
          gridTemplateRows: `repeat(${ROWS}, 22px)`,
          gap: '1px'
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            return (
              <div
                key={`${r}-${c}`}
                onClick={() => revealCell(r, c)}
                onContextMenu={(e) => handleRightClick(e, r, c)}
                className={`w-[22px] h-[22px] flex items-center justify-center font-bold text-[11px] cursor-default select-none ${
                  cell.isRevealed
                    ? 'bg-[#c0c0c0] border border-[#808080]/40'
                    : 'w98-outset bg-[#c0c0c0] active:border-none'
                }`}
              >
                {cell.isRevealed ? (
                  cell.hasMine ? (
                    <span className="text-[12px]">💣</span>
                  ) : cell.neighborMines > 0 ? (
                    <span style={{ color: getNumberColor(cell.neighborMines) }}>
                      {cell.neighborMines}
                    </span>
                  ) : null
                ) : cell.isFlagged ? (
                  <span className="text-[11px] text-red-600">🚩</span>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {/* Sarcastic game status footer */}
      <div className="text-[10px] text-gray-700 mt-2 text-center">
        {gameWon && <span className="text-green-800 font-bold">MINEFIELD CLEARED: Urge Neutralized!</span>}
        {gameOver && <span className="text-red-800 font-bold">DETONATION! Clear your head and try again!</span>}
        {!gameWon && !gameOver && <span>Left-click: Reveal • Right-click: Flag Mine</span>}
      </div>
    </div>
  );
};
