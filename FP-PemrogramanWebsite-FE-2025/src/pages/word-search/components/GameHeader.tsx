import { Button } from '@/components/ui/button';
import { Pause, Play, Menu, Heart } from 'lucide-react';

interface GameHeaderProps {
  score: number;
  timer: string;
  lives: number;
  maxLives: number;
  isPaused: boolean;
  onPause: () => void;
  onExit: () => void;
}

export const GameHeader = ({
  score,
  timer,
  lives,
  maxLives,
  isPaused,
  onPause,
  onExit
}: GameHeaderProps) => {
  return (
    <div className="game-header">
      <Button 
        variant="ghost" 
        size="icon" 
        className="menu-button"
        onClick={onExit}
      >
        <Menu className="w-5 h-5" />
      </Button>

      <div className="game-info">
        {/* LIVES INDICATOR */}
        <div className="info-item">
          <span className="info-label flex items-center gap-1">
             Lives
          </span>
          <div className="info-value flex items-center gap-2">
            <Heart className={`w-5 h-5 ${lives > 0 ? 'fill-red-500 text-red-500' : 'text-gray-300'}`} />
            <span>{lives}/{maxLives}</span>
          </div>
        </div>

        <div className="info-item">
          <span className="info-label">Score</span>
          <span className="info-value score-value">{score}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Time</span>
          <span className="info-value font-mono">{timer}</span>
        </div>
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        className="pause-button"
        onClick={onPause}
      >
        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
      </Button>
    </div>
  );
};