// Vercel Serverless Function: teks -> MP3 (Microsoft Edge TTS)
// POST /api/tts  { text, voice, rate, pitch }   -> audio/mpeg
// GET  /api/tts?text=halo                       -> tes cepat dari browser
import { EdgeTTS } from 'edge-tts-universal';

const MAKS_KARAKTER = 2000;
const BATAS_MS = 15000; // maksimal menunggu layanan suara per percobaan
const VOICE_OK = /^[a-z]{2,3}-[A-Z]{2}-[A-Za-z]+Neural$/;
const RATE_OK = /^[+-]\d{1,3}%$/;
const PITCH_OK = /^[+-]\d{1,3}Hz$/;

function kirimError(res, status, pesan, detail) {
  const isi = { error: pesan };
  if (detail) isi.detail = detail;
  res.status(status).json(isi);
}

function denganBatas(janji, ms) {
  let pewaktu;
  const batas = new Promise((_, tolak) => {
    pewaktu = setTimeout(
      () => tolak(new Error(`Waktu habis: layanan suara tidak menjawab dalam ${ms / 1000} detik`)),
      ms
    );
  });
  return Promise.race([janji, batas]).finally(() => clearTimeout(pewaktu));
}

async function sintesis(text, voice, rate, pitch) {
  const tts = new EdgeTTS(text, voice, { rate, volume: '+0%', pitch });
  const hasil = await tts.synthesize();
  return Buffer.from(await hasil.audio.arrayBuffer());
}

function ringkas(e) {
  const pesan = e && e.message ? e.message : String(e);
  return pesan.slice(0, 300);
}

export default async function handler(req, res) {
  // Kode akses opsional: isi env ACCESS_CODE di Vercel agar tidak dipakai orang lain
  const kode = process.env.ACCESS_CODE;
  if (kode && req.headers['x-access-code'] !== kode) {
    return kirimError(res, 401, 'Kode akses salah.');
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    return kirimError(res, 405, 'Method tidak diizinkan.');
  }

  const sumber = req.method === 'POST' ? (req.body || {}) : (req.query || {});
  const text = String(sumber.text || '').trim();
  const voice = String(sumber.voice || 'id-ID-ArdiNeural');
  const rate = String(sumber.rate || '+0%');
  const pitch = String(sumber.pitch || '+0Hz');

  if (!text) return kirimError(res, 400, 'Teks kosong.');
  if (text.length > MAKS_KARAKTER) {
    return kirimError(res, 400, `Teks terlalu panjang (maks ${MAKS_KARAKTER} karakter per permintaan).`);
  }
  if (!VOICE_OK.test(voice)) return kirimError(res, 400, 'Nama suara tidak valid.');
  if (!RATE_OK.test(rate)) return kirimError(res, 400, 'Format kecepatan tidak valid.');
  if (!PITCH_OK.test(pitch)) return kirimError(res, 400, 'Format nada tidak valid.');

  let galatTerakhir;
  for (let i = 0; i < 2; i++) {
    try {
      const audio = await denganBatas(sintesis(text, voice, rate, pitch), BATAS_MS);
      if (audio.length > 0) {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).send(audio);
      }
      galatTerakhir = new Error('Layanan mengembalikan audio kosong');
    } catch (e) {
      galatTerakhir = e;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  console.error('TTS gagal:', galatTerakhir);
  return kirimError(res, 502, 'Layanan suara gagal.', ringkas(galatTerakhir));
}
