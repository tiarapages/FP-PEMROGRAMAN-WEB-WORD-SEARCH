import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '@/api/axios';
import GameOverPixel from './GameOverPixel';
import toast from 'react-hot-toast';

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
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set()); // Track found cell positions
  const [selectedCells, setSelectedCells] = useState<Array<{ row: number; col: number }>>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [livesLeft, setLivesLeft] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [searchingDifficulty, setSearchingDifficulty] = useState<null | string>(null);

  const getDifficultyLimits = (level: 'easy' | 'medium' | 'hard') => {
    switch (level) {
      case 'easy':
        return { maxWords: 10, gridSize: 10, timeLimit: 600, lives: 10 };
      case 'medium':
        return { maxWords: 15, gridSize: 15, timeLimit: 480, lives: 5 };
      case 'hard':
        return { maxWords: 20, gridSize: 18, timeLimit: 300, lives: 3 };
    }
  };

  const findAndPlayByDifficulty = async (level: 'easy' | 'medium' | 'hard') => {
    try {
      setSearchingDifficulty(level);
      // Fetch published word-search games
      const params = new URLSearchParams();
      params.append('gameTypeSlug', 'word-search');
      const listRes = await axiosInstance.get(`/api/game?${params.toString()}`);
      const gamesList: Array<any> = listRes.data.data || [];

      const limits = getDifficultyLimits(level);

      // Check each game's full play data to match difficulty presets
      for (const g of gamesList) {
        try {
          const detailRes = await axiosInstance.get(`/api/game/game-type/word-search/${g.id}/play/public`);
          const gameDetail = detailRes.data.data;
          const gj = gameDetail.game_json;
          if (!gj) continue;

          // Match by grid_size and lives primarily (timeLimit can vary)
          if (gj.grid_size === limits.gridSize && gj.lives === limits.lives) {
            // Found a matching game
            window.location.href = `/word-search-play/${g.id}`;
            return;
          }
        } catch (e) {
          // ignore game detail fetch errors and continue
          continue;
        }
      }

      toast.error(`No published game found for ${level.toUpperCase()} difficulty`);
      // fallback: navigate to create new with difficulty preselected
      navigate(`/word-search-new?difficulty=${level}`);
    } catch (err) {
      console.error('Error finding game by difficulty:', err);
      toast.error('Failed to find game by difficulty');
      navigate(`/word-search-new?difficulty=${level}`);
    } finally {
      setSearchingDifficulty(null);
      setShowMenuModal(false);
    }
  };

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/game/game-type/word-search/${gameId}/play/public`);
        const gameData = response.data.data;
        console.log('Game data received:', gameData);
        console.log('Words array:', gameData.game_json.words);
        setGame(gameData);
        setGrid(gameData.game_json.grid);
        setTimeLeft(0); // Start from 0:00
        setLivesLeft(5); // Set to 5 lives
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

  // Timer - Count up from 0:00
  useEffect(() => {
    if (!game || gameStatus !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [game, gameStatus]);

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
    
    console.log('Selected word:', word);
    console.log('Reverse word:', reverseWord);
    console.log('Available words:', game.game_json.words);

    // Check if word is in the list (handle words with * prefix)
    const matchedWord = game.game_json.words.find(w => {
      const cleanWord = w.startsWith('*') ? w.substring(1) : w;
      console.log('Checking:', cleanWord, 'vs', word, 'or', reverseWord);
      return cleanWord.toUpperCase() === word.toUpperCase() || 
             cleanWord.toUpperCase() === reverseWord.toUpperCase();
    });

    console.log('Matched word:', matchedWord);
    console.log('Already found:', Array.from(foundWords));

    if (matchedWord && !foundWords.has(matchedWord)) {
      setFoundWords(prev => new Set([...prev, matchedWord]));
      // Save all selected cells as found
      setFoundCells(prev => {
        const newSet = new Set(prev);
        selectedCells.forEach(cell => {
          newSet.add(`${cell.row}-${cell.col}`);
        });
        return newSet;
      });
      console.log('✅ FOUND WORD:', matchedWord);
    } else if (selectedCells.length >= 2) {
      console.log('❌ Wrong word or already found');
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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 to-purple-100">
        <div className="text-2xl text-purple-600">Loading game...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-purple-50 to-purple-100">
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
    <div className="min-h-screen bg-gradient-to-b from-cyan-300 via-cyan-200 to-yellow-200 p-4 flex flex-col relative overflow-hidden">
      {/* Layered pixel-art background: far trees, mid bushes, clouds, sketch overlay, foreground grass.
          All decorative elements use pointer-events-none so the game UI remains interactive. */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Far background trees (silhouettes) */}
        <div className="absolute left-0 right-0 bottom-24 flex justify-center opacity-90">
          <div className="w-full max-w-6xl mx-auto relative">
            <div className="absolute -left-10 bottom-0 h-48 w-64 bg-[linear-gradient(180deg,#0b6b43,#0a5b36)] rounded-t-lg transform scale-x-75 -skew-x-6 opacity-90 animate-parallax-slow"></div>
            <div className="absolute left-40 bottom-0 h-56 w-72 bg-[linear-gradient(180deg,#0e7a4d,#0b6b3d)] rounded-t-lg opacity-95 transform -skew-x-3 animate-parallax-slower"></div>
            <div className="absolute left-96 bottom-0 h-44 w-60 bg-[linear-gradient(180deg,#0c6f45,#095a37)] rounded-t-lg opacity-85 transform skew-x-2 animate-parallax-slow"></div>
            <div className="absolute right-12 bottom-0 h-64 w-80 bg-[linear-gradient(180deg,#0f804f,#0b6b3d)] rounded-t-lg opacity-95 transform -skew-x-4 animate-parallax-slower"></div>
          </div>
        </div>

        {/* Mid bushes/trees */}
        <div className="absolute left-0 right-0 bottom-16 flex justify-center opacity-100">
          <div className="w-full max-w-6xl mx-auto relative">
            <div className="absolute left-8 bottom-0 h-28 w-40 bg-[#138a53] rounded-t-full opacity-95 transform translate-x-0 animate-parallax-mid"></div>
            <div className="absolute left-60 bottom-0 h-32 w-48 bg-[#129657] rounded-t-full opacity-95 transform translate-x-6 animate-parallax-mid" style={{ animationDelay: '0.1s' }}></div>
            <div className="absolute left-140 bottom-0 h-26 w-36 bg-[#0fa05b] rounded-t-full opacity-95 transform -translate-x-4 animate-parallax-mid" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute right-20 bottom-0 h-30 w-44 bg-[#138a53] rounded-t-full opacity-95 transform translate-x-2 animate-parallax-mid" style={{ animationDelay: '0.15s' }}></div>
          </div>
        </div>

        {/* Clouds and sun removed per user request */}

        {/* Sparkles near HUD (small, subtle) */}
        <div className="absolute top-14 left-36 text-xl opacity-90 animate-pulse text-yellow-300">✨</div>
        <div className="absolute top-10 left-44 text-lg opacity-80 animate-pulse delay-500 text-yellow-300">⭐</div>

        {/* Left and right palm SVGs (swaying) */}
        <div className="absolute bottom-14 left-4 transform origin-bottom-left animate-sway" style={{ animationDelay: '0s' }}>
          <svg width="64" height="80" viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
            <rect x="28" y="36" width="8" height="36" rx="3" fill="#8b5a2b" />
            <path d="M34 40 C52 30 56 10 40 6" fill="#2ea55a" />
            <path d="M32 42 C12 34 8 14 24 8" fill="#27a14e" />
          </svg>
        </div>
        <div className="absolute bottom-14 right-8 transform origin-bottom-right animate-sway" style={{ animationDelay: '0.2s' }}>
          <svg width="64" height="80" viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
            <rect x="28" y="36" width="8" height="36" rx="3" fill="#8b5a2b" />
            <path d="M34 40 C52 30 56 10 40 6" fill="#2ea55a" />
            <path d="M32 42 C12 34 8 14 24 8" fill="#27a14e" />
          </svg>
        </div>

        {/* Sketch overlay - subtle diagonal strokes to mimic pixel-art hatch */}
        <div className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none"
             style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.02) 0 2px, rgba(0,0,0,0.02) 2px 4px)' }} />

        {/* Foreground grass strip with small flowers */}
        <div className="absolute left-0 right-0 bottom-0 h-20 md:h-24">
          <div className="absolute bottom-0 left-0 right-0 h-full bg-[linear-gradient(180deg,#36c06b,#1aa14a)]"></div>
          <div className="absolute bottom-2 left-8 text-xl">
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3" fill="#fff176" />
              <path d="M12 2 L12 6" stroke="#fff" strokeWidth="1" />
            </svg>
          </div>
          <div className="absolute bottom-2 left-36 text-xl">
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3" fill="#fff176" />
            </svg>
          </div>
          <div className="absolute bottom-3 left-64 text-lg animate-bounce" style={{ animationDelay: '0.2s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="4" fill="#ffcc80" />
            </svg>
          </div>
          <div className="absolute bottom-2 right-40 text-xl">
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3" fill="#fff176" />
            </svg>
          </div>
        </div>

        {/* Foreground animated props: character, log, mushrooms (emoji placeholders) */}
        <div className="absolute left-0 right-0 bottom-6 pointer-events-none">
          <div className="relative w-full max-w-6xl mx-auto">
            {/* Log + mushrooms on left */}
            <div className="absolute left-12 bottom-2 animate-bob" style={{ animationDelay: '0s' }}>
              {/* Log SVG */}
              <svg width="56" height="24" viewBox="0 0 56 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="6" width="52" height="12" rx="4" fill="#8B5A2B" />
                <rect x="44" y="8" width="8" height="8" rx="2" fill="#6B3E1A" />
                <rect x="4" y="8" width="6" height="8" rx="2" fill="#6B3E1A" />
                <ellipse cx="14" cy="12" rx="3" ry="2" fill="#4d2a12" opacity="0.4" />
              </svg>
            </div>
            <div className="absolute left-20 bottom-3 animate-bob" style={{ animationDelay: '0.1s' }}>
              {/* Mushroom SVG */}
              <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="12" cy="9" rx="9" ry="5" fill="#d93b3b" />
                <circle cx="9" cy="8" r="1.2" fill="#fff" />
                <circle cx="14" cy="7" r="1" fill="#fff" />
                <rect x="10" y="11" width="4" height="6" rx="2" fill="#f2e6d9" />
              </svg>
            </div>

            {/* Character walking near center-left */}
            <div className="absolute left-1/3 bottom-0 animate-walk animate-bob" style={{ animationDelay: '0s' }}>
              {/* Simple character placeholder SVG (pixel-ish) */}
              <svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="6" width="20" height="20" rx="4" fill="#f6c7b6" />
                <rect x="8" y="26" width="24" height="14" rx="4" fill="#6fb6f3" />
                <rect x="6" y="38" width="28" height="6" rx="3" fill="#2b2b2b" />
              </svg>
            </div>

            {/* Small bird flying on right foreground */}
            <div className="absolute right-28 bottom-8 animate-bob" style={{ animationDelay: '0.15s' }}>
              {/* Small bird SVG */}
              <svg width="28" height="20" viewBox="0 0 28 20" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="10" cy="10" rx="8" ry="6" fill="#ff9f43" />
                <path d="M16 6 L22 4 L20 8 Z" fill="#ff6b6b" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6 px-4">
        {/* Left: Time */}
        <div className="flex items-center gap-4">
          {/* Time Badge */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-purple-600 font-semibold">Time Left</span>
            <div className="text-2xl font-bold text-purple-700">
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
          </div>

          {/* Lives Badge */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-red-600 font-semibold">Lives</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-2xl">{i < livesLeft ? '❤️' : '🖤'}</span>
              ))}
            </div>
          </div>

          {/* Words Found Badge */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-green-600 font-semibold">Words Found</span>
            <div className="text-2xl font-bold text-green-700">
              {foundWords.size} / {game?.game_json.words.length || 0}
            </div>
          </div>
        </div>

        {/* Right: Menu Button */}
        <button 
          onClick={() => setShowMenuModal(true)}
          className="bg-gradient-to-b from-amber-600 to-amber-700 rounded-full p-3 shadow-lg border-2 border-amber-800 hover:scale-110 transition-transform">
          <div className="w-8 h-8 flex flex-col justify-center gap-1.5">
            <div className="w-full h-1 bg-white rounded"></div>
            <div className="w-full h-1 bg-white rounded"></div>
            <div className="w-full h-1 bg-white rounded"></div>
          </div>
        </button>
      </div>

      {/* Main Content - Center Board */}
      <div className="flex-1 flex justify-center items-center px-4 pb-4">
        <div className="flex gap-1 items-start">
          {/* Left: Wooden Board with Grid */}
          <div className="flex flex-col items-center justify-center">
            {/* Wooden Board Container - Sized to Grid */}
            <div className="relative inline-block">
              {/* 3D Board Background */}
              <div className="bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 rounded-2xl shadow-2xl p-4 border-6 border-amber-900">
                {/* Wood texture effect */}
                <div className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
                    backgroundSize: '100% 100%',
                  }}>
                </div>

                {/* Game Grid - Dynamic from BE */}
                <div className="relative bg-gradient-to-br from-orange-600 to-amber-700 rounded-xl p-3 border-3 border-yellow-600">
                  {/* Grid content - Dynamic */}
                  <div className="flex justify-center"
                    onMouseLeave={() => {
                      if (isSelecting) handleMouseUp();
                    }}>
                    <div className="inline-block">
                      {grid.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex gap-0.5 md:gap-1 mb-0.5 md:mb-1 justify-center">
                          {row.map((letter, colIndex) => {
                            const cellKey = `${rowIndex}-${colIndex}`;
                            const isInFoundWord = foundCells.has(cellKey);
                            const isSelected = selectedCells.some(
                              cell => cell.row === rowIndex && cell.col === colIndex
                            );

                            return (
                              <button
                                key={colIndex}
                                className={`
                                  w-8 h-8 md:w-9 md:h-9 font-bold text-xs md:text-sm
                                  rounded-md border border-gray-400 shadow-md cursor-pointer
                                  select-none transition-all duration-150 transform
                                  ${
                                    isInFoundWord
                                      ? 'bg-gradient-to-b from-purple-400 to-purple-500 border-purple-600 text-white'
                                      : isSelected
                                        ? 'bg-purple-300 border-purple-500 text-white scale-95'
                                        : 'bg-gradient-to-b from-purple-50 to-pink-50 border-purple-200 text-purple-900 hover:from-purple-100 hover:to-pink-100'
                                  }
                                `}
                                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                                onMouseUp={handleMouseUp}
                              >
                                {letter}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Words to Find Box */}
          <div className="bg-white rounded-xl shadow-lg p-3 border-2 border-purple-200 h-fit" style={{ width: '160px' }}>
            <h2 className="text-sm font-bold text-purple-900 mb-3 pb-2 border-b-2 border-purple-200">
              Words to Find
            </h2>
            <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: '300px' }}>
              {game.game_json.words.map((word, index) => {
                const cleanWord = word.startsWith('*') ? word.substring(1) : word;
                const isFound = foundWords.has(word) || foundWords.has(cleanWord);
                return (
                  <div
                    key={index}
                    className={`
                      px-2 py-1.5 rounded-md font-semibold text-xs transition-all flex items-center gap-1.5
                      ${
                        isFound
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      }
                    `}
                  >
                    {isFound && (
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className={isFound ? 'line-through opacity-70' : 'truncate'}>{cleanWord}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* (Removed small emoji landscape; full layered background above provides pixel-art look.) */}

      {/* Game Over Modal - Pixel Art Style */}
      {gameStatus !== 'playing' && (
        <GameOverPixel
          isWon={gameStatus === 'won'}
          foundWords={foundWords.size}
          totalWords={game?.game_json.words.length || 0}
          onPlayAgain={() => window.location.reload()}
        />
      )}

      {/* Menu Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-amber-600 max-w-sm w-full mx-4">
            <h2 className="text-3xl font-black text-amber-700 mb-6 text-center">MENU</h2>
            
            <div className="space-y-4">
              {/* Next Level Section */}
              <div>
                <p className="text-lg font-bold text-gray-700 mb-3">Next to Level:</p>
                <div className="space-y-2">
                  <button
                    onClick={() => findAndPlayByDifficulty('easy')}
                    className="w-full bg-gradient-to-b from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 rounded-lg border-2 border-green-600 shadow-lg transition-transform hover:scale-105"
                  >
                    {searchingDifficulty === 'easy' ? 'Searching...' : '🟢 EASY'}
                  </button>
                  <button
                    onClick={() => findAndPlayByDifficulty('medium')}
                    className="w-full bg-gradient-to-b from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-3 rounded-lg border-2 border-yellow-600 shadow-lg transition-transform hover:scale-105"
                  >
                    {searchingDifficulty === 'medium' ? 'Searching...' : '🟡 MEDIUM'}
                  </button>
                  <button
                    onClick={() => findAndPlayByDifficulty('hard')}
                    className="w-full bg-gradient-to-b from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 rounded-lg border-2 border-red-600 shadow-lg transition-transform hover:scale-105"
                  >
                    {searchingDifficulty === 'hard' ? 'Searching...' : '🔴 HARD'}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t-2 border-gray-300 pt-4"></div>

              {/* Exit Game Section */}
              <button
                onClick={() => {
                  navigate('/my-projects');
                  setShowMenuModal(false);
                }}
                className="w-full bg-gradient-to-b from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 rounded-lg border-2 border-red-800 shadow-lg transition-transform hover:scale-105"
              >
                EXIT GAME
              </button>

              {/* Close Button */}
              <button
                onClick={() => setShowMenuModal(false)}
                className="w-full bg-gradient-to-b from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 rounded-lg border-2 border-gray-600 shadow-lg transition-transform hover:scale-105"
              >
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .delay-500 { animation-delay: 0.5s; }
        .delay-1000 { animation-delay: 1s; }

        /* Parallax animations for background layers */
        @keyframes parallaxSlow { 0% { transform: translateX(0); } 50% { transform: translateX(-6px); } 100% { transform: translateX(0); } }
        @keyframes parallaxSlower { 0% { transform: translateX(0); } 50% { transform: translateX(-10px); } 100% { transform: translateX(0); } }
        @keyframes parallaxMid { 0% { transform: translateX(0); } 50% { transform: translateX(-3px); } 100% { transform: translateX(0); } }
        @keyframes cloudFloat { 0% { transform: translateY(0px); opacity: 0.95 } 50% { transform: translateY(-6px); opacity: 1 } 100% { transform: translateY(0px); opacity: 0.95 } }

        .animate-parallax-slow { animation: parallaxSlow 8s ease-in-out infinite; }
        .animate-parallax-slower { animation: parallaxSlower 12s ease-in-out infinite; }
        .animate-parallax-mid { animation: parallaxMid 6s ease-in-out infinite; }
        .animate-cloud { animation: cloudFloat 6s ease-in-out infinite; }

        .shadow-cloud { box-shadow: 0 6px 12px rgba(0,0,0,0.06); }
        @keyframes spinSlow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spinSlow 20s linear infinite; }

        @keyframes sway { 0% { transform: rotate(0deg); } 50% { transform: rotate(3deg); } 100% { transform: rotate(0deg); } }
        .animate-sway { animation: sway 2.5s ease-in-out infinite; }

        /* Foreground bob and walk animations */
        @keyframes bob { 0% { transform: translateY(0); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0); } }
        @keyframes walk { 0% { transform: translateX(0); } 50% { transform: translateX(6px); } 100% { transform: translateX(0); } }
        .animate-bob { animation: bob 1.2s ease-in-out infinite; }
        .animate-walk { animation: walk 4.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
