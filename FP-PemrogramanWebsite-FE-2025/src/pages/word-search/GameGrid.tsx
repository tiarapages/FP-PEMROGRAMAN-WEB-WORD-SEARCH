import React from "react";
import { type GridCell } from "./useWordSearchLogic";
import { cn } from "@/lib/utils"; // Pastikan path utils cn ShadCN benar

interface GameGridProps {
  grid: GridCell[][];
  onCellClick: (row: number, col: number) => void;
}

export const GameGrid: React.FC<GameGridProps> = ({ grid, onCellClick }) => {
  return (
    <div
      className="grid gap-1 p-4 bg-white rounded-lg shadow-md select-none"
      style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}
    >
      {grid.map((row, rIndex) =>
        row.map((cell, cIndex) => (
          <button
            key={cell.id}
            onClick={() => onCellClick(rIndex, cIndex)}
            className={cn(
              "w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-bold text-lg rounded border transition-colors",
              cell.isRevealed
                ? "bg-green-500 text-white border-green-600" // Warna kalau ketemu
                : "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300", // Warna default
            )}
          >
            {cell.char}
          </button>
        )),
      )}
    </div>
  );
};
