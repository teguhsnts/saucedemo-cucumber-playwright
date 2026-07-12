# SauceDemo Automation Testing Framework

Framework automation testing end-to-end untuk website [SauceDemo](https://www.saucedemo.com), dibangun menggunakan **Cucumber.js** (BDD), **Playwright** (browser automation, cross-browser), dan **Page Object Model**. Dilengkapi pipeline **CI/CD Jenkins** yang otomatis menjalankan test, merekam bukti (video, screenshot, PDF), serta terintegrasi langsung dengan **Jira** (defect tracking), **TestRail** (test case management), dan **Slack** (notifikasi real-time).

![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
![Cucumber](https://img.shields.io/badge/cucumber.js-12.9.0-23D96C)
![Playwright](https://img.shields.io/badge/playwright-cross--browser-2EAD33)
![Tests](https://img.shields.io/badge/scenarios-22-blue)
![CI](https://img.shields.io/badge/CI-Jenkins-D24939)
![Jira](https://img.shields.io/badge/integration-Jira-0052CC)
![TestRail](https://img.shields.io/badge/integration-TestRail-6EBE4A)
![Slack](https://img.shields.io/badge/notification-Slack-4A154B)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## Daftar Isi

1. [Tentang Project Ini](#tentang-project-ini)
2. [Apa yang Diuji](#apa-yang-diuji)
3. [Tech Stack](#tech-stack)
4. [Struktur Project](#struktur-project)
5. [Cara Instalasi](#cara-instalasi)
6. [Cara Menjalankan Test](#cara-menjalankan-test)
7. [Cross-Browser Testing](#cross-browser-testing)
8. [Daftar Lengkap Test Scenario](#daftar-lengkap-test-scenario)
9. [Arsitektur: Page Object Model](#arsitektur-page-object-model)
10. [Laporan Hasil Test (Reporting)](#laporan-hasil-test-reporting)
11. [CI/CD dengan Jenkins](#cicd-dengan-jenkins)
12. [Integrasi Jira](#integrasi-jira)
13. [Integrasi TestRail](#integrasi-testrail)
14. [Notifikasi Slack](#notifikasi-slack)
15. [Cara Menambah Test Baru](#cara-menambah-test-baru)
16. [Troubleshooting](#troubleshooting)
17. [FAQ](#faq)
18. [Kontak & Kontribusi](#kontak--kontribusi)

---

## Tentang Project Ini

Project ini adalah **implementasi automation testing end-to-end** yang meniru kondisi kerja nyata seorang QA Automation Engineer: menulis test case dalam bahasa manusia (Gherkin/BDD), mengotomasi browser dengan Playwright di berbagai engine (Chromium, Firefox, WebKit), menjalankannya otomatis lewat CI/CD, sampai menghubungkan hasilnya ke tool manajemen tim yang sesungguhnya dipakai industri — Jira, TestRail, dan Slack.

**Kenapa pakai pendekatan BDD (Behavior-Driven Development)?**
Test ditulis dalam format `Given-When-Then` yang bisa dibaca siapa saja — bukan cuma developer.

```gherkin
Scenario: Login dengan kredensial valid
  Given user opens the saucedemo login page
  When user logs in with username "standard_user" and password "secret_sauce"
  Then user successfully lands on the products page
```

**Kenapa cross-browser testing penting?**
Aplikasi web dirender berbeda oleh tiap browser engine. Test yang lulus di Chrome belum tentu berperilaku sama di Safari (WebKit) atau Firefox — framework ini memungkinkan seluruh test suite dijalankan di ketiga engine tanpa mengubah satu baris pun kode test.

**Kenapa hasil test perlu terhubung ke Jira, TestRail, dan Slack?**
Di dunia kerja nyata, automation testing jarang berdiri sendiri:
- **Jira** — kegagalan test otomatis jadi tiket yang bisa di-assign dan ditrack
- **TestRail** — histori eksekusi test case yang bisa dilihat stakeholder tanpa buka Jenkins
- **Slack** — tim langsung tahu hasil build tanpa harus polling manual

---

## Apa yang Diuji

Website [SauceDemo](https://www.saucedemo.com) adalah situs demo e-commerce yang dirancang khusus untuk latihan automation testing, lengkap dengan beberapa akun user yang punya bug tersembunyi secara sengaja.

- ✅ **Login** — kredensial valid, invalid, field kosong, akun terkunci
- ✅ **Shopping Cart** — tambah produk, hapus produk, lihat jumlah item
- ✅ **Checkout** — mengisi data pengiriman, menyelesaikan pesanan, validasi form
- ✅ **Sorting produk** — urutkan berdasarkan harga
- ✅ **Logout**
- 🐛 **Bug Detection** — 5 scenario khusus yang **sengaja** menguji akun-akun bermasalah (`problem_user`, `error_user`, `performance_glitch_user`, `visual_user`) untuk membuktikan automation testing bisa mendeteksi defect nyata

---

## Tech Stack

| Tool | Fungsi |
|---|---|
| [Cucumber.js](https://github.com/cucumber/cucumber-js) | Menjalankan test berformat Gherkin (BDD) |
| [Playwright](https://playwright.dev/) | Mengontrol browser — Chromium, Firefox, WebKit |
| [Node.js](https://nodejs.org/) | Runtime JavaScript |
| [dotenv](https://www.npmjs.com/package/dotenv) | Menyimpan kredensial di luar kode |
| [Puppeteer](https://pptr.dev/) | Konversi HTML report jadi PDF |
| [Allure](https://allurereport.org/) *(opsional)* | Dashboard visual hasil test |
| [Jenkins](https://www.jenkins.io/) | CI/CD — menjalankan test otomatis |
| [Jira](https://www.atlassian.com/software/jira) | Defect tracking otomatis |
| [TestRail](https://www.testrail.com/) | Test case management & histori eksekusi |
| [Slack](https://slack.com/) | Notifikasi hasil build real-time |

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
│   └── world.js                 # Setup browser (cross-browser), screenshot, video
│
├── scripts/
│   ├── generate-step-pdf.js     # Generate PDF report per scenario
│   ├── run-cross-browser.js     # Runner untuk menjalankan test di 1 atau semua browser
│   ├── create-jira-bugs.js      # Auto-create Jira ticket dari hasil test
│   ├── sync-testrail.js         # Sync hasil pass/fail ke TestRail
│   └── send-slack-notification.js # Kirim notifikasi hasil build ke Slack
│
├── reports/                     # Output test (dibuat otomatis, tidak di-commit)
│   ├── screenshots/<browser>/<scenario>/
│   ├── videos/<browser>/<scenario>/
│   ├── pdf/<scenario>/
│   ├── cucumber-report.json
│   └── bug-report.json
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
npx playwright install --with-deps chromium firefox webkit
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
| `npm test` | Semua scenario utama (tanpa `@bug`) di Chromium + generate PDF |
| `npm run test:headed` | Sama seperti di atas, browser terlihat |
| `npm run test:positive` | Hanya scenario `@positive` |
| `npm run test:negative` | Hanya scenario `@negative` |
| `npm run test:allure` | Test + siapkan data Allure |
| `npm run allure:full` | Test + generate + buka Allure report |
| `npm run report:step-pdf` | Generate ulang PDF dari hasil terakhir |

### Menjalankan scenario tertentu
```bash
npx cucumber-js --tags "@TC06"
npx cucumber-js --tags "@TC-01-Login or @TC06"
npx cucumber-js --tags "@positive and @smoke"
npx cucumber-js --tags "not @bug"
```

> Gunakan kata `or` / `and` / `not` — bukan koma. Perhatikan tag TC01–TC05 memakai format `@TC-01-Login`/`@TC_03_Login`, sedangkan TC06–TC18 memakai format `@TC06`. Cocokkan persis sesuai yang tertulis di file `.feature`.

---

## Cross-Browser Testing

Seluruh test suite bisa dijalankan di **Chromium, Firefox, atau WebKit** — baik satu per satu maupun sekaligus ketiganya — tanpa mengubah kode test sama sekali.

### Jalankan di satu browser
```bash
node scripts/run-cross-browser.js --browser=chromium --tags="not @bug"
node scripts/run-cross-browser.js --browser=firefox --tags="not @bug"
node scripts/run-cross-browser.js --browser=webkit --tags="not @bug"
```

### Jalankan di semua browser sekaligus
```bash
node scripts/run-cross-browser.js --browser=all --tags="not @bug"
```

Hasil tiap browser tersimpan terpisah supaya tidak saling menimpa:
```
reports/
  screenshots/
    chromium/<scenario>/
    firefox/<scenario>/
    webkit/<scenario>/
  videos/
    chromium/<scenario>/
    firefox/<scenario>/
    webkit/<scenario>/
```

### Di Jenkins
Pilih dari parameter dropdown **`BROWSER`**: `chromium`, `firefox`, `webkit`, atau `all` saat **Build with Parameters**.

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

> Scenario bertag `@bug` **sengaja dibiarkan failed** — dokumentasi defect nyata yang ditemukan di SauceDemo, bukan kesalahan test.

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

---

## Laporan Hasil Test (Reporting)

| Jenis Laporan | Lokasi | Isi |
|---|---|---|
| 🎥 Video | `reports/videos/<browser>/<scenario>/` | Rekaman penuh browser per scenario |
| 📸 Screenshot | `reports/screenshots/<browser>/<scenario>/` | Capture tiap step |
| 📄 PDF | `reports/pdf/<scenario>/` | Step + status + screenshot, hanya untuk scenario yang seluruh step-nya passed |
| 🗂️ JSON | `reports/cucumber-report.json`, `reports/bug-report.json` | Data mentah untuk sync ke Jira & TestRail |

---

## CI/CD dengan Jenkins

### Alur Pipeline
```
1. Checkout kode dari GitHub
2. Ambil .env dari Jenkins Credentials
3. Install dependency + browser (chromium, firefox, webkit)
4. Jalankan Main Test Suite sesuai BROWSER & TEST_SCOPE yang dipilih
   -> Kalau ada kegagalan tak terduga: tandai untuk Jira ticket URGENT
5. Generate PDF + publish Cucumber Report
6. Jalankan Known Bug Scenarios (boleh gagal, tidak menggagalkan build)
7. Buat Jira ticket untuk known bugs (jika diaktifkan)
8. Sync semua hasil ke TestRail (jika diaktifkan)
9. (Opsional) Generate Allure Report
10. Final status check -> build FAILURE jika ada kegagalan tak terduga
11. Kirim notifikasi ke Slack
12. Hapus .env dari server
```

### Build Parameters
| Parameter | Tipe | Keterangan |
|---|---|---|
| `TEST_SCOPE` | Dropdown | `all`, `positive`, `negative`, `bug`, `smoke`, `custom` |
| `CUSTOM_TAG` | Teks | Tag expression manual |
| `BROWSER` | Dropdown | `chromium`, `firefox`, `webkit`, `all` |
| `RUN_ALLURE` | Checkbox | Generate Allure Report |
| `CREATE_JIRA_BUGS` | Checkbox | Auto-create Jira ticket |
| `SYNC_TESTRAIL` | Checkbox | Sync hasil ke TestRail |

### Keamanan Kredensial
File `.env` **tidak pernah** disimpan di repository. Jenkins mengambilnya dari **Jenkins Credentials** (terenkripsi), menyalinnya sementara ke workspace, lalu **menghapusnya otomatis** setelah build selesai.

---

## Integrasi Jira

| Jenis Kegagalan | Label Jira | Prioritas | Efek ke Build |
|---|---|---|---|
| Known bug (`@bug`) | `automation-known-bug` | Low | Tidak menggagalkan build |
| Kegagalan tak terduga (Main Suite) | `automation-urgent` | High | **Build ditandai FAILURE** |

Setiap ticket otomatis berisi nama scenario, tag, pesan error lengkap, dan referensi ke Jenkins build artifact.

**Setup:** kredensial disimpan sebagai Jenkins Credentials (`jira-api-credentials`), memakai email + [Jira API Token](https://id.atlassian.com/manage-profile/security/api-tokens).

---

## Integrasi TestRail

Setiap kali test dijalankan dengan `SYNC_TESTRAIL` aktif, hasil Main Test Suite dan Known Bug Scenarios otomatis dikirim sebagai Test Run baru di TestRail.

```json
// testrail-mapping.json
{
  "TC01": 46,
  "TC02": 47,
  "TC03": 48
}
```

**Setup:** kredensial disimpan sebagai Jenkins Credentials (`testrail-api-credentials`). API TestRail perlu diaktifkan lewat **Administration → Site Settings → API**.

---

## Notifikasi Slack

Setiap build selesai (SUCCESS, UNSTABLE, atau FAILURE), pesan otomatis terkirim ke channel Slack — berisi status, warna sesuai kondisi, dan link langsung ke halaman build Jenkins.

| Status | Warna | Emoji |
|---|---|---|
| SUCCESS | Hijau | ✅ |
| UNSTABLE | Kuning | ⚠️ |
| FAILURE | Merah | ❌ |

**Setup:** buat Incoming Webhook di [Slack API](https://api.slack.com/apps), simpan URL sebagai Jenkins Credentials (`slack-webhook-url`).

---

## Cara Menambah Test Baru

1. Tulis scenario baru di file `.feature` yang sesuai
2. Buat step definition di folder `steps/` (kalau belum ada)
3. Tambahkan locator/method baru di page object terkait
4. **Jika ingin sync ke TestRail**, buat test case baru di TestRail, tambahkan `case_id`-nya ke `testrail-mapping.json`
5. Verifikasi: `npx cucumber-js --tags "@TCxx"`
6. Commit dan push

---

## FAQ

**Q: Kenapa ada scenario yang sengaja dibuat gagal?**
A: Scenario `@bug` menguji akun user SauceDemo yang memang punya bug bawaan. Kegagalannya adalah bukti valid automation berhasil menemukan masalah nyata.

**Q: Apakah cross-browser testing memperlambat proses secara signifikan?**
A: Ya, kira-kira 3x lebih lama untuk `--browser=all` dibanding satu browser saja, karena dijalankan berurutan. Gunakan satu browser spesifik untuk development harian, dan `all` untuk verifikasi sebelum rilis.

**Q: Apakah Jira ticket dan TestRail run dibuat setiap kali test jalan?**
A: Tidak — hanya jika parameter terkait dicentang saat build.

**Q: Apakah aman menjalankan test ini berulang kali?**
A: Ya. Setiap scenario independen, dan folder `reports/` dibersihkan otomatis di setiap run baru (kecuali saat menjalankan cross-browser berantai).

---

## Kontak & Kontribusi

Project ini dibuat sebagai media pembelajaran automation testing dengan Cucumber.js, Playwright (cross-browser), Page Object Model, CI/CD Jenkins, serta integrasi Jira, TestRail, dan Slack — mencerminkan alur kerja QA Automation Engineer di industri.

Kontribusi, saran, atau laporan bug pada framework ini bisa disampaikan lewat GitHub Issues di repository ini.

---

<p align="center">Dibangun dengan menggunakan Cucumber.js + Playwright + Jenkins + Jira + TestRail + Slack</p>
