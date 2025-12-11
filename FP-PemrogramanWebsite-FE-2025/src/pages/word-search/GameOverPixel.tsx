import { useNavigate } from 'react-router-dom';

interface GameOverPixelProps {
  isWon: boolean;
  foundWords: number;
  totalWords: number;
  onPlayAgain: () => void;
}

export default function GameOverPixel({
  isWon,
  foundWords,
  totalWords,
  onPlayAgain,
}: GameOverPixelProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-cyan-300 via-cyan-200 to-yellow-200 z-40 overflow-hidden flex flex-col">
      
      {/* Background decorations - fullscreen (pointer-events-none so content is clickable) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top left stars */}
        <div className="absolute top-8 left-12 text-3xl animate-pulse">⭐</div>
        <div className="absolute top-20 left-24 text-2xl animate-pulse" style={{ animationDelay: '0.3s' }}>⭐</div>
        <div className="absolute top-6 right-20 text-3xl animate-pulse" style={{ animationDelay: '0.6s' }}>⭐</div>
        
        {/* Flying birds */}
        <div className="absolute top-16 left-1/3 text-2xl animate-bounce" style={{ animationDelay: '0s' }}>🐦</div>
        <div className="absolute top-24 right-1/3 text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>🐦</div>
        <div className="absolute top-12 right-1/4 text-2xl animate-bounce" style={{ animationDelay: '0.6s' }}>🐦</div>
        
        {/* Clouds */}
        <div className="absolute top-10 left-20 text-5xl opacity-80 animate-bounce" style={{ animationDelay: '0s' }}>☁️</div>
        <div className="absolute top-32 right-32 text-4xl opacity-70 animate-bounce" style={{ animationDelay: '0.5s' }}>☁️</div>
        <div className="absolute top-20 left-2/3 text-3xl opacity-60 animate-bounce" style={{ animationDelay: '1s' }}>☁️</div>
      </div>

      {/* Main Content Area - Flex grow to center vertically */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        
        {/* Hearts Display - Top */}
        <div className="mb-6 flex justify-center gap-2 md:gap-3">
          {[...Array(Math.min(foundWords, 5))].map((_, i) => (
            <span 
              key={i} 
              className="text-4xl md:text-5xl animate-bounce" 
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              ❤️
            </span>
          ))}
        </div>

        {/* Main Title - GAME OVER / YOU WIN with pixel animation */}
        <h1
          className="text-6xl md:text-8xl font-black mb-4 animate-bounce text-center"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            color: isWon ? '#FFD700' : '#FF6B35',
            textShadow: `
              6px 6px 0px rgba(0,0,0,0.9),
              12px 12px 0px rgba(255, 165, 0, 0.6),
              18px 18px 0px rgba(0,0,0,0.3)
            `,
            letterSpacing: '6px',
            animationDelay: '0.2s',
          }}
        >
          {isWon ? 'YOU WIN!' : 'GAME OVER'}
        </h1>

        {/* Subtitle with animation */}
        <p
          className="text-lg md:text-2xl font-black mb-8 text-gray-700 animate-pulse text-center"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            textShadow: '2px 2px 0px rgba(255,255,255,0.8)',
            letterSpacing: '1px',
          }}
        >
          Try matin together?
        </p>

        {/* Diamond Decoration */}
        <div className="mb-8 flex justify-center gap-4 text-3xl">
          <span className="animate-bounce" style={{ animationDelay: '0s' }}>💎</span>
          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>💎</span>
          <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>💎</span>
        </div>

        {/* Buttons Container */}
        <div className="w-full max-w-md space-y-3 mb-8">
          {/* YES Button */}
          <button
            onClick={onPlayAgain}
            className="w-full px-8 py-4 bg-gradient-to-b from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-black text-2xl md:text-3xl rounded-2xl border-4 border-green-700 shadow-lg hover:scale-105 active:scale-95 transition-all duration-150"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              textShadow: '3px 3px 0px rgba(0,0,0,0.7)',
              letterSpacing: '3px',
              boxShadow: '0px 8px 0px rgba(0,0,0,0.2), inset 0px -4px 0px rgba(0,0,0,0.3)',
            }}
          >
            ⭕ YES
          </button>

          {/* NO Button */}
          <button
            onClick={() => navigate('/my-projects')}
            className="w-full px-8 py-4 bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-black text-2xl md:text-3xl rounded-2xl border-4 border-red-800 shadow-lg hover:scale-105 active:scale-95 transition-all duration-150"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              textShadow: '3px 3px 0px rgba(0,0,0,0.7)',
              letterSpacing: '3px',
              boxShadow: '0px 8px 0px rgba(0,0,0,0.2), inset 0px -4px 0px rgba(0,0,0,0.3)',
            }}
          >
            ❌ NO
          </button>
        </div>

        {/* Stats Display - Words Found */}
        <div className="w-full max-w-md bg-yellow-200 bg-opacity-90 px-6 py-4 rounded-2xl border-4 border-yellow-400 shadow-lg text-center">
          <p className="text-lg md:text-xl font-black text-gray-700 mb-2" style={{ fontFamily: '"Press Start 2P", monospace' }}>
            WORDS FOUND
          </p>
          <p className="text-4xl md:text-5xl font-black text-orange-600" style={{ fontFamily: '"Press Start 2P", monospace' }}>
            {foundWords} / {totalWords}
          </p>
        </div>
      </div>

      {/* Bottom Landscape - Pixel Art Style */}
      <div className="relative z-10 w-full h-32 md:h-40 bg-gradient-to-t from-green-600 via-green-500 to-transparent">
        {/* Ground base */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-green-700 border-t-4 border-green-800"></div>
        
        {/* Ground decorations */}
        <div className="absolute bottom-12 left-8 text-5xl animate-bounce" style={{ animationDelay: '0.1s' }}>🌳</div>
        <div className="absolute bottom-10 left-1/3 text-6xl">🏠</div>
        <div className="absolute bottom-12 left-1/2 text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>💰</div>
        
        <div className="absolute bottom-12 right-1/4 text-5xl animate-bounce" style={{ animationDelay: '0.3s' }}>🌳</div>
        <div className="absolute bottom-10 right-8 text-5xl animate-bounce" style={{ animationDelay: '0.4s' }}>🧗</div>
        
        {/* Pixel bottom ornament */}
        <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce" style={{ animationDelay: '0s' }}>⬇️</div>
      </div>

      {/* Font Import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>
    </div>
  );
}
