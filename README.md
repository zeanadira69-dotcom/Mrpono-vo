# Mr Pono Tech · Voice Over (Vercel)

Landing page: tempel naskah → pilih suara → unduh MP3.
Halaman statis (`index.html`) + satu fungsi serverless (`api/tts.js`) yang memanggil Microsoft Edge TTS.

## Struktur repo (harus persis begini)

```
index.html
package.json
vercel.json
api/
  tts.js
```

`tts.js` WAJIB berada di folder `api/`.

## Deploy dari HP (lewat GitHub)

1. Di GitHub, buat repo baru, misalnya `mrpono-vo`.
2. Tambahkan 4 file: **Add file → Create new file**.
   - Kolom nama: ketik `index.html`, tempel isinya, Commit.
   - Ulangi untuk `package.json` dan `vercel.json`.
   - Untuk fungsi API, ketik nama `api/tts.js` (dengan garis miring; GitHub otomatis membuat folder `api`), tempel isinya, Commit.
3. Buka vercel.com → **Add New → Project** → pilih repo `mrpono-vo` → **Deploy**.
   Tidak perlu mengubah pengaturan apa pun.
4. Selesai. Buka alamat `xxxx.vercel.app` yang diberikan Vercel.

## Tes cepat setelah deploy

Buka di browser: `https://ALAMATMU.vercel.app/api/tts?text=Halo%20semuanya`
Kalau terdengar suara atau terunduh MP3, fungsi API berjalan. Lalu coba tombol **Tes suara** di halaman.

## Kunci halaman (disarankan)

Alamat `vercel.app` bersifat publik. Supaya orang lain tidak memakai kuota Anda:

1. Vercel → Project → Settings → Environment Variables.
2. Tambah `ACCESS_CODE` dengan nilai kata sandi pilihan Anda → Save.
3. Redeploy (Deployments → ⋯ → Redeploy).
4. Di halaman, buka **Kode akses (opsional)**, isi kata sandi yang sama. Tersimpan di browser.

## Jika gagal

- **"Layanan suara menolak atau gagal"**: Microsoft kadang menolak permintaan dari server cloud. Coba lagi beberapa menit. Potongan yang sudah jadi tersimpan, tekan **Buat MP3** lagi untuk melanjutkan.
- **404 di /api/tts**: file `tts.js` tidak berada di folder `api/`.
- **Build gagal di Vercel**: lihat tab Logs di deployment dan kirim pesan errornya.

## Batas

- Maksimal 2000 karakter per permintaan di server. Halaman memecah naskah otomatis (1200 karakter per potongan).
- Jeda antar paragraf dibuat dengan potongan MP3 hening; hasil digabung langsung di browser.
