# SauceDemo Automation Testing Framework

Framework automation testing end-to-end untuk website [SauceDemo](https://www.saucedemo.com), dibangun menggunakan **Cucumber.js** (BDD), **Playwright** (browser automation), dan **Page Object Model**. Dilengkapi pipeline **CI/CD Jenkins** yang otomatis menjalankan test, merekam bukti (video, screenshot, PDF), dan melaporkan hasilnya.

![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
![Cucumber](https://img.shields.io/badge/cucumber.js-12.9.0-23D96C)
![Playwright](https://img.shields.io/badge/playwright-latest-2EAD33)
![Tests](https://img.shields.io/badge/scenarios-22-blue)
![CI](https://img.shields.io/badge/CI-Jenkins-D24939)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## Daftar Isi

1. [Tentang Project Ini](#tentang-project-ini)
2. [Apa yang Diuji](#apa-yang-diuji)
3. [Tech Stack](#tech-stack)
4. [Struktur Project](#struktur-project)
5. [Cara Instalasi](#cara-instalasi)
6. [Cara Menjalankan Test](#cara-menjalankan-test)
7. [Daftar Lengkap Test Scenario](#daftar-lengkap-test-scenario)
8. [Arsitektur: Page Object Model](#arsitektur-page-object-model)
9. [Laporan Hasil Test (Reporting)](#laporan-hasil-test-reporting)
10. [CI/CD dengan Jenkins](#cicd-dengan-jenkins)
11. [Cara Menambah Test Baru](#cara-menambah-test-baru)
12. [Troubleshooting](#troubleshooting)
13. [FAQ](#faq)
14. [Kontak & Kontribusi](#kontak--kontribusi)

---

## Tentang Project Ini

Project ini adalah **contoh implementasi automation testing** yang meniru kondisi kerja nyata seorang QA Automation Engineer: mulai dari menulis test case dalam bahasa manusia (Gherkin/BDD), mengotomasi browser dengan Playwright, sampai menghubungkannya ke pipeline CI/CD agar test berjalan otomatis setiap ada perubahan kode.

**Kenapa pakai pendekatan BDD (Behavior-Driven Development)?**
Test ditulis dalam format `Given-When-Then` yang bisa dibaca siapa saja — bukan cuma developer. Ini memudahkan komunikasi antara QA, developer, dan product owner karena semua orang bisa memahami apa yang sedang diuji tanpa perlu membaca kode.

Contoh:
```gherkin
Scenario: Login dengan kredensial valid
  Given user opens the saucedemo login page
  When user logs in with username "standard_user" and password "secret_sauce"
  Then user successfully lands on the products page
```

**Kenapa pakai Page Object Model (POM)?**
Supaya kode tidak berantakan ketika jumlah test semakin banyak. Semua elemen halaman (tombol, input, dll) dan cara berinteraksi dengannya disimpan di satu tempat ("Page Object"), terpisah dari logika test itu sendiri. Kalau UI website berubah, kita cukup update di satu file, bukan di puluhan file test.

---

## Apa yang Diuji

Website [SauceDemo](https://www.saucedemo.com) adalah situs demo e-commerce yang memang dirancang khusus untuk latihan automation testing, lengkap dengan beberapa akun user yang punya bug tersembunyi secara sengaja. Project ini menguji:

- ✅ **Login** — kredensial valid, invalid, field kosong, akun terkunci
- ✅ **Shopping Cart** — tambah produk, hapus produk, lihat jumlah item
- ✅ **Checkout** — mengisi data pengiriman, menyelesaikan pesanan, validasi form
- ✅ **Sorting produk** — urutkan berdasarkan harga
- ✅ **Logout**
- 🐛 **Bug Detection** — 5 scenario khusus yang **sengaja** menguji akun-akun bermasalah (`problem_user`, `error_user`, `performance_glitch_user`, `visual_user`) untuk membuktikan automation testing bisa mendeteksi defect nyata

---

## Tech Stack

| Tool | Fungsi | Kenapa Dipilih |
|---|---|---|
| [Cucumber.js](https://github.com/cucumber/cucumber-js) | Menjalankan test berformat Gherkin (BDD) | Test bisa dibaca non-technical person |
| [Playwright](https://playwright.dev/) | Mengontrol browser (klik, isi form, dll) | Cepat, stabil, mendukung banyak browser |
| [Node.js](https://nodejs.org/) | Runtime JavaScript | Wajib untuk menjalankan Cucumber & Playwright |
| [dotenv](https://www.npmjs.com/package/dotenv) | Menyimpan kredensial di luar kode | Keamanan — kredensial tidak ter-hardcode |
| [Puppeteer](https://pptr.dev/) | Konversi HTML report jadi PDF | Menghasilkan bukti evidence yang mudah dibagikan |
| [Allure](https://allurereport.org/) *(opsional)* | Dashboard visual hasil test | Laporan lebih menarik untuk presentasi |
| [Jenkins](https://www.jenkins.io/) | Menjalankan test otomatis (CI/CD) | Test berjalan tanpa perlu campur tangan manual |

---

## Struktur Project

```
├── features/                   # Skenario test ditulis dalam bahasa Gherkin
│   ├── login.feature
│   ├── cart_checkout.feature
│   └── user_types.feature
│
├── steps/                      # Kode yang menerjemahkan Gherkin jadi aksi nyata
│   ├── loginStep.js
│   └── cartCheckoutStep.js
│
├── pages/                      # Page Object Model — representasi tiap halaman web
│   ├── basePage.js             # Class induk, berisi fungsi umum (click, fill, dll)
│   ├── loginPage.js
│   ├── productsPage.js
│   ├── cartPage.js
│   ├── checkoutPage.js
│   └── navBar.js
│
├── support/
│   └── world.js                 # Setup browser, screenshot otomatis, rekam video
│
├── scripts/
│   └── generate-step-pdf.js     # Script untuk membuat PDF report per scenario
│
├── reports/                     # Folder hasil test (dibuat otomatis, tidak di-commit)
│   ├── videos/                  # Rekaman video per scenario
│   ├── screenshots/             # Screenshot per step
│   ├── pdf/                     # Laporan PDF per scenario
│   └── cucumber-report.json     # Data mentah hasil test
│
├── cucumber.json                # Konfigurasi Cucumber (formatter, path, dll)
├── Jenkinsfile                  # Definisi pipeline CI/CD
├── package.json                 # Daftar dependency & script npm
├── .env                         # Kredensial (JANGAN di-commit ke Git)
└── .gitignore
```

---

## Cara Instalasi

### 1. Prasyarat

Pastikan sudah terinstall di komputer kamu:

- **[Node.js](https://nodejs.org/)** versi 20 ke atas — cek dengan `node -v`
- **[Git](https://git-scm.com/)** — cek dengan `git -v`

### 2. Clone repository

```bash
git clone https://github.com/teguhsnts/saucedemo-cucumber-playwright.git
cd saucedemo-cucumber-playwright
```

### 3. Install semua dependency

```bash
npm install
```

### 4. Install browser yang dibutuhkan Playwright & Puppeteer

```bash
npx playwright install --with-deps chromium
npx puppeteer browsers install chrome
```

### 5. Buat file konfigurasi `.env`

Buat file bernama `.env` di root folder project, isi seperti ini:

```env
BASE_URL=https://www.saucedemo.com
STANDARD_USERNAME=standard_user
LOCKED_OUT_USERNAME=locked_out_user
PROBLEM_USERNAME=problem_user
PERFORMANCE_GLITCH_USERNAME=performance_glitch_user
ERROR_USERNAME=error_user
VISUAL_USERNAME=visual_user
PASSWORD=secret_sauce
```

> ⚠️ **Penting:** File `.env` berisi informasi konfigurasi dan sebaiknya tidak pernah di-upload ke Git/GitHub. File ini sudah otomatis diabaikan lewat `.gitignore`.

### 6. Verifikasi instalasi berhasil

```bash
npm test
```

Kalau muncul daftar scenario dengan tanda ✓ hijau, instalasi berhasil.

---

## Cara Menjalankan Test

| Perintah | Penjelasan |
|---|---|
| `npm test` | Jalankan semua scenario utama (tanpa scenario bug), lalu buat PDF report |
| `npm run test:headed` | Sama seperti di atas, tapi browser terlihat (tidak headless) — bagus untuk debugging |
| `npm run test:positive` | Hanya scenario bertag `@positive` |
| `npm run test:negative` | Hanya scenario bertag `@negative` |
| `npm run test:allure` | Jalankan test lalu siapkan data untuk Allure report |
| `npm run allure:full` | Test + generate + langsung buka Allure report di browser |
| `npm run report:step-pdf` | Buat ulang PDF dari hasil test yang terakhir dijalankan |

### Menjalankan scenario tertentu saja

Gunakan **tag** untuk memilih scenario spesifik. Setiap scenario di project ini punya kode unik (TC01, TC02, dst) sebagai tag:

```bash
# Jalankan 1 scenario spesifik
npx cucumber-js --tags "@TC01"

# Jalankan beberapa scenario sekaligus (operator "or")
npx cucumber-js --tags "@TC01 or @TC05"

# Kombinasi kondisi (operator "and")
npx cucumber-js --tags "@positive and @smoke"

# Jalankan semua KECUALI tag tertentu
npx cucumber-js --tags "not @bug"
```

> Catatan: gunakan kata `or` / `and` / `not`, **bukan** koma, untuk menggabungkan tag.

---

## Daftar Lengkap Test Scenario

Total **22 test scenario**, dikelompokkan dalam 3 file feature.

### `login.feature` — Pengujian Login (TC01–TC05)

| ID | Nama Scenario | Tipe | Hasil yang Diharapkan |
|---|---|---|---|
| TC01 | Login dengan kredensial valid | Positive | Berhasil masuk ke halaman produk |
| TC02 | Login dengan password salah | Negative | Muncul pesan error |
| TC03 | Login dengan username kosong | Negative | Muncul pesan "Username is required" |
| TC04 | Login dengan password kosong | Negative | Muncul pesan "Password is required" |
| TC05 | Login dengan akun terkunci (`locked_out_user`) | Negative | Muncul pesan akun terkunci |

### `cart_checkout.feature` — Pengujian Cart & Checkout (TC06–TC11)

| ID | Nama Scenario | Tipe | Hasil yang Diharapkan |
|---|---|---|---|
| TC06 | Menambahkan produk ke keranjang | Positive | Badge cart menunjukkan angka 1 |
| TC07 | Menghapus produk dari keranjang | Positive | Badge cart kembali ke 0 |
| TC08 | Checkout dengan data lengkap dan valid | Positive | Muncul pesan pesanan berhasil |
| TC09 | Checkout dengan nama depan kosong | Negative | Muncul pesan validasi error |
| TC10 | Mengurutkan produk dari harga rendah ke tinggi | Positive | Urutan harga sesuai (ascending) |
| TC11 | Logout dari aplikasi | Positive | Kembali ke halaman login |

### `user_types.feature` — Pengujian Berbagai Tipe User & Deteksi Bug (TC12–TC18)

| ID | Nama Scenario | Tipe | Catatan |
|---|---|---|---|
| TC12 | Login dengan 5 tipe user berbeda (Scenario Outline) | Positive | Semua tipe user seharusnya bisa login |
| TC13 | Login gagal dengan akun terkunci | Negative | Validasi ulang perilaku locked out |
| TC14 | 🐛 Deteksi bug gambar produk duplikat | Bug Detection | User `problem_user` memiliki gambar produk yang sama di semua item |
| TC15 | 🐛 Deteksi bug proses checkout macet | Bug Detection | User `error_user` tidak bisa menyelesaikan checkout |
| TC16 | 🐛 Deteksi bug fitur sorting tidak berfungsi | Bug Detection | User `problem_user` — hasil sorting tidak sesuai |
| TC17 | 🐛 Deteksi bug loading lambat | Bug Detection | User `performance_glitch_user` — waktu login melebihi 5 detik |
| TC18 | 🐛 Deteksi bug tampilan gambar tidak konsisten | Bug Detection | User `visual_user` — ukuran gambar produk berbeda-beda |

> **Kenapa scenario TC14–TC18 sengaja dibiarkan "failed"?**
> Kelima scenario ini menguji akun-akun user yang memang **sengaja dibuat bermasalah** oleh SauceDemo untuk keperluan latihan QA. Status "failed" di sini bukan berarti test-nya salah, justru sebaliknya — ini **bukti bahwa automation testing berhasil menemukan defect nyata**. Setiap kegagalan ini lengkap dengan bukti screenshot dan video sebagai laporan bug yang valid.

---

## Arsitektur: Page Object Model

Setiap halaman website direpresentasikan sebagai satu class JavaScript, berisi:
- **Locator** — cara menemukan elemen di halaman (tombol, input, dll)
- **Method/Aksi** — fungsi untuk berinteraksi dengan elemen tersebut (klik, isi form, dll)

Semua page object mewarisi (`extends`) satu class induk bernama `BasePage`, yang menyediakan fungsi-fungsi umum agar tidak perlu ditulis berulang:

```js
// pages/basePage.js — class induk
class BasePage {
  async click(locator) { /* ... */ }
  async fill(locator, text) { /* ... */ }
  async getText(locator) { /* ... */ }
  async isVisible(locator) { /* ... */ }
}
```

```js
// pages/loginPage.js — mewarisi BasePage
const { BasePage } = require('./basePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async login(username, password) {
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }
}

module.exports = { LoginPage };
```

**Keuntungan pola ini:**
- Kalau tombol/input di website berubah, cukup update di satu file page object — tidak perlu ubah semua file test
- Kode test (step definition) jadi lebih pendek dan mudah dibaca, karena detail teknis "disembunyikan" di dalam page object
- Locator menggunakan cara yang direkomendasikan Playwright (`getByRole`, `getByPlaceholder`, `getByText`) — lebih tahan terhadap perubahan struktur HTML dibanding CSS selector biasa

---

## Laporan Hasil Test (Reporting)

Setiap kali test dijalankan, framework ini otomatis menghasilkan beberapa jenis bukti (evidence):

| Jenis Laporan | Lokasi | Isi |
|---|---|---|
| 🎥 **Video** | `reports/videos/` | Rekaman penuh browser dari awal sampai akhir tiap scenario (`.webm`) |
| 📸 **Screenshot** | `reports/screenshots/` | Foto layar di setiap step, baik yang berhasil maupun gagal |
| 📄 **PDF** | `reports/pdf/` | Ringkasan tiap scenario: nama step, status pass/fail, dan screenshot — satu file PDF per scenario |
| 🗂️ **JSON** | `reports/cucumber-report.json` | Data mentah hasil test, bisa diproses lebih lanjut oleh tools lain |

### Allure Report (Opsional)

Untuk laporan visual yang lebih lengkap (grafik, timeline, kategorisasi kegagalan):

```bash
npm run allure:full
```

Perintah ini akan menjalankan test, menyiapkan data, meng-generate laporan HTML, dan langsung membukanya di browser.

---

## CI/CD dengan Jenkins

Project ini terhubung dengan **Jenkins** sehingga test bisa dijalankan otomatis, bukan hanya secara manual di komputer sendiri.

### Alur Pipeline

```
1. Checkout kode dari GitHub
2. Ambil file .env dari Jenkins Credentials (aman, tidak pernah tersimpan di repo)
3. Install semua dependency (npm, Playwright, Puppeteer)
4. Jalankan Main Test Suite (scenario yang harus selalu berhasil)
5. Generate PDF report + publish Cucumber Report
6. Jalankan Known Bug Scenarios (boleh gagal, tidak menggagalkan build)
7. Simpan semua evidence (video, screenshot, PDF) sebagai artifact
8. (Opsional) Generate Allure Report
9. Hapus file .env dari server untuk keamanan
```

### Kenapa Main Test Suite dan Known Bug Scenarios Dipisah?

Supaya tim tidak "kebal notifikasi". Pipeline hanya akan gagal (merah) kalau ada masalah **baru** yang belum diketahui — bukan selalu merah karena 5 bug yang memang sudah didokumentasikan.

### Build Parameters

Saat menjalankan build di Jenkins, tersedia beberapa pilihan:

| Parameter | Tipe | Pilihan |
|---|---|---|
| `TEST_SCOPE` | Dropdown | `all`, `positive`, `negative`, `bug`, `smoke`, `custom` |
| `CUSTOM_TAG` | Teks bebas | Isi manual, misal `@TC01 or @TC05` (hanya berlaku jika `TEST_SCOPE = custom`) |
| `RUN_ALLURE` | Checkbox | Centang jika ingin generate Allure Report juga |

### Keamanan Kredensial

File `.env` **tidak pernah** disimpan di dalam repository GitHub. Saat pipeline berjalan, Jenkins mengambil file ini dari **Jenkins Credentials** (disimpan terenkripsi di server Jenkins), menyalinnya sementara ke workspace, lalu **menghapusnya otomatis** setelah build selesai — baik build itu berhasil maupun gagal.

---

## Cara Menambah Test Baru

Ingin menambahkan scenario baru? Ikuti langkah berikut:

1. **Tulis scenario** di file `.feature` yang sesuai (atau buat file baru di folder `features/`)
   ```gherkin
   @TC19 @positive
   Scenario: Nama scenario baru
     Given ...
     When ...
     Then ...
   ```

2. **Buat step definition** kalau step tersebut belum ada, di folder `steps/`

3. **Kalau perlu elemen halaman baru**, tambahkan locator dan method di page object yang sesuai (folder `pages/`), atau buat page object baru dengan mewarisi `BasePage`

4. **Jalankan test** untuk memastikan berjalan dengan benar:
   ```bash
   npx cucumber-js --tags "@TC19"
   ```

5. **Commit dan push** perubahan ke GitHub — Jenkins akan otomatis bisa menjalankannya di build berikutnya

---

## Troubleshooting

| Masalah | Kemungkinan Penyebab | Solusi |
|---|---|---|
| Terminal tidak menampilkan hasil pass/fail | Formatter `allure-cucumberjs/reporter` dijalankan bersamaan formatter lain | Jalankan Allure sebagai proses terpisah, jangan digabung dalam satu `format` array |
| `Cannot find module '...'` | File yang di-`require()` belum dibuat atau salah path | Cek kembali nama file dan lokasi folder |
| Browser gagal jalan di Jenkins | Browser Playwright/Puppeteer belum ter-install di server CI | Pastikan stage Install Dependencies menjalankan `npx playwright install --with-deps` dan `npx puppeteer browsers install chrome` |
| PDF tidak ter-generate | Script PDF tidak terpanggil, atau `step-data.json` kosong | Pastikan `npm run report:step-pdf` dijalankan setelah test selesai (`&&`) |
| Jenkins membuat folder workspace duplikat (`@2`, `@3`) | Build baru dimulai sebelum build sebelumnya benar-benar selesai | Gunakan `customWorkspace` di `Jenkinsfile`, atau tunggu build sebelumnya selesai total |
| Video/screenshot menumpuk dari run sebelumnya | Folder `reports/` tidak dibersihkan otomatis | Sudah ditangani lewat auto-cleanup di `support/world.js` setiap test dimulai |

---

## FAQ

**Q: Kenapa ada scenario yang sengaja dibuat gagal (failed)?**
A: Scenario bertag `@bug` menguji akun-akun user di SauceDemo yang memang punya bug bawaan (sengaja dibuat untuk latihan QA). Kegagalannya adalah bukti valid bahwa test berhasil menemukan masalah nyata, bukan kesalahan pada automation-nya.

**Q: Apakah aman menjalankan test ini berulang kali?**
A: Ya. Setiap scenario bersifat independen (login dari awal setiap kali), dan folder hasil test dibersihkan otomatis di setiap run baru.

**Q: Bagaimana kalau saya ingin menguji website lain, bukan SauceDemo?**
A: Ubah `BASE_URL` di `.env`, sesuaikan locator di folder `pages/` dengan struktur HTML website target, dan sesuaikan skenario di folder `features/`.

**Q: Apakah framework ini bisa dipakai untuk mobile web testing?**
A: Playwright mendukung emulasi viewport mobile. Perlu penyesuaian konfigurasi browser context di `support/world.js` untuk mengaktifkan mode ini.

---

## Kontak & Kontribusi

Project ini dibuat sebagai media pembelajaran automation testing dengan Cucumber.js, Playwright, Page Object Model, dan integrasi CI/CD Jenkins.

Kontribusi, saran, atau laporan bug pada framework ini (bukan pada SauceDemo) bisa disampaikan lewat GitHub Issues di repository ini.

---

<p align="center">Dibangun dengan menggunakan Cucumber.js + Playwright</p>
