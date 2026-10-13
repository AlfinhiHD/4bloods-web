# 4BLOODS (4BG) — CATATAN FUTURE DEVELOPMENT (INTERNAL ECOSYSTEM)

> **Status**: *Phase 2 / Future Development Roadmap*  
> **Konteks**: Fase 1 saat ini difokuskan 100% pada **Produk Publik** (**Company Profile 4Bloods** & **4Bloods Multi-POV Cam** yang dideploy ke Vercel). Seluruh spesifikasi sistem internal di bawah ini disimpan sebagai cetak biru (*blueprint*) apabila ke depannya dibutuhkan pengembangan sistem internal berbasis database (Supabase / PostgreSQL + Auth Discord).

---

## 1. 4Bloods Brangkas & Logistics POS (Pencatatan Transaksi In-Game)

### Latar Belakang Masalah
Di dalam game (**IME Roleplay**), anggota sering melakukan transaksi keluar-masuk barang (penjualan senjata, vest, peluru, radio, lockpick, maupun setoran uang kotor/bersih). Pencatatan manual rawan selisih stok dan menyulitkan audit oleh **OG / Under OG / Bendahara**.

### Fitur Utama yang Direncanakan
1. **Katalog POS In-Game (1-Click Cart)**
   - Pilihan item cepat sesuai item di IME RP:
     - *Heavy Pistol / Combat Pistol*
     - *9mm Ammo Box (x50)*
     - *Heavy Kevlar Vest (4BG Grade)*
     - *Encrypted Radio HT (Freq 4BG)*
     - *Advanced Lockpick Set*
     - *Medical Kit / Bandage Pack*
2. **Form Transaksi & Bukti Screenshot**
   - Input nama pembeli/anggota (IC), pangkat, tipe transaksi (`BELI BARANG`, `SETOR KAS MINGGUAN`, ` DEPOSIT BRANGKAS`, `AMBIL LOGISTIK WAR`).
   - Lampiran link screenshot bukti transaksi in-game (Discord CDN / Imgur).
3. **Auto-Stock & Kas Ledger**
   - Setiap transaksi otomatis memotong/menambah jumlah stok brangkas dan mencatat saldo kas masuk/keluar beserta nama *Bendahara / High Council* yang memverifikasi (`VERIFIED` / `PENDING`).

---

## 2. W-Hotdog Recruitment & Vetting Pipeline (Seleksi Calon Anggota)

### Latar Belakang Masalah
**W-Hotdog** adalah bisnis depan (*front business*) resmi **Four Bloods Gang** di IME RP yang menjadi pintu masuk (*screening*) bagi warga baru sebelum bisa menjadi **Prospect (Tier 5)** dan **Member (Tier 4)**. Persyaratan seleksi bersifat dinamis dan membutuhkan pelacakan per kandidat.

### Fitur Utama yang Direncanakan
1. **Custom Dynamic Checklist (Syarat Bisa Di-Custom Admin/HRD)**
   - Admin / Hood President dapat menambah, mengubah, atau menghapus syarat kelulusan kapan saja.
   - Contoh syarat default:
     - `[ ]` **Lulus PC Check & Anti-Cheat** (Bebas program ilegal / cit di IME RP)
     - `[ ]` **Wawancara On-Cam** (Sudah ngobrol on-cam dengan OG / Under OG / HRD)
     - `[ ]` **Setoran Metal Scrap / Material** (Memenuhi kuota setoran awal ke logistik)
     - `[ ]` **Shift Jaga W-Hotdog** (Menyelesaikan minimal jam kerja pelayanan di W-Hotdog)
     - `[ ]` **Tes Loyalitas & Kode Etik SSR** (Paham aturan *Blood In, Blood Out* & protokol radio)
2. **Progress Bar & Status Kandidat**
   - Menampilkan persentase kelulusan tiap kandidat (misal `4/5 Syarat Terpenuhi — 80%`).
   - Status otomatis: `SCREENING W-HOTDOG` → `SIap DILANTIK PROSPECT` → `LULUS` / `DROPPED`.

---

## 3. Anggota & Streamer CMS (Database Komunitas & Sinkronisasi Publik)

### Latar Belakang Masalah
Saat ini daftar **54 Streamer Resmi** disimpan secara statis di `src/data/4bloods-data.ts` dan `src/data/live_snapshot.json` agar dapat langsung dideploy ke Vercel tanpa biaya database. Ke depannya, bila jumlah anggota bertambah atau ada perubahan pangkat/channel YouTube, pengurus dapat mengubahnya lewat dashboard CMS.

### Fitur Utama yang Direncanakan
1. **CRUD Data Anggota & Kreator**
   - Nama Karakter (IC), Pangkat (`OG`, `Under OG`, `Young Bloods`, `Member`, `Prospect`, `W-Hotdog`), Role Spesifik.
   - Link YouTube (`@handle` & `Channel ID`) + upload gambar **Fan Art Karakter** masing-masing untuk ditampilkan pada **Syndicate Hierarchy Showcase** di halaman Company Profile.
2. **Auto-Sync ke Halaman Publik**
   - Begitu data anggota ditambah/diupdate di CMS, daftar di **Company Profile (`/`)** dan **4Bloods Cam (`/cam`)** otomatis terupdate secara real-time.

---

*Dokumentasi ini disiapkan oleh (**Finn**)egan Davis sebagai catatan pengembangan tahap berikutnya (Phase 2).*
