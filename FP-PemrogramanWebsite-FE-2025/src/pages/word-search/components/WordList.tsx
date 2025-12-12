import { Check } from 'lucide-react';
import type { Word } from '../types.ts';

interface WordListProps {
  words: Word[];
}

export const WordList = ({ words }: WordListProps) => {
  return (
    <div className="word-list-container">
      <h3 className="word-list-title">Find These Words</h3>
      <div className="word-list">
        {words.map((word, index) => (
          <div 
            key={index} 
            className={`word-item ${word.found ? 'found' : ''}`}
          >
            <span className="word-text">{word.text}</span>
            {word.found && (
              <Check className="w-4 h-4 check-icon" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};