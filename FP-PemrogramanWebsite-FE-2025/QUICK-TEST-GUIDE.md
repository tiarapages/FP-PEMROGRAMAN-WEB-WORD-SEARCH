# 🎮 Quick Test Guide

## Cara Test Game Baru

### Opsi 1: Test Page (Recommended)
Buka browser dan akses:
```
http://localhost:3000/test-games
```

Di halaman ini ada 2 pilihan:
- **Word Search (Original)** - Game template lama
- **Word Search NEW** 🟣 - Game baru dengan purple theme

### Opsi 2: Direct Access
Langsung buka game baru:
```
http://localhost:3000/word-search-new
```

## 🚀 Langkah Test

1. **Start Frontend**
   ```bash
   cd FP-PemrogramanWebsite-FE-2025
   npm run dev
   ```

2. **Buka Browser**
   - Test Page: `http://localhost:3000/test-games`
   - Direct: `http://localhost:3000/word-search-new`

3. **Test Gameplay**
   - Klik dan drag untuk select huruf
   - Cari kata horizontal, vertical, atau diagonal
   - Complete 5 rounds
   - Lihat score & timer

## ✅ Yang Sudah Ditambahkan

### Routes di App.tsx:
- ✅ `/test-games` - Halaman pilih game
- ✅ `/word-search-new` - Game baru purple theme
- ✅ `/game/word-search` - Game original (sudah ada)

### File Baru:
- ✅ `pages/word-search-new/` - Folder game baru
- ✅ `pages/TestGamesPage.tsx` - Halaman test

## 🎯 Testing Checklist

- [ ] Game bisa dibuka tanpa error
- [ ] Grid 10x10 muncul dengan benar
- [ ] Bisa select huruf dengan drag
- [ ] Kata yang benar terdeteksi
- [ ] Score bertambah saat kata ditemukan
- [ ] Timer berjalan
- [ ] Bisa pause/resume
- [ ] Setelah 5 kata, next round
- [ ] Setelah 5 rounds, game over modal muncul
- [ ] Button restart & exit works
- [ ] Responsive di mobile

## 🐛 Jika Ada Error

### Error: "Cannot find module"
```bash
cd FP-PemrogramanWebsite-FE-2025
npm install
```

### Error: CSS tidak muncul
- Check console browser (F12)
- Pastikan import CSS di WordSearchNew.tsx

### Error: Route tidak work
- Pastikan server running: `npm run dev`
- Clear cache browser (Ctrl+Shift+R)

### Game tidak mulus
- Kurangi grid size dari 10 ke 8
- Kurangi jumlah kata per round

## 💡 Tips

- Buka DevTools (F12) untuk lihat console errors
- Test di Chrome/Edge untuk best compatibility
- Test di mobile view (F12 > Device Toolbar)

## 🎉 Success!

Kalo game jalan lancar, langkah selanjutnya:
1. Push ke GitHub
2. Customize warna/kata sesuai keinginan
3. Integrate dengan backend (optional)
4. Deploy! 🚀
