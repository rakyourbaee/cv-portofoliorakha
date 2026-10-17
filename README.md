# Portofolio & CV Interaktif

Website statis (HTML, CSS, JavaScript tanpa framework dan tanpa build step).

## Struktur folder

```
cv-portfolio/
├── index.html        Struktur halaman
├── css/style.css     Seluruh tampilan, tema terang dan gelap, responsif
├── js/data.js        DATA PRIBADI: ubah semua isi di sini
├── js/main.js        Logika interaktif (render, filter, form, tema, dll.)
└── assets/           Taruh foto (foto.jpg) dan CV (cv.pdf) di sini
```

## Cara menjalankan

1. Ekstrak folder `cv-portfolio`.
2. Dua cara membuka website:
   - Klik dua kali `index.html`, atau
   - Dari folder proyek, jalankan server lokal (disarankan agar semua fitur berjalan normal):
     ```bash
     python -m http.server 8000
     ```
     Lalu buka http://localhost:8000 di browser.
3. Untuk mencoba tombol salin email di browser, gunakan `localhost` (bukan membuka file langsung), karena clipboard hanya tersedia di konteks aman.

## Cara mengganti data pribadi

Semua isi ada di `js/data.js`:

- `config.photo`: isi dengan `"assets/foto.jpg"` setelah foto ditaruh di folder `assets`. Kosongkan untuk memakai inisial.
- `config.cvFile`: default `assets/cv.pdf`. Taruh file CV PDF Anda dengan nama tersebut, atau ubah path-nya.
- `config.formEndpoint`: lihat bagian "Mengaktifkan form kontak" di bawah.
- `profile`: nama, peran, perkenalan, tentang saya, email, LinkedIn, dan GitHub.
- `skillGroups`: keahlian dikelompokkan per kategori. Isi awal diambil dari mata kuliah, silakan sesuaikan dengan kemampuan Anda sendiri.
- `education`: institusi, jurusan, periode, dan mata kuliah.
- `projects`: proyek Anda. Item dengan `placeholder: true` adalah contoh dan ditandai badge "Contoh, ganti". Hapus atau ubah item tersebut. Kolom `image`, `demo`, dan `repo` boleh dikosongkan.
- `experience`: pengalaman organisasi, kepanitiaan, atau kerja.
- `certifications`: isi dengan `{ title, issuer, year, link }`. Jika kosong, bagian ini menampilkan pesan kosong yang rapi.

Pastikan semua data benar sebelum dipublikasikan. Nilai placeholder seperti "Tahun masuk — Sekarang" dan "nama@email.com" harus diganti.

## Mengaktifkan form kontak

Browser tidak bisa mengirim email sendiri, jadi form membutuhkan layanan penerima. Contoh yang mudah dipakai:

1. Daftar di layanan seperti Formspree, lalu buat form baru.
2. Salin URL endpoint yang diberikan.
3. Tempel URL tersebut di `config.formEndpoint` pada `js/data.js`.

Jika `formEndpoint` dikosongkan, tombol kirim membuka aplikasi email dengan isi pesan yang sudah terisi, dan status di layar menjelaskan bahwa pesan belum terkirim sampai Anda menekan kirim di aplikasi email.

## Publikasi

Website ini bisa di-host gratis di GitHub Pages, Netlify, atau Vercel dengan cara upload folder ini. Pastikan `index.html` berada di root folder.

## Catatan

- Font dimuat dari Google Fonts, sehingga butuh koneksi internet saat pertama kali dibuka. Jika offline, browser memakai font cadangan.
- Animasi otomatis dinonaktifkan jika sistem Anda mengaktifkan pengaturan "kurangi gerakan" (reduced motion).
