import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Gamepad2, Sparkles } from 'lucide-react';

const TestGamesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 via-blue-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
            <Gamepad2 className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎮 Game Test Page
          </h1>
          <p className="text-gray-600">
            Pilih game yang mau di-test
          </p>
        </div>

        <div className="space-y-4">
          {/* Game Lama */}
          <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-400 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Word Search (Original)
                </h3>
                <p className="text-sm text-gray-500">
                  Template game yang sudah ada
                </p>
              </div>
              <div className="text-2xl">📝</div>
            </div>
            <Button
              onClick={() => navigate('/game/word-search')}
              className="w-full"
              variant="outline"
            >
              Play Original Version
            </Button>
          </div>

          {/* Game Baru */}
          <div className="border-2 border-purple-400 rounded-xl p-6 bg-linear-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-800">
                    Word Search NEW
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                    <Sparkles className="w-3 h-3" />
                    NEW
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Purple theme dengan gameplay drag-and-select
                </p>
              </div>
              <div className="text-2xl">🟣</div>
            </div>
            <Button
              onClick={() => navigate('/word-search-new')}
              className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Play New Version 🎮
            </Button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="w-full"
          >
            ← Back to Home
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            💡 <strong>Tip:</strong> Game baru (purple theme) dibuat di folder terpisah, 
            jadi kalo error tinggal hapus folder <code className="bg-white px-2 py-1 rounded">word-search-new</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestGamesPage;
