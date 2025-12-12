import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { WordSearchGrid } from './components/WordSearchGrid';
import { WordList } from './components/WordList';
import { GameHeader } from './components/GameHeader';
import { GameOverModal } from './components/GameOverModal';
import './styles/word-search.css';
import type { GridCell, Word, GameDataResponse } from './types';

const WordSearch = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  
  // --- STATE ---
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [lives, setLives] = useState(0); 
  const [maxLives, setMaxLives] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [initialTimeLimit, setInitialTimeLimit] = useState(0);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Selection Logic
  const [selectedCells, setSelectedCells] = useState<GridCell[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  // Timer Ref
  const timerIntervalRef = useRef<number | null>(null);

  // --- 1. FETCH DATA DARI API BACKEND ---
  useEffect(() => {
    if (!gameId) return;

    const fetchGameData = async () => {
      try {
        setIsLoading(true);
        // URL Backend Lengkap (Nested Router)
        const response = await axios.get(`http://localhost:4000/api/game/game-type/word-search/${gameId}/play/public`);
        
        // Ambil data (biasanya ada di response.data.data)
        // Pastikan Backend mengirim struktur data yang sesuai
        const gameData = response.data.data as GameDataResponse; 
        
        initializeGame(gameData);
      } catch (error) {
        console.error("Error fetching game:", error);
        alert("Gagal memuat game. Pastikan server backend berjalan.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameData();
  }, [gameId]);

  // --- 2. INISIALISASI GAME (PERBAIKAN UTAMA DISINI) ---
  const initializeGame = (data: any) => { 
    // Menggunakan 'any' sementara jika interface GameDataResponse masih pakai game_json
    // Jika interface sudah diupdate, ganti 'any' kembali ke 'GameDataResponse'

    // PERBAIKAN: Hapus .game_json karena data backend sudah langsung terbuka
    const newGrid: GridCell[][] = data.grid.map((row: string[], rIndex: number) => 
      row.map((letter: string, cIndex: number) => ({
        letter: letter.toUpperCase(),
        row: rIndex,
        col: cIndex,
        isSelected: false,
        isFound: false
      }))
    );

    // PERBAIKAN: Hapus .game_json
    const newWords: Word[] = data.words.map((w: string) => ({
      text: w.toUpperCase(),
      found: false
    }));

    setGrid(newGrid);
    setWords(newWords);
    
    // Set Rules dari BE (Hapus .game_json)
    setLives(data.lives);
    setMaxLives(data.lives);
    setTimeRemaining(data.time_limit);
    setInitialTimeLimit(data.time_limit);
    
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
  };

  // --- 3. TIMER LOGIC ---
  useEffect(() => {
    if (isLoading || isPaused || isGameOver) return;

    timerIntervalRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleGameOver(); // Waktu habis
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current !== null) clearInterval(timerIntervalRef.current);
    };
  }, [isLoading, isPaused, isGameOver]);

  // --- 4. GAME OVER & SUBMIT SCORE ---
  const handleGameOver = async () => {
    setIsGameOver(true);
    if (timerIntervalRef.current !== null) clearInterval(timerIntervalRef.current);

    // Hitung data untuk dikirim ke BE
    const timeTaken = initialTimeLimit - timeRemaining;
    const foundWordsList = words.filter(w => w.found).map(w => w.text);

    try {
      // URL Backend Lengkap (Nested Router)
      await axios.post(`http://localhost:4000/api/game/game-type/word-search/${gameId}/check`, {
        found_words: foundWordsList,
        time_taken: timeTaken,
        lives_remaining: lives
      });
    } catch (error) {
      console.error("Failed to submit score:", error);
    }
  };

  // Cek jika menang (Semua kata ditemukan)
  useEffect(() => {
    if (words.length > 0 && words.every(w => w.found)) {
      handleGameOver();
    }
  }, [words]);

  // --- 5. LOGIKA GAMEPLAY (GRID) ---
  const handleCellMouseDown = (cell: GridCell) => {
    setIsSelecting(true);
    setSelectedCells([cell]);
    updateCellSelection([cell], true);
  };

  const handleCellMouseEnter = (cell: GridCell) => {
    if (!isSelecting) return;
    const newSelection = [...selectedCells];
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
    setGrid(prevGrid => prevGrid.map(row =>
      row.map(cell => {
        const isInSelection = cells.some(c => c.row === cell.row && c.col === cell.col);
        return { ...cell, isSelected: isInSelection && selected };
      })
    ));
  };

  const checkSelectedWord = () => {
    if (selectedCells.length === 0) return;

    const selectedWordText = selectedCells.map(cell => cell.letter).join('');
    const reversedWordText = selectedWordText.split('').reverse().join('');

    const foundWordIndex = words.findIndex(
      word => !word.found && (word.text === selectedWordText || word.text === reversedWordText)
    );

    if (foundWordIndex !== -1) {
      // BENAR
      const newWords = [...words];
      newWords[foundWordIndex].found = true;
      setWords(newWords);
      setScore(prev => prev + (newWords[foundWordIndex].text.length * 10));

      setGrid(prevGrid => prevGrid.map(row =>
        row.map(cell => {
          const isInSelection = selectedCells.some(c => c.row === cell.row && c.col === cell.col);
          return { ...cell, isFound: isInSelection || cell.isFound, isSelected: false };
        })
      ));
    } else {
      // SALAH -> Kurangi Nyawa
      if (lives > 1) {
        setLives(prev => prev - 1);
      } else {
        setLives(0);
        handleGameOver();
      }
      updateCellSelection(selectedCells, false);
    }
    setSelectedCells([]);
  };

  const handlePause = () => setIsPaused(!isPaused);
  const handleExit = () => navigate('/');
  const handleRestart = () => window.location.reload();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <div className="word-search-container flex items-center justify-center text-white font-bold text-xl">Loading Game...</div>;
  }

  return (
    <div className="word-search-container">
      <div className="word-search-game">
        <GameHeader
          score={score}
          timer={formatTime(timeRemaining)}
          lives={lives}
          maxLives={maxLives}
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

        {/* Progress Bar */}
        <div className="progress-indicator">
          <div className="progress-text">
            {words.filter(w => w.found).length} of {words.length} Words Found
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${words.length ? (words.filter(w => w.found).length / words.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {isGameOver && (
        <GameOverModal
          score={score}
          time={formatTime(initialTimeLimit - timeRemaining)}
          totalWordsFound={words.filter(w => w.found).length}
          totalWords={words.length}
          onRestart={handleRestart}
          onExit={handleExit}
        />
      )}

      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-content">
            <h2>PAUSED</h2>
            <Button onClick={handlePause} size="lg">Resume Game</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordSearch;