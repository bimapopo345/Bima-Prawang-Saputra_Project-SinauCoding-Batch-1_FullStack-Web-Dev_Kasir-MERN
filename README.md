# Kasir-MERN

## Table of Contents
---------------

1. [Description](#description)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Prerequisites](#prerequisites)
5. [Installation Instructions](#installation-instructions)
6. [Usage](#usage)
7. [API Documentation](#api-documentation)
8. [Deployment](#deployment)
9. [Contribution](#contribution)
10. [License](#license)
11. [Contact/Support](#contact-support)

## Description
-----------

Kasir-MERN adalah sebuah aplikasi kasir komprehensif yang dibangun menggunakan stack MERN (MongoDB, Express, React, Node.js). Aplikasi ini memungkinkan pengguna untuk mengelola menu, melakukan transaksi penjualan, melacak pesanan, serta menghasilkan laporan penjualan.

## Features
--------

* **Autentikasi Pengguna**: Registrasi dan login menggunakan autentikasi berbasis JWT yang aman.
* **Manajemen Menu**: Lihat daftar menu, tambah, edit, dan hapus item menu, serta upload gambar menu.
* **Transaksi Penjualan (Kasir)**: Tambah item ke keranjang, update jumlah, dan proses pembayaran.
* **Pelacakan Pesanan**: Lihat riwayat pesanan dan status pesanan.
* **Laporan Penjualan**: Tampilkan statistik penjualan berdasarkan kategori dan periode waktu.
* **Panel Admin**:
  + **Manajemen Pengguna**: Lihat semua pengguna, promosi/demosi status admin, dan hapus pengguna.
  + **Manajemen Menu**: Tambah, edit, dan hapus item menu.
  + **Manajemen Pesanan**: Lihat semua pesanan, arsipkan atau pulihkan pesanan.
  + **Reset Password**: Permintaan reset password melalui email menggunakan Nodemailer.
* **Desain Responsif**: Optimal untuk berbagai perangkat dan ukuran layar.
* **Notifikasi**: Notifikasi pengguna menggunakan Toast.
* **Error Handling**: Penanganan error yang komprehensif dengan pesan yang ramah pengguna.

## Technologies Used
-------------------

### Backend:

* **Node.js & Express.js**: Runtime server-side dan framework.
* **MongoDB & Mongoose**: Database dan ODM untuk pemodelan data.
* **JWT (JSON Web Tokens)**: Autentikasi dan otorisasi.
* **Nodemailer**: Pengiriman email untuk reset password.
* **Multer**: Penanganan upload gambar.
* **bcryptjs**: Hashing password.

### Frontend:

* **React**: Library antarmuka pengguna.
* **React Router DOM**: Routing.
* **Axios**: HTTP client untuk komunikasi API.
* **Tailwind CSS**: Styling dan komponen UI.
* **React Icons**: Ikon-ikon yang digunakan dalam aplikasi.

### Other Tools:

* **dotenv**: Manajemen variabel lingkungan.
* **ESLint & Prettier**: Kualitas kode dan format.

## Prerequisites
--------------

* **Node.js** (v14 atau lebih tinggi)
* **npm** atau **pnpm** (Node package manager)
* **MongoDB instance** (lokal atau berbasis cloud seperti MongoDB Atlas)
* **Akun Email** (untuk pengiriman email reset password)

## Installation Instructions
-------------------------

### 1. Clone Repository

```bash
git clone https://github.com/bimapopo345/Kasir-MERN.git
cd Kasir-MERN
```

### 2. Backend Setup

#### a. Navigasi ke Direktori Backend

```bash
cd backend
```

#### b. Install Dependencies

Menggunakan npm:

```bash
npm install
```

Atau menggunakan pnpm:

```bash
pnpm install
```

#### c. Konfigurasi Variabel Lingkungan

Buat file `.env` di direktori backend berdasarkan file `.env.example`:

```bash
cp .env.example .env
```

Isi variabel yang diperlukan dalam file `.env`:

```makefile
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<Your Email>
EMAIL_PASS=<Your Email Password>
MONGODB_URI=<Your MongoDB Connection URI>
JWT_SECRET=<Your JWT Secret>
```

#### d. Seed Database (Opsional)

Untuk mengimpor data dummy (menu dan pengguna):

```bash
npm run data:import
```

Untuk menghapus data yang ada:

```bash
npm run data:destroy
```

#### e. Mulai Server Backend

```bash
npm run dev
```

Server backend akan berjalan di `http://localhost:5000`.

### 3. Frontend Setup

#### a. Navigasi ke Direktori Frontend

```bash
cd ../frontend
```

#### b. Install Dependencies

Menggunakan npm:

```bash
npm install
```

Atau menggunakan pnpm:

```bash
pnpm install
```

#### c. Mulai Server Frontend

```bash
npm start
```

Aplikasi frontend akan berjalan di `http://localhost:3000`.

## Usage
-----

### Registrasi Akun

Buka halaman registrasi dan buat akun pengguna baru.

### Login

Masuk menggunakan kredensial yang telah didaftarkan.

### Kelola Menu

Admin dapat menambah, mengedit, atau menghapus item menu serta mengupload gambar menu.

### Transaksi Penjualan (Kasir)

* Tambah item ke keranjang.
* Update jumlah item atau hapus item dari keranjang.
* Proses pembayaran dan konfirmasi transaksi.

### Lihat Riwayat Pesanan

Pengguna dapat melihat riwayat pesanan mereka dan status pesanan.

### Laporan Penjualan

Admin dapat melihat laporan penjualan berdasarkan kategori dan periode waktu.

### Manajemen Pengguna (Admin)

Admin dapat mengelola pengguna, termasuk promosi atau demosi status admin dan menghapus pengguna.

### Reset Password

Jika lupa password, pengguna dapat meminta reset password melalui email.

## API Documentation
-------------------

API dokumentasi terperinci tersedia dalam kode sumber. Beberapa endpoint utama meliputi:

### Autentikasi Pengguna

* `POST /api/auth/register`: Registrasi pengguna baru.
* `POST /api/auth/login`: Login pengguna.
* `POST /api/auth/reset-password`: Permintaan reset password (mengirim email).
* `POST /api/auth/reset-password/confirm`: Konfirmasi reset password.
* `GET /api/auth/profile`: Mendapatkan profil pengguna.
* `PUT /api/auth/profile`: Update profil pengguna.
* `POST /api/auth/change-password`: Ganti password pengguna.

### Manajemen Menu

* `GET /api/menu`: Mendapatkan semua item menu.
* `POST /api/menu`: Menambah item menu baru (Admin).
* `PUT /api/menu/:id`: Update item menu (Admin).
* `DELETE /api/menu/:id`: Hapus item menu (Admin).
* `POST /api/menu/upload`: Upload gambar menu (Admin).

### Manajemen Pesanan

* `GET /api/orders`: Mendapatkan semua pesanan pengguna.
* `POST /api/orders`: Membuat pesanan baru.
* `GET /api/orders/archived`: Mendapatkan pesanan yang diarsipkan.
* `GET /api/orders/:id`: Mendapatkan detail pesanan.
* `PUT /api/orders/:id`: Update pesanan.
* `DELETE /api/orders/:id`: Hapus pesanan.
* `POST /api/orders/:id/archive`: Arsipkan pesanan.
* `POST /api/orders/:id/restore`: Pulihkan pesanan yang diarsipkan.
* `POST /api/orders/:id/reorder`: Membuat pesanan ulang dari pesanan yang diarsipkan.

## Deployment
------------

### Build Frontend

```bash
npm run build --prefix frontend
```

### Serve Static Files dari Frontend

Konfigurasikan backend untuk menyajikan file build frontend.

### Deploy ke Platform Hosting Pilihan Anda

* Backend: Heroku, DigitalOcean, AWS
* Frontend: Dapat disajikan oleh backend atau di-deploy ke Vercel, Netlify

## Contribution
------------

Kontribusi sangat diterima! Berikut cara berkontribusi:

1. Fork Repository
2. Buat Branch Baru: `git checkout -b feature/YourFeature`
3. Buat Perubahan dan Commit: `git commit -m "Add your feature"`
4. Push ke Branch: `git push origin feature/YourFeature`
5. Buat Pull Request

## License
-------

Proyek ini dilisensikan di bawah MIT License.

## Contact/Support
-----------------

* GitHub: bimapopo345
* Email: bimapopo345@gmail.com
