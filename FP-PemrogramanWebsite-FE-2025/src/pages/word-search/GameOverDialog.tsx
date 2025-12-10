import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"; // Sesuaikan path
import { Button } from "@/components/ui/button"; // Sesuaikan path

interface GameOverDialogProps {
  isOpen: boolean;
  score: number;
  time: number;
  onRestart: () => void;
  onExit: () => void;
}

export const GameOverDialog: React.FC<GameOverDialogProps> = ({
  isOpen,
  score,
  time,
  onRestart,
  onExit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Permainan Selesai! 🎉
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-lg">Kamu berhasil menemukan semua kata!</p>
          <div className="flex gap-8 text-center">
            <div>
              <p className="text-sm text-gray-500">Skor Akhir</p>
              <p className="text-2xl font-bold text-blue-600">{score}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Waktu</p>
              <p className="text-2xl font-bold text-blue-600">{time}s</p>
            </div>
          </div>
        </div>
        <DialogFooter className="flex sm:justify-center gap-2">
          <Button variant="outline" onClick={onExit}>
            Keluar
          </Button>
          <Button onClick={onRestart}>Main Lagi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
