# Retrolens - Web Version (Hand Tracking Filter Portal)

Versi web dari Retrolens yang dapat di-deploy ke Vercel, Netlify, atau hosting statis lainnya. Aplikasi ini menggunakan MediaPipe Hands JavaScript untuk deteksi tangan langsung di browser.

## 🚀 Deployment

### Opsi 1: Deploy ke Vercel (Paling Mudah)

1. Push kode ke GitHub
2. Buka [vercel.com](https://vercel.com)
3. Klik "New Project"
4. Import repository GitHub Anda
5. Vercel akan otomatis mendeteksi sebagai static site
6. Klik "Deploy"

### Opsi 2: Deploy ke Netlify

1. Push kode ke GitHub
2. Buka [netlify.com](https://netlify.com)
3. Klik "Add new site" → "Import an existing project"
4. Pilih repository GitHub Anda
5. Build settings (biarkan default untuk static site):
   - Build command: (kosongkan)
   - Publish directory: (kosongkan atau ".")
6. Klik "Deploy site"

### Opsi 3: GitHub Pages (Gratis)

1. Push kode ke GitHub
2. Buka repository di GitHub
3. Masuk ke Settings → Pages
4. Di "Source", pilih "Deploy from a branch"
5. Pilih branch "main" dan folder "/ (root)"
6. Klik "Save"
7. Tunggu beberapa menit, site akan live di `https://username.github.io/repo-name`

## 📱 Cara Penggunaan

### Persyaratan:
- Browser modern (Chrome, Firefox, Safari, Edge)
- Kamera (webcam di laptop atau kamera depan di HP)
- Izin kamera di browser

### Langkah-langkah:
1. Buka website yang sudah di-deploy
2. Klik tombol "Mulai Kamera"
3. Izinkan akses kamera saat browser meminta permission
4. Tunggu model MediaPipe dimuat (beberapa detik)
5. Aplikasi siap digunakan!

### Fitur:
- **Membuka Portal:** Gunakan ujung jempol dan telunjuk dari **kedua tangan** di depan kamera (total 4 jari). Portal akan terbentuk di antara keempat jari tersebut.
- **Mengganti Filter:** Sentuhkan/dekatkan ujung jempol dan jari kelingking Anda, atau dekatkan telunjuk dari kedua tangan.
- **Filter Tersedia:** MONO, DUAL-TONE, PIXELATE, INVERT, SEPIA, BLUR, THERMAL, SKETCH, GLITCH, NEON

## 🎨 Filter yang Tersedia

1. **MONO** - Hitam putih klasik
2. **DUAL-TONE** - Dua warna kontras (oranye & pink)
3. **PIXELATE** - Efek pixel art
4. **INVERT** - Warna terbalik
5. **SEPIA** - Efek foto tua
6. **BLUR** - Blur halus
7. **THERMAL** - Efek thermal camera
8. **SKETCH** - Efek sketsa pensil
9. **GLITCH** - Efek glitch digital
10. **NEON** - Efek neon dengan edge detection

## 📁 Struktur File

```
python-handtrack/
├── index.html          # Halaman utama
├── style.css           # Styling
├── app.js              # Logika JavaScript
├── README-WEB.md       # Dokumentasi web version
├── README.md           # Dokumentasi Python version
├── main.py             # Python version (opsional)
└── requirements.txt    # Dependencies Python (opsional)
```

## 🔧 Troubleshooting

### Kamera tidak muncul?
- Pastikan browser memiliki izin akses kamera
- Cek apakah kamera sedang digunakan aplikasi lain
- Refresh halaman dan coba lagi

### Deteksi tangan tidak bekerja?
- Pastikan pencahayaan ruangan cukup
- Tangan harus terlihat jelas di kamera
- Jangan terlalu dekat atau terlalu jauh dari kamera

### Website tidak loading?
- Pastikan semua file (index.html, style.css, app.js) sudah ter-upload
- Cek console browser untuk error (F12 → Console)

## 🌐 Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari (iOS & macOS)
- ✅ Opera

## 📝 Catatan Penting

- Website ini menggunakan CDN untuk MediaPipe, jadi membutuhkan koneksi internet
- Model MediaPipe akan di-download otomatis saat pertama kali dibuka (sekitar 10-20MB)
- Untuk performa terbaik, gunakan device dengan GPU yang baik
- Di mobile, pastikan browser dalam mode landscape untuk pengalaman terbaik

## 🎯 Tips untuk Testing di Mobile

1. Deploy ke Vercel/Netlify
2. Buka link di HP Android/iOS
3. Browser akan meminta izin kamera → Allow
4. Pastikan HP dalam mode landscape
5. Gunakan kamera depan (selfie camera) untuk hasil terbaik

---

**Selamat menikmati Retrolens Web Version! 🎬✨**
