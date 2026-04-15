import { useState, useCallback } from 'react';

export type Tile = {
  id: number;
  value: number;
  x: number;
  y: number;
  mergedFrom?: Tile[];
};

export const use2048 = (size: number = 4) => {
  const [grid, setGrid] = useState<(Tile | null)[][]>(
    Array.from({ length: size }, () => Array(size).fill(null))
  );
  const [score, setScore] = useState(0);
  const [nextId, setNextId] = useState(1);

  const getEmptyCells = useCallback((currentGrid: (Tile | null)[][]) => {
    const emptyCells: { x: number; y: number }[] = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!currentGrid[y][x]) {
          emptyCells.push({ x, y });
        }
      }
    }
    return emptyCells;
  }, [size]);

  const spawnTile = useCallback((value: number) => {
    setGrid((prevGrid) => {
      const emptyCells = getEmptyCells(prevGrid);
      if (emptyCells.length === 0) return prevGrid;

      const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const newTile: Tile = { id: nextId, value, x, y };
      setNextId((id) => id + 1);

      const newGrid = prevGrid.map((row) => [...row]);
      newGrid[y][x] = newTile;
      return newGrid;
    });
  }, [getEmptyCells, nextId]);

  const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    setGrid((prevGrid) => {
      let moved = false;
      let newScore = score;
      const newGrid: (Tile | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
      
      // Helper to get tiles in order based on direction
      const getTraversals = () => {
        const x = Array.from({ length: size }, (_, i) => i);
        const y = Array.from({ length: size }, (_, i) => i);
        if (direction === 'RIGHT') x.reverse();
        if (direction === 'DOWN') y.reverse();
        return { x, y };
      };

      const traversals = getTraversals();
      const vector = {
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 },
        LEFT: { x: -1, y: 0 },
        RIGHT: { x: 1, y: 0 },
      }[direction];

      // Copy existing tiles to new positions first
      const tempGrid = prevGrid.map(row => [...row]);

      traversals.y.forEach(y => {
        traversals.x.forEach(x => {
          const tile = tempGrid[y][x];
          if (tile) {
            let curX = x;
            let curY = y;
            let nextX = x + vector.x;
            let nextY = y + vector.y;

            while (
              nextX >= 0 && nextX < size &&
              nextY >= 0 && nextY < size &&
              !newGrid[nextY][nextX]
            ) {
              curX = nextX;
              curY = nextY;
              nextX += vector.x;
              nextY += vector.y;
            }

            if (
              nextX >= 0 && nextX < size &&
              nextY >= 0 && nextY < size &&
              newGrid[nextY][nextX] &&
              newGrid[nextY][nextX]?.value === tile.value &&
              !newGrid[nextY][nextX]?.mergedFrom
            ) {
              // Merge
              const mergedValue = tile.value * 2;
              newGrid[nextY][nextX] = {
                id: nextId + Math.random(), // Temporary unique ID for merged tile
                value: mergedValue,
                x: nextX,
                y: nextY,
                mergedFrom: [newGrid[nextY][nextX]!, tile]
              };
              newScore += mergedValue;
              moved = true;
            } else {
              newGrid[curY][curX] = { ...tile, x: curX, y: curY };
              if (curX !== x || curY !== y) moved = true;
            }
          }
        });
      });

      if (moved) {
        setScore(newScore);
        return newGrid;
      }
      return prevGrid;
    });
  }, [size, score, nextId]);

  const resetGame = useCallback(() => {
    setGrid(Array.from({ length: size }, () => Array(size).fill(null)));
    setScore(0);
    setNextId(1);
  }, [size]);

  return { grid, score, move, spawnTile, resetGame };
};
