import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Sesuaikan dengan router kamu
import api from "@/api/axios";

export type GridCell = {
  id: string;
  char: string;
  wordId: string | null; // ID kata jika huruf ini bagian dari jawaban
  isRevealed: boolean;
};

export type Word = {
  id: string;
  text: string;
  isFound: boolean;
};

// Data Dummy Kata (Bisa diganti fetch dari API/Database)
const WORD_POOL = [
  "REACT",
  "TYPESCRIPT",
  "TAILWIND",
  "FRONTEND",
  "BACKEND",
  "PRISMA",
  "NODEJS",
  "COMPONENT",
];

const GRID_SIZE = 10;

export const useWordSearchLogic = () => {
  const navigate = useNavigate();
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Inisialisasi Game
  useEffect(() => {
    startNewGame();
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!isPaused && !isGameOver) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, isGameOver]);

  const startNewGame = () => {
    // 1. Reset State
    setScore(0);
    setTimer(0);
    setIsGameOver(false);
    setIsPaused(false);

    // 2. Pilih kata acak
    const selectedWords = WORD_POOL.sort(() => 0.5 - Math.random()).slice(0, 5);
    const initialWords: Word[] = selectedWords.map((text) => ({
      id: text,
      text,
      isFound: false,
    }));
    setWords(initialWords);

    // 3. Generate Grid Kosong
    const newGrid: GridCell[][] = Array(GRID_SIZE)
      .fill(null)
      .map((_, row) =>
        Array(GRID_SIZE)
          .fill(null)
          .map((_, col) => ({
            id: `${row}-${col}`,
            char: "",
            wordId: null,
            isRevealed: false,
          })),
      );

    // 4. Tempatkan Kata (Horizontal, Vertikal, Diagonal)
    initialWords.forEach((word) => placeWordInGrid(newGrid, word));

    // 5. Isi sel kosong dengan huruf acak
    fillEmptyCells(newGrid);
    setGrid(newGrid);
  };

  const placeWordInGrid = (grid: GridCell[][], word: Word) => {
    let placed = false;
    while (!placed) {
      const direction = Math.floor(Math.random() * 3); // 0: Hor, 1: Ver, 2: Diag
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);

      let deltaRow = 0,
        deltaCol = 0;
      if (direction === 0) deltaCol = 1; // Horizontal
      if (direction === 1) deltaRow = 1; // Vertikal
      if (direction === 2) {
        deltaRow = 1;
        deltaCol = 1;
      } // Diagonal

      // Cek apakah muat & tidak tabrakan
      let fits = true;
      for (let i = 0; i < word.text.length; i++) {
        const r = row + i * deltaRow;
        const c = col + i * deltaCol;
        if (
          r >= GRID_SIZE ||
          c >= GRID_SIZE ||
          (grid[r][c].char !== "" && grid[r][c].char !== word.text[i])
        ) {
          fits = false;
          break;
        }
      }

      if (fits) {
        for (let i = 0; i < word.text.length; i++) {
          const r = row + i * deltaRow;
          const c = col + i * deltaCol;
          grid[r][c].char = word.text[i];
          grid[r][c].wordId = word.id;
        }
        placed = true;
      }
    }
  };

  const fillEmptyCells = (grid: GridCell[][]) => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].char === "") {
          grid[r][c].char =
            alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }
  };

  // Logic Klik Huruf (Sesuai soal: klik 1 huruf reveal 1 kata)
  const handleCellClick = (r: number, c: number) => {
    if (isPaused || isGameOver) return;

    const cell = grid[r][c];
    if (cell.wordId && !cell.isRevealed) {
      // Kata ditemukan!
      const targetWordId = cell.wordId;

      // Update Grid: Reveal semua huruf milik kata tersebut
      const newGrid = [...grid];
      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          if (newGrid[i][j].wordId === targetWordId) {
            newGrid[i][j].isRevealed = true;
          }
        }
      }
      setGrid(newGrid);

      // Update Word List
      const newWords = words.map((w) =>
        w.id === targetWordId ? { ...w, isFound: true } : w,
      );
      setWords(newWords);
      setScore((prev) => prev + 100); // Tambah Poin

      // Cek Menang
      if (newWords.every((w) => w.isFound)) {
        setIsGameOver(true);
      }
    } else if (!cell.wordId) {
      // Salah klik (opsional: kurangi poin)
      setScore((prev) => Math.max(0, prev - 10));
    }
  };

  // Exit & Pause Logic
  //   const handlePause = () => setIsPaused(!isPaused);

  //   const handleExit = async () => {
  //     try {
  //         // TODO: Ganti URL dengan endpoint backend lokal kalian
  //         // await fetch('http://localhost:3000/api/game/play-count', { method: 'POST', body: JSON.stringify({ gameId: 'word-search' }) });
  //         console.log("Exit clicked: Play count incremented via API");
  //     } catch (e) {
  //         console.error("Failed to update play count", e);
  //     }
  //     navigate("/"); // Redirect ke home
  //   };

  const handlePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleExit = async () => {
    try {
      // SYARAT WAJIB: Post req ke backend untuk nambah play count
      // (URL '/api/game/play' ini contoh, sesuaikan dengan dokumentasi backend Apidog nanti)
      await api.post("/api/game/play", {
        game_slug: "word-search", // Identitas game kamu
      });
      console.log("Play count berhasil ditambahkan!");
    } catch (e) {
      // Kalau backend mati/mocking belum ada, dia bakal error di console, tapi user tetap bisa keluar
      console.error("Gagal update play count (abaikan jika backend mati)", e);
    }

    // Redirect ke Home
    navigate("/");
  };
  return {
    grid,
    words,
    score,
    timer,
    isPaused,
    isGameOver,
    handleCellClick,
    handlePause,
    handleExit,
    startNewGame,
  };
};
