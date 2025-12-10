import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WordSearchGrid } from './components/WordSearchGrid';
import { WordList } from './components/WordList';
import { GameHeader } from './components/GameHeader';
import { GameOverModal } from './components/GameOverModal';
import './styles/word-search.css';

export interface Word {
  text: string;
  found: boolean;
}

export interface GridCell {
  letter: string;
  row: number;
  col: number;
  isSelected: boolean;
  isFound: boolean;
  wordIndex?: number;
}

const WordSearchNew = () => {
  const navigate = useNavigate();
  
  // Game state
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [words, setWords] = useState<Word[]>([
    { text: 'COFFEE', found: false },
    { text: 'TEA', found: false },
    { text: 'JUICE', found: false },
    { text: 'WATER', found: false },
    { text: 'SODA', found: false }
  ]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [round, setRound] = useState(1);
  const [maxRounds] = useState(5);
  
  // Selection state
  const [selectedCells, setSelectedCells] = useState<GridCell[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  // Initialize grid
  useEffect(() => {
    initializeGrid();
  }, []);

  // Timer
  useEffect(() => {
    if (isPaused || isGameOver) return;
    
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isGameOver]);

  // Check if all words found
  useEffect(() => {
    const allFound = words.every(word => word.found);
    if (allFound && words.length > 0) {
      if (round < maxRounds) {
        // Next round
        setTimeout(() => {
          setRound(prev => prev + 1);
          initializeGrid();
          setSelectedCells([]);
        }, 1000);
      } else {
        // Game over
        setTimeout(() => {
          setIsGameOver(true);
        }, 1000);
      }
    }
  }, [words, round, maxRounds]);

  const initializeGrid = () => {
    const gridSize = 10;
    const newGrid: GridCell[][] = [];
    
    // Create empty grid
    for (let i = 0; i < gridSize; i++) {
      const row: GridCell[] = [];
      for (let j = 0; j < gridSize; j++) {
        row.push({
          letter: '',
          row: i,
          col: j,
          isSelected: false,
          isFound: false
        });
      }
      newGrid.push(row);
    }

    // Place words in grid (horizontal, vertical, diagonal)
    const wordsToPlace = [...words];
    wordsToPlace.forEach((word, index) => {
      placeWordInGrid(newGrid, word.text, index);
    });

    // Fill remaining cells with random letters
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (newGrid[i][j].letter === '') {
          newGrid[i][j].letter = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }

    setGrid(newGrid);
    setWords(words.map(w => ({ ...w, found: false })));
  };

  const placeWordInGrid = (grid: GridCell[][], word: string, wordIndex: number) => {
    const directions = [
      { dx: 0, dy: 1 },  // horizontal
      { dx: 1, dy: 0 },  // vertical
      { dx: 1, dy: 1 },  // diagonal down-right
      { dx: 1, dy: -1 }  // diagonal down-left
    ];

    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!placed && attempts < maxAttempts) {
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const startRow = Math.floor(Math.random() * grid.length);
      const startCol = Math.floor(Math.random() * grid[0].length);

      if (canPlaceWord(grid, word, startRow, startCol, direction.dx, direction.dy)) {
        // Place the word
        for (let i = 0; i < word.length; i++) {
          const row = startRow + i * direction.dx;
          const col = startCol + i * direction.dy;
          grid[row][col].letter = word[i];
          grid[row][col].wordIndex = wordIndex;
        }
        placed = true;
      }
      attempts++;
    }
  };

  const canPlaceWord = (
    grid: GridCell[][],
    word: string,
    row: number,
    col: number,
    dx: number,
    dy: number
  ): boolean => {
    for (let i = 0; i < word.length; i++) {
      const newRow = row + i * dx;
      const newCol = col + i * dy;

      if (
        newRow < 0 || newRow >= grid.length ||
        newCol < 0 || newCol >= grid[0].length ||
        (grid[newRow][newCol].letter !== '' && grid[newRow][newCol].letter !== word[i])
      ) {
        return false;
      }
    }
    return true;
  };

  const handleCellMouseDown = (cell: GridCell) => {
    setIsSelecting(true);
    setSelectedCells([cell]);
    updateCellSelection([cell], true);
  };

  const handleCellMouseEnter = (cell: GridCell) => {
    if (!isSelecting) return;

    const newSelection = [...selectedCells];
    
    // Check if cell is adjacent to last selected cell
    if (newSelection.length > 0) {
      const lastCell = newSelection[newSelection.length - 1];
      const isAdjacent = Math.abs(cell.row - lastCell.row) <= 1 && 
                         Math.abs(cell.col - lastCell.col) <= 1;
      
      if (isAdjacent && !newSelection.some(c => c.row === cell.row && c.col === cell.col)) {
        newSelection.push(cell);
        setSelectedCells(newSelection);
        updateCellSelection(newSelection, true);
      }
    }
  };

  const handleCellMouseUp = () => {
    setIsSelecting(false);
    checkSelectedWord();
  };

  const updateCellSelection = (cells: GridCell[], selected: boolean) => {
    const newGrid = grid.map(row =>
      row.map(cell => {
        const isInSelection = cells.some(c => c.row === cell.row && c.col === cell.col);
        return { ...cell, isSelected: isInSelection && selected };
      })
    );
    setGrid(newGrid);
  };

  const checkSelectedWord = () => {
    if (selectedCells.length === 0) return;

    const selectedWord = selectedCells.map(cell => cell.letter).join('');
    const reversedWord = selectedWord.split('').reverse().join('');

    const foundWordIndex = words.findIndex(
      word => !word.found && (word.text === selectedWord || word.text === reversedWord)
    );

    if (foundWordIndex !== -1) {
      // Word found!
      const newWords = [...words];
      newWords[foundWordIndex].found = true;
      setWords(newWords);
      setScore(prev => prev + selectedWord.length * 10);

      // Mark cells as found
      const newGrid = grid.map(row =>
        row.map(cell => {
          const isInSelection = selectedCells.some(c => c.row === cell.row && c.col === cell.col);
          return {
            ...cell,
            isFound: isInSelection || cell.isFound,
            isSelected: false
          };
        })
      );
      setGrid(newGrid);
    } else {
      // Wrong selection
      updateCellSelection(selectedCells, false);
    }

    setSelectedCells([]);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleExit = () => {
    navigate('/');
  };

  const handleRestart = () => {
    setScore(0);
    setTimer(0);
    setRound(1);
    setIsGameOver(false);
    initializeGrid();
    setSelectedCells([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="word-search-container">
      <div className="word-search-game">
        <GameHeader
          score={score}
          timer={formatTime(timer)}
          round={round}
          maxRounds={maxRounds}
          isPaused={isPaused}
          onPause={handlePause}
          onExit={handleExit}
        />

        <div className="game-content">
          <WordSearchGrid
            grid={grid}
            onCellMouseDown={handleCellMouseDown}
            onCellMouseEnter={handleCellMouseEnter}
            onCellMouseUp={handleCellMouseUp}
            isPaused={isPaused}
          />

          <WordList words={words} />
        </div>

        <div className="progress-indicator">
          <div className="progress-text">Round {round} of {maxRounds}</div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(round / maxRounds) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {isGameOver && (
        <GameOverModal
          score={score}
          time={formatTime(timer)}
          onRestart={handleRestart}
          onExit={handleExit}
        />
      )}

      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-content">
            <h2>PAUSED</h2>
            <Button onClick={handlePause} size="lg">
              Resume Game
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordSearchNew;
