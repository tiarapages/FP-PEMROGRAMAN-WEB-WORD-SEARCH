// src/pages/word-search/types.ts

export interface GridCell {
  letter: string;
  row: number;
  col: number;
  isSelected: boolean;
  isFound: boolean;
}

export interface Word {
  text: string;
  found: boolean;
}

// Sesuai dengan response getWordSearchPlay di word-search.service.ts
export interface GameDataResponse {
  id: string;
  name: string;
  description?: string;
  thumbnail_image?: string;
  game_json: {
    grid: string[][];     // BE mengirim string[][]
    words: string[];      // BE mengirim string[]
    grid_size: number;
    time_limit: number;
    lives: number;        // PENTING: Lives, bukan Rounds
    directions: string[];
  };
}