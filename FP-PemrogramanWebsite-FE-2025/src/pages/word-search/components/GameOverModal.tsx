import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Home } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  time: string;
  totalWordsFound: number;
  totalWords: number;
  onRestart: () => void;
  onExit: () => void;
}

export const GameOverModal = ({
  score,
  time,
  totalWordsFound,
  totalWords,
  onRestart,
  onExit
}: GameOverModalProps) => {
  const isPerfect = totalWordsFound === totalWords;

  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        <div className="trophy-icon">
          <Trophy className="w-16 h-16" />
        </div>
        
        <h2 className="game-over-title">
          {isPerfect ? 'Perfect!' : 'Game Over'}
        </h2>
        <p className="game-over-subtitle">
          {isPerfect ? 'You found all the words!' : 'Great effort!'}
        </p>

        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">Final Score</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Words Found</span>
            <span className="stat-value">{totalWordsFound} / {totalWords}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Time Taken</span>
            <span className="stat-value">{time}</span>
          </div>
        </div>

        <div className="modal-actions">
          <Button 
            onClick={onRestart} 
            size="lg"
            className="action-button primary"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
          <Button 
            onClick={onExit} 
            variant="outline"
            size="lg"
            className="action-button"
          >
            <Home className="w-5 h-5 mr-2" />
            Exit to Home
          </Button>
        </div>
      </div>
    </div>
  );
};