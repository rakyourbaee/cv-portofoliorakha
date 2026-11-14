-- Instalasi baru: membuat database dan tabel lengkap.
-- Jika tabel produk sudah ada, jalankan migrasi_tambah_kolom.sql saja.
CREATE DATABASE IF NOT EXISTS katalog_produk CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE katalog_produk;

CREATE TABLE IF NOT EXISTS produk (
  id_barang        INT AUTO_INCREMENT PRIMARY KEY,
  nama_barang      VARCHAR(150) NOT NULL,
  deskripsi_barang TEXT,
  harga_barang     INT NOT NULL DEFAULT 0,
  jml_barang       INT NOT NULL DEFAULT 0,
  gambar           VARCHAR(255) NULL,          -- path atau URL gambar, contoh: assets/produk/1.jpg
  kategori         VARCHAR(100) NULL,
  harga_asli       INT NULL,                   -- harga coret; kosongkan jika tidak ada diskon
  rating           DECIMAL(2,1) NULL,          -- contoh: 4.7
  terjual          INT NOT NULL DEFAULT 0,
  lokasi           VARCHAR(100) NULL,          -- contoh: Kota Bogor
  gratis_ongkir    TINYINT(1) NOT NULL DEFAULT 0  -- 1 = tampilkan label Gratis Ongkir
);
