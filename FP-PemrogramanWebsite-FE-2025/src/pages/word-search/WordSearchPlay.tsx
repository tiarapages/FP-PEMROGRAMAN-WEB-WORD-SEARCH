import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '@/api/axios';

type WordSearchGame = {
  id: string;
  name: string;
  description: string;
  game_json: {
    grid: string[][];
    words: string[];
    grid_size: number;
    time_limit: number;
    lives: number;
    directions: string[];
    placed_words: Array<{
      word: string;
      start: { row: number; col: number };
      end: { row: number; col: number };
      direction: string;
    }>;
  };
};

export default function WordSearchPlay() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<WordSearchGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Game state
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [selectedCells, setSelectedCells] = useState<Array<{ row: number; col: number }>>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [livesLeft, setLivesLeft] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/game/game-type/word-search/${gameId}`);
        const gameData = response.data.data;
        setGame(gameData);
        setGrid(gameData.game_json.grid);
        setTimeLeft(gameData.game_json.time_limit);
        setLivesLeft(gameData.game_json.lives);
      } catch (err: any) {
        console.error('Error fetching game:', err);
        setError(err.response?.data?.message || 'Failed to load game');
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchGame();
    }
  }, [gameId]);

  // Timer
  useEffect(() => {
    if (!game || gameStatus !== 'playing' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameStatus('lost');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [game, gameStatus, timeLeft]);

  // Check win condition
  useEffect(() => {
    if (!game) return;
    if (foundWords.size === game.game_json.words.length && gameStatus === 'playing') {
      setGameStatus('won');
    }
  }, [foundWords, game, gameStatus]);

  const handleMouseDown = (row: number, col: number) => {
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isSelecting || !game) return;

    const lastCell = selectedCells[selectedCells.length - 1];
    if (!lastCell) return;

    // Check if movement is valid (straight line in 8 directions)
    const rowDiff = row - selectedCells[0].row;
    const colDiff = col - selectedCells[0].col;

    const isValidDirection =
      rowDiff === 0 || // horizontal
      colDiff === 0 || // vertical
      Math.abs(rowDiff) === Math.abs(colDiff); // diagonal

    if (isValidDirection) {
      setSelectedCells(prev => [...prev, { row, col }]);
    }
  };

  const handleMouseUp = () => {
    if (!game) return;
    setIsSelecting(false);

    if (selectedCells.length < 2) {
      setSelectedCells([]);
      return;
    }

    // Get selected word
    const word = selectedCells.map(cell => grid[cell.row][cell.col]).join('');
    const reverseWord = word.split('').reverse().join('');

    // Check if word is in the list and not already found
    if (
      (game.game_json.words.includes(word.toUpperCase()) ||
        game.game_json.words.includes(reverseWord.toUpperCase())) &&
      !foundWords.has(word.toUpperCase()) &&
      !foundWords.has(reverseWord.toUpperCase())
    ) {
      const foundWord = game.game_json.words.includes(word.toUpperCase())
        ? word.toUpperCase()
        : reverseWord.toUpperCase();
      setFoundWords(prev => new Set([...prev, foundWord]));
    } else if (selectedCells.length >= 2) {
      // Wrong word selected
      setLivesLeft(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameStatus('lost');
        }
        return Math.max(0, newLives);
      });
    }

    setSelectedCells([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="text-2xl text-purple-600">Loading game...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="text-2xl text-red-600 mb-4">{error || 'Game not found'}</div>
        <button
          onClick={() => navigate('/my-projects')}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Back to My Projects
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-purple-900">{game.name}</h1>
              <p className="text-gray-600 mt-1">{game.description}</p>
            </div>
            <button
              onClick={() => navigate('/my-projects')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Exit Game
            </button>
          </div>
        </div>

        {/* Game Stats */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Time Left</div>
              <div className="text-3xl font-bold text-purple-600">{formatTime(timeLeft)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Lives</div>
              <div className="text-3xl font-bold text-red-600">{'❤️'.repeat(livesLeft)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Words Found</div>
              <div className="text-3xl font-bold text-green-600">
                {foundWords.size} / {game.game_json.words.length}
              </div>
            </div>
          </div>
        </div>

        {/* Game Over Modal */}
        {gameStatus !== 'playing' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md">
              <h2 className="text-4xl font-bold text-center mb-4">
                {gameStatus === 'won' ? (
                  <span className="text-green-600">🎉 You Won!</span>
                ) : (
                  <span className="text-red-600">😢 Game Over</span>
                )}
              </h2>
              <p className="text-center text-gray-600 mb-6">
                {gameStatus === 'won'
                  ? `Congratulations! You found all ${game.game_json.words.length} words!`
                  : 'Better luck next time!'}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Play Again
                </button>
                <button
                  onClick={() => navigate('/my-projects')}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Word Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div
                className="inline-block"
                onMouseLeave={() => {
                  if (isSelecting) handleMouseUp();
                }}
              >
                {grid.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex">
                    {row.map((letter, colIndex) => {
                      const isSelected = selectedCells.some(
                        cell => cell.row === rowIndex && cell.col === colIndex
                      );
                      const isInFoundWord = game.game_json.placed_words.some(placedWord => {
                        if (!foundWords.has(placedWord.word)) return false;
                        const { start, end } = placedWord;
                        const rowDiff = end.row - start.row;
                        const colDiff = end.col - start.col;
                        const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
                        const rowStep = rowDiff === 0 ? 0 : rowDiff / steps;
                        const colStep = colDiff === 0 ? 0 : colDiff / steps;

                        for (let i = 0; i <= steps; i++) {
                          const currentRow = start.row + i * rowStep;
                          const currentCol = start.col + i * colStep;
                          if (currentRow === rowIndex && currentCol === colIndex) {
                            return true;
                          }
                        }
                        return false;
                      });

                      return (
                        <div
                          key={colIndex}
                          className={`
                            w-12 h-12 flex items-center justify-center m-1
                            text-xl font-bold border-2 rounded-lg cursor-pointer
                            select-none transition-all duration-150
                            ${
                              isInFoundWord
                                ? 'bg-green-400 border-green-600 text-white'
                                : isSelected
                                  ? 'bg-purple-400 border-purple-600 text-white'
                                  : 'bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100'
                            }
                          `}
                          onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                          onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                          onMouseUp={handleMouseUp}
                        >
                          {letter}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Words List */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-purple-900 mb-4">Words to Find</h2>
            <div className="space-y-2">
              {game.game_json.words.map((word, index) => (
                <div
                  key={index}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all
                    ${
                      foundWords.has(word)
                        ? 'bg-green-100 text-green-700 line-through'
                        : 'bg-purple-50 text-purple-700'
                    }
                  `}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
