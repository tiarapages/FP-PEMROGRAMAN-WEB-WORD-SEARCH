import type { GridCell } from '../types.ts';

interface WordSearchGridProps {
  grid: GridCell[][];
  onCellMouseDown: (cell: GridCell) => void;
  onCellMouseEnter: (cell: GridCell) => void;
  onCellMouseUp: () => void;
  isPaused: boolean;
}

export const WordSearchGrid = ({
  grid,
  onCellMouseDown,
  onCellMouseEnter,
  onCellMouseUp,
  isPaused
}: WordSearchGridProps) => {
  const handleMouseDown = (cell: GridCell) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPaused) return;
    onCellMouseDown(cell);
  };

  const handleMouseEnter = (cell: GridCell) => () => {
    if (isPaused) return;
    onCellMouseEnter(cell);
  };

  return (
    <div className="grid-container">
      <div 
        className="letter-grid"
        onMouseUp={onCellMouseUp}
        onMouseLeave={onCellMouseUp}
      >
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`grid-cell ${cell.isSelected ? 'selected' : ''} ${cell.isFound ? 'found' : ''}`}
                onMouseDown={handleMouseDown(cell)}
                onMouseEnter={handleMouseEnter(cell)}
              >
                {cell.letter}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};