import { useWordSearchLogic } from "./useWordSearchLogic";
import { GameGrid } from "./GameGrid";
import { WordList } from "./WordList";
import { GameOverDialog } from "./GameOverDialog";
import { Button } from "@/components/ui/button"; // Sesuaikan path import ShadCN
import { Pause, Play, DoorOpen } from "lucide-react"; // Icon dari lucide-react (biasanya bawaan shadcn)

const WordSearchGame = () => {
  const {
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
  } = useWordSearchLogic();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center">
      {/* Header Bar */}
      <div className="w-full max-w-4xl flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <Button variant="destructive" size="sm" onClick={handleExit}>
            <DoorOpen className="w-4 h-4 mr-2" /> Exit
          </Button>
          <div className="text-lg font-semibold">
            Waktu: <span className="text-blue-600">{timer}s</span>
          </div>
        </div>

        <div className="text-2xl font-bold tracking-tight text-gray-800">
          WORD SEARCH
        </div>

        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold">
            Skor: <span className="text-green-600">{score}</span>
          </div>
          <Button variant="outline" size="icon" onClick={handlePause}>
            {isPaused ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Konten Game */}
      <div className="w-full max-w-4xl grid md:grid-cols-[1fr_300px] gap-6 relative">
        {/* Overlay Pause */}
        {isPaused && (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Permainan Dijeda
            </h2>
            <Button size="lg" onClick={handlePause}>
              Lanjutkan
            </Button>
          </div>
        )}

        {/* Papan Game */}
        <div className="flex justify-center">
          <GameGrid grid={grid} onCellClick={handleCellClick} />
        </div>

        {/* Sidebar List Kata */}
        <div className="flex flex-col gap-4">
          <WordList words={words} />
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
            <strong>Cara Main:</strong> Cari kata tersembunyi (Vertikal,
            Horizontal, Diagonal). Klik salah satu huruf dari kata tersebut
            untuk membukanya.
          </div>
        </div>
      </div>

      {/* Modal Game Over */}
      <GameOverDialog
        isOpen={isGameOver}
        score={score}
        time={timer}
        onRestart={startNewGame}
        onExit={handleExit}
      />
    </div>
  );
};

export default WordSearchGame;
