# Word Search Game - Purple Theme 🟣

Game Word Search dengan tema warna ungu (purple gradient) yang modern dan responsif.

## 📁 Struktur File Baru

```
src/pages/word-search-new/
├── WordSearchNew.tsx          # Main component
├── components/
│   ├── GameHeader.tsx         # Header dengan score, timer, round
│   ├── WordSearchGrid.tsx     # Grid letters untuk game
│   ├── WordList.tsx           # List kata yang harus dicari
│   └── GameOverModal.tsx      # Modal ketika game selesai
└── styles/
    └── word-search.css        # Custom CSS dengan tema purple
```

## 🎮 Fitur Game

- ✅ Grid 10x10 dengan huruf random
- ✅ 5 kata untuk dicari setiap round
- ✅ 5 rounds total
- ✅ Drag/select huruf untuk mencari kata
- ✅ Support horizontal, vertical, dan diagonal
- ✅ Sistem score berdasarkan panjang kata
- ✅ Timer untuk tracking waktu bermain
- ✅ Pause/Resume game
- ✅ Game over modal dengan statistik
- ✅ Responsive design
- ✅ Tema warna purple gradient

## 🎨 Design

- **Warna utama**: Purple gradient (#667eea ke #764ba2)
- **Font**: Bold dan modern
- **Animasi**: Smooth transitions dan hover effects
- **Mobile-friendly**: Responsive untuk semua ukuran layar

## 🚀 Cara Menggunakan

### 1. Tambahkan Route

Buka file `src/App.tsx` atau file routing Anda, tambahkan route:

```tsx
import WordSearchNew from './pages/word-search-new/WordSearchNew';

// Dalam routes:
<Route path="/word-search-new" element={<WordSearchNew />} />
```

### 2. Link dari Homepage

Tambahkan link/button di homepage untuk akses game:

```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

<Button onClick={() => navigate('/word-search-new')}>
  Play Word Search
</Button>
```

### 3. Jalankan

```bash
npm run dev
```

Lalu buka: `http://localhost:3000/word-search-new`

## 🎯 Cara Bermain

1. **Select huruf**: Klik dan drag mouse untuk select huruf
2. **Cari kata**: Kata bisa horizontal, vertical, atau diagonal
3. **Complete round**: Temukan semua kata untuk lanjut ke round berikutnya
4. **Finish game**: Selesaikan 5 rounds untuk lihat hasil akhir

## ⚙️ Kustomisasi

### Ubah Jumlah Round

Edit di `WordSearchNew.tsx`:

```tsx
const [maxRounds] = useState(5); // Ganti angka 5 sesuai keinginan
```

### Ubah Kata-kata

Edit array `words` di `WordSearchNew.tsx`:

```tsx
const [words, setWords] = useState<Word[]>([
  { text: 'KATA1', found: false },
  { text: 'KATA2', found: false },
  // Tambahkan kata lainnya...
]);
```

### Ubah Ukuran Grid

Edit di function `initializeGrid()`:

```tsx
const gridSize = 10; // Ganti ukuran grid (default 10x10)
```

### Ubah Warna

Edit di `styles/word-search.css`, bagian:

```css
.word-search-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Ganti dengan warna gradient pilihan Anda */
}
```

## 📝 Catatan Penting

- ⚠️ File-file ini BARU dan tidak mengubah kode template yang sudah ada
- ⚠️ Jika ada error, tinggal hapus folder `word-search-new`
- ⚠️ Game ini standalone dan tidak tergantung pada komponen lain
- ✅ Sudah terintegrasi dengan shadcn/ui components
- ✅ Menggunakan lucide-react icons yang sudah ada di project

## 🐛 Troubleshooting

**Jika CSS tidak muncul:**
- Pastikan file CSS di-import di `WordSearchNew.tsx`
- Check console browser untuk error

**Jika routing tidak work:**
- Pastikan sudah tambah route di App.tsx/router
- Check apakah react-router-dom sudah terinstall

**Jika game lag:**
- Kurangi ukuran grid dari 10x10 ke 8x8
- Kurangi jumlah kata per round

## 🎉 Have Fun!

Game siap dimainkan! Kalau mau custom lebih lanjut atau ada error, tinggal bilang aja! 🚀
