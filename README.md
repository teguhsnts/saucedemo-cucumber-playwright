# SauceDemo Automation Testing Framework

Framework automation testing end-to-end untuk website [SauceDemo](https://www.saucedemo.com), dibangun menggunakan **Cucumber.js** (BDD), **Playwright** (browser automation), dan **Page Object Model**. Dilengkapi pipeline **CI/CD Jenkins** yang otomatis menjalankan test, merekam bukti (video, screenshot, PDF), serta terintegrasi langsung dengan **Jira** (defect tracking) dan **TestRail** (test case management).

![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
![Cucumber](https://img.shields.io/badge/cucumber.js-12.9.0-23D96C)
![Playwright](https://img.shields.io/badge/playwright-latest-2EAD33)
![Tests](https://img.shields.io/badge/scenarios-22-blue)
![CI](https://img.shields.io/badge/CI-Jenkins-D24939)
![Jira](https://img.shields.io/badge/integration-Jira-0052CC)
![TestRail](https://img.shields.io/badge/integration-TestRail-6EBE4A)
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
11. [Integrasi Jira](#integrasi-jira)
12. [Integrasi TestRail](#integrasi-testrail)
13. [Cara Menambah Test Baru](#cara-menambah-test-baru)
14. [Troubleshooting](#troubleshooting)
15. [FAQ](#faq)
16. [Kontak & Kontribusi](#kontak--kontribusi)

---

## Tentang Project Ini

Project ini adalah **contoh implementasi automation testing end-to-end** yang meniru kondisi kerja nyata seorang QA Automation Engineer: mulai dari menulis test case dalam bahasa manusia (Gherkin/BDD), mengotomasi browser dengan Playwright, menjalankannya otomatis lewat CI/CD, sampai menghubungkan hasilnya ke tool manajemen tim yang sesungguhnya dipakai industri — Jira untuk defect tracking, dan TestRail untuk test case management.

**Kenapa pakai pendekatan BDD (Behavior-Driven Development)?**
Test ditulis dalam format `Given-When-Then` yang bisa dibaca siapa saja — bukan cuma developer. Ini memudahkan komunikasi antara QA, developer, dan product owner karena semua orang bisa memahami apa yang sedang diuji tanpa perlu membaca kode.

```gherkin
Scenario: Login dengan kredensial valid
  Given user opens the saucedemo login page
  When user logs in with username "standard_user" and password "secret_sauce"
  Then user successfully lands on the products page
```

**Kenapa pakai Page Object Model (POM)?**
Supaya kode tidak berantakan ketika jumlah test semakin banyak. Semua elemen halaman dan cara berinteraksi dengannya disimpan di satu tempat, terpisah dari logika test itu sendiri.

**Kenapa hasil test perlu terhubung ke Jira dan TestRail?**
Di dunia kerja nyata, automation testing jarang berdiri sendiri. Tim butuh:
- **Jira** — supaya kegagalan test otomatis jadi tiket yang bisa di-assign, ditrack, dan diprioritaskan, tanpa QA perlu buat laporan bug manual satu-satu
- **TestRail** — supaya ada histori eksekusi test case yang bisa dilihat manajer/stakeholder tanpa perlu buka Jenkins atau baca kode

---

## Apa yang Diuji

Website [SauceDemo](https://www.saucedemo.com) adalah situs demo e-commerce yang dirancang khusus untuk latihan automation testing, lengkap dengan beberapa akun user yang punya bug tersembunyi secara sengaja. Project ini menguji:

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
| [Playwright](https://playwright.dev/) | Mengontrol browser | Cepat, stabil, mendukung banyak browser |
| [Node.js](https://nodejs.org/) | Runtime JavaScript | Wajib untuk Cucumber & Playwright |
| [dotenv](https://www.npmjs.com/package/dotenv) | Menyimpan kredensial di luar kode | Keamanan — kredensial tidak ter-hardcode |
| [Puppeteer](https://pptr.dev/) | Konversi HTML report jadi PDF | Bukti evidence yang mudah dibagikan |
| [Allure](https://allurereport.org/) *(opsional)* | Dashboard visual hasil test | Laporan lebih menarik untuk presentasi |
| [Jenkins](https://www.jenkins.io/) | Menjalankan test otomatis (CI/CD) | Test berjalan tanpa campur tangan manual |
| [Jira](https://www.atlassian.com/software/jira) | Defect tracking otomatis | Standar industri untuk bug management |
| [TestRail](https://www.testrail.com/) | Test case management & histori eksekusi | Standar industri untuk test reporting |

---

## Struktur Project

```
├── features/                   # Skenario test dalam bahasa Gherkin
│   ├── login.feature
│   ├── cart_checkout.feature
│   └── user_types.feature
│
├── steps/                      # Step definitions
│   ├── loginStep.js
│   └── cartCheckoutStep.js
│
├── pages/                      # Page Object Model
│   ├── basePage.js
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
│   ├── generate-step-pdf.js     # Generate PDF report per scenario
│   ├── create-jira-bugs.js      # Auto-create Jira ticket dari hasil test
│   └── sync-testrail.js         # Sync hasil pass/fail ke TestRail
│
├── reports/                     # Output test (dibuat otomatis, tidak di-commit)
│   ├── videos/
│   ├── screenshots/
│   ├── pdf/
│   ├── cucumber-report.json     # Hasil Main Test Suite
│   └── bug-report.json          # Hasil Known Bug Scenarios
│
├── testrail-mapping.json        # Mapping tag Cucumber <-> case_id TestRail
├── cucumber.json                # Konfigurasi Cucumber (multi-profile)
├── Jenkinsfile                  # Definisi pipeline CI/CD
├── package.json
├── .env                         # Kredensial (JANGAN di-commit)
└── .gitignore
```

---

## Cara Instalasi

### 1. Prasyarat

- **[Node.js](https://nodejs.org/)** versi 20 ke atas
- **[Git](https://git-scm.com/)**

### 2. Clone repository

```bash
git clone https://github.com/teguhsnts/saucedemo-cucumber-playwright.git
cd saucedemo-cucumber-playwright
```

### 3. Install dependency & browser

```bash
npm install
npx playwright install --with-deps chromium
npx puppeteer browsers install chrome
```

### 4. Buat file `.env`

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

> ⚠️ File `.env` tidak boleh di-commit — sudah masuk `.gitignore`.

### 5. Verifikasi instalasi

```bash
npm test
```

---

## Cara Menjalankan Test

| Perintah | Penjelasan |
|---|---|
| `npm test` | Semua scenario utama (tanpa `@bug`) + generate PDF |
| `npm run test:headed` | Sama seperti di atas, browser terlihat |
| `npm run test:positive` | Hanya scenario `@positive` |
| `npm run test:negative` | Hanya scenario `@negative` |
| `npm run test:allure` | Test + siapkan data Allure |
| `npm run allure:full` | Test + generate + buka Allure report |
| `npm run report:step-pdf` | Generate ulang PDF dari hasil terakhir |

### Menjalankan scenario tertentu

```bash
npx cucumber-js --tags "@TC01"
npx cucumber-js --tags "@TC01 or @TC05"
npx cucumber-js --tags "@positive and @smoke"
npx cucumber-js --tags "not @bug"
```

> Gunakan kata `or` / `and` / `not` — bukan koma — untuk menggabungkan tag.

---

## Daftar Lengkap Test Scenario

Total **22 test scenario**, dikelompokkan dalam 3 file feature.

### `login.feature` — TC01–TC05

| ID | Nama Scenario | Tipe |
|---|---|---|
| TC01 | Login dengan kredensial valid | Positive |
| TC02 | Login dengan password salah | Negative |
| TC03 | Login dengan username kosong | Negative |
| TC04 | Login dengan password kosong | Negative |
| TC05 | Login dengan akun terkunci | Negative |

### `cart_checkout.feature` — TC06–TC11

| ID | Nama Scenario | Tipe |
|---|---|---|
| TC06 | Menambahkan produk ke keranjang | Positive |
| TC07 | Menghapus produk dari keranjang | Positive |
| TC08 | Checkout dengan data lengkap dan valid | Positive |
| TC09 | Checkout dengan nama depan kosong | Negative |
| TC10 | Mengurutkan produk harga rendah ke tinggi | Positive |
| TC11 | Logout dari aplikasi | Positive |

### `user_types.feature` — TC12–TC18

| ID | Nama Scenario | Tipe | Catatan |
|---|---|---|---|
| TC12 | Login dengan 5 tipe user berbeda | Positive | Scenario Outline |
| TC13 | Login gagal dengan akun terkunci | Negative | |
| TC14 | 🐛 Gambar produk duplikat | Bug Detection | `problem_user` |
| TC15 | 🐛 Checkout macet | Bug Detection | `error_user` |
| TC16 | 🐛 Sorting tidak berfungsi | Bug Detection | `problem_user` |
| TC17 | 🐛 Loading lambat | Bug Detection | `performance_glitch_user` |
| TC18 | 🐛 Ukuran gambar tidak konsisten | Bug Detection | `visual_user` |

> Scenario bertag `@bug` **sengaja dibiarkan failed** — ini dokumentasi defect nyata yang ditemukan di SauceDemo, bukan kesalahan test.

---

## Arsitektur: Page Object Model

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

Locator menggunakan cara yang direkomendasikan Playwright (`getByRole`, `getByPlaceholder`, `getByText`) — lebih tahan terhadap perubahan struktur HTML dibanding CSS selector biasa.

---

## Laporan Hasil Test (Reporting)

| Jenis Laporan | Lokasi | Isi |
|---|---|---|
| 🎥 Video | `reports/videos/` | Rekaman penuh browser per scenario |
| 📸 Screenshot | `reports/screenshots/` | Capture tiap step, pass maupun fail |
| 📄 PDF | `reports/pdf/` | Step + status + screenshot, satu file per scenario |
| 🗂️ JSON | `reports/cucumber-report.json`, `reports/bug-report.json` | Data mentah, dipakai sync ke Jira & TestRail |

---

## CI/CD dengan Jenkins

### Alur Pipeline

```
1. Checkout kode dari GitHub
2. Ambil .env dari Jenkins Credentials
3. Install dependency (npm, Playwright, Puppeteer)
4. Jalankan Main Test Suite (harus selalu passed)
   -> Kalau ada kegagalan tak terduga: tandai untuk Jira ticket URGENT
5. Generate PDF + publish Cucumber Report
6. Jalankan Known Bug Scenarios (boleh gagal, tidak menggagalkan build)
7. Buat Jira ticket untuk known bugs (jika diaktifkan)
8. Sync semua hasil ke TestRail (jika diaktifkan)
9. (Opsional) Generate Allure Report
10. Final status check -> build FAILURE jika ada kegagalan tak terduga
11. Hapus .env dari server
```

### Build Parameters

| Parameter | Tipe | Keterangan |
|---|---|---|
| `TEST_SCOPE` | Dropdown | `all`, `positive`, `negative`, `bug`, `smoke`, `custom` |
| `CUSTOM_TAG` | Teks | Tag expression manual, misal `@TC01 or @TC05` |
| `RUN_ALLURE` | Checkbox | Generate Allure Report (run 2x, lebih lama) |
| `CREATE_JIRA_BUGS` | Checkbox | Auto-create Jira ticket dari hasil test |
| `SYNC_TESTRAIL` | Checkbox | Sync hasil pass/fail ke TestRail |

### Keamanan Kredensial

File `.env` **tidak pernah** disimpan di repository. Jenkins mengambilnya dari **Jenkins Credentials** (terenkripsi), menyalinnya sementara ke workspace, lalu **menghapusnya otomatis** setelah build selesai — baik build berhasil maupun gagal.

---

## Integrasi Jira

Setiap kali test dijalankan dengan parameter `CREATE_JIRA_BUGS` aktif, hasil kegagalan otomatis dikonversi jadi Jira issue — dengan **dua jalur berbeda** tergantung jenis kegagalannya:

| Jenis Kegagalan | Label Jira | Prioritas | Efek ke Build |
|---|---|---|---|
| Known bug (`@bug`) | `automation-known-bug` | Low | Tidak menggagalkan build |
| Kegagalan tak terduga (Main Suite) | `automation-urgent` | High | **Build ditandai FAILURE** |

Setiap ticket otomatis berisi:
- Nama scenario yang gagal
- Tag Cucumber terkait
- Pesan error lengkap
- Referensi ke Jenkins build artifact (video/screenshot)

**Kenapa dipisah begini?** Supaya tim tidak "kebal notifikasi". Known bug yang sudah didokumentasikan tidak perlu membuat build selalu merah — tapi begitu ada kegagalan **baru** yang belum pernah terjadi, sistem otomatis mengangkatnya sebagai prioritas tinggi dan build gagal sengaja, supaya tidak ada yang terlewat.

**Setup:** kredensial disimpan sebagai Jenkins Credentials (`jira-api-credentials`), memakai email + [Jira API Token](https://id.atlassian.com/manage-profile/security/api-tokens).

---

## Integrasi TestRail

Setiap kali test dijalankan dengan parameter `SYNC_TESTRAIL` aktif, hasil dari **Main Test Suite** dan **Known Bug Scenarios** otomatis dikirim sebagai Test Run baru di TestRail, lengkap dengan status Pass/Fail per test case dan komentar detail.

### Cara Kerja Mapping

Karena tag Cucumber (`@TC01`) dan Case ID TestRail (`C46`) adalah dua sistem penomoran berbeda, project ini menggunakan file `testrail-mapping.json` untuk menjembatani keduanya:

```json
{
  "TC01": 46,
  "TC02": 47,
  "TC03": 48
}
```

Script `sync-testrail.js` membaca tag dari hasil test, mencocokkannya lewat mapping ini, lalu mengirim hasil ke `case_id` yang sesuai lewat TestRail API.

**Setup:** kredensial disimpan sebagai Jenkins Credentials (`testrail-api-credentials`). API TestRail perlu diaktifkan manual lewat **Administration → Site Settings → API** sebelum bisa dipakai.

---

## Cara Menambah Test Baru

1. Tulis scenario baru di file `.feature` yang sesuai:
   ```gherkin
   @TC19 @positive
   Scenario: Nama scenario baru
     Given ...
     When ...
     Then ...
   ```
2. Buat step definition di folder `steps/` (kalau belum ada)
3. Tambahkan locator/method baru di page object terkait (folder `pages/`)
4. **Jika ingin ikut sync ke TestRail**, buat test case baru di TestRail, catat `case_id`-nya, tambahkan ke `testrail-mapping.json`
5. Jalankan `npx cucumber-js --tags "@TC19"` untuk verifikasi
6. Commit dan push

---

## Troubleshooting

| Masalah | Penyebab | Solusi |
|---|---|---|
| Terminal tidak menampilkan pass/fail | `allure-cucumberjs/reporter` digabung formatter lain | Jalankan Allure sebagai profile/proses terpisah |
| `Cannot find module '...'` | File `require()` belum dibuat/salah path | Cek nama file dan lokasi folder |
| Browser gagal jalan di Jenkins | Browser belum ter-install di server CI | Pastikan `npx playwright install --with-deps` dan `npx puppeteer browsers install chrome` di stage Install Dependencies |
| PDF tidak ter-generate | Script tidak terpanggil / `step-data.json` kosong | Pastikan `report:step-pdf` di-chain setelah test (`&&`) |
| Jenkins membuat workspace duplikat (`@2`, `@3`) | Build baru mulai sebelum build sebelumnya selesai | Tunggu build sebelumnya selesai total, atau gunakan `customWorkspace` |
| `TestRail API is disabled` | API belum diaktifkan di TestRail | Aktifkan di Administration → Site Settings → API |
| `ConnectTimeoutError` ke TestRail/GitHub | Gangguan jaringan sesaat | Build ulang; tambahkan retry logic di script sync |
| Hasil sync TestRail cuma sebagian TC | `cucumber-report.json` tertimpa oleh run lain | Gunakan Cucumber **profile** terpisah untuk tiap output JSON, jangan andalkan flag `--format` yang digabung dengan config default |

---

## FAQ

**Q: Kenapa ada scenario yang sengaja dibuat gagal?**
A: Scenario `@bug` menguji akun user SauceDemo yang memang punya bug bawaan untuk latihan QA. Kegagalannya adalah bukti valid automation berhasil menemukan masalah nyata.

**Q: Apakah Jira ticket dan TestRail run dibuat setiap kali test jalan?**
A: Tidak — hanya jika parameter `CREATE_JIRA_BUGS` / `SYNC_TESTRAIL` dicentang saat build. Ini mencegah noise di Jira/TestRail dari run harian yang sifatnya cuma verifikasi cepat.

**Q: Apakah aman menjalankan test ini berulang kali?**
A: Ya. Setiap scenario independen, dan folder `reports/` dibersihkan otomatis di setiap run baru.

**Q: Bagaimana kalau case_id di TestRail-ku berbeda dari punya kamu?**
A: Update `testrail-mapping.json` sesuai `case_id` masing-masing test case di project TestRail kamu sendiri — mapping ini unik per instalasi TestRail.

---

## Kontak & Kontribusi

Project ini dibuat sebagai media pembelajaran automation testing dengan Cucumber.js, Playwright, Page Object Model, CI/CD Jenkins, serta integrasi Jira dan TestRail — mencerminkan alur kerja QA Automation Engineer di industri.

Kontribusi, saran, atau laporan bug pada framework ini bisa disampaikan lewat GitHub Issues di repository ini.

---

<p align="center">Dibangun dengan menggunakan Cucumber.js + Playwright + Jenkins + Jira + TestRail</p>
