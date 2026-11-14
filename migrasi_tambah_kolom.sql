-- Menambahkan kolom katalog ke tabel produk yang sudah ada.
-- Data yang sudah tersimpan tidak berubah; kolom baru terisi NULL atau 0.
-- Sintaks IF NOT EXISTS berlaku di MariaDB (XAMPP). Di MySQL 8, hapus "IF NOT EXISTS" lalu jalankan sekali saja.
USE katalog_produk;

ALTER TABLE produk
  ADD COLUMN IF NOT EXISTS gambar        VARCHAR(255) NULL AFTER jml_barang,
  ADD COLUMN IF NOT EXISTS kategori      VARCHAR(100) NULL AFTER gambar,
  ADD COLUMN IF NOT EXISTS harga_asli    INT NULL AFTER kategori,
  ADD COLUMN IF NOT EXISTS rating        DECIMAL(2,1) NULL AFTER harga_asli,
  ADD COLUMN IF NOT EXISTS terjual       INT NOT NULL DEFAULT 0 AFTER rating,
  ADD COLUMN IF NOT EXISTS lokasi        VARCHAR(100) NULL AFTER terjual,
  ADD COLUMN IF NOT EXISTS gratis_ongkir TINYINT(1) NOT NULL DEFAULT 0 AFTER lokasi;
