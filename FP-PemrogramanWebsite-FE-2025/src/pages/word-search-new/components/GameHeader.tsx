import { Button } from '@/components/ui/button';
import { Pause, Play, Menu } from 'lucide-react';

interface GameHeaderProps {
  score: number;
  timer: string;
  round: number;
  maxRounds: number;
  isPaused: boolean;
  onPause: () => void;
  onExit: () => void;
}

export const GameHeader = ({
  score,
  timer,
  round,
  maxRounds,
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
        <div className="info-item">
          <span className="info-label">Round:</span>
          <span className="info-value">{round}/{maxRounds}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Score:</span>
          <span className="info-value score-value">{score}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Time:</span>
          <span className="info-value">{timer}</span>
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
