import React from "react";
import { type Word } from "./useWordSearchLogic";

interface WordListProps {
  words: Word[];
}

export const WordList: React.FC<WordListProps> = ({ words }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="mb-3 text-xl font-bold text-gray-800">Cari Kata:</h3>
      <div className="flex flex-wrap gap-2">
        {words.map((word) => (
          <span
            key={word.id}
            className={`px-3 py-1 text-sm font-medium rounded-full border ${
              word.isFound
                ? "bg-green-100 text-green-700 border-green-200 line-through opacity-60"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            {word.text}
          </span>
        ))}
      </div>
    </div>
  );
};
