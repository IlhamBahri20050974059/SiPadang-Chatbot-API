require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

console.log("API Key terbaca:", apiKey ? `${apiKey.substring(0, 8)}...` : "TIDAK ADA!");

if (!apiKey) {
  console.error("Mohon isi GEMINI_API_KEY di file .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function check() {
  try {
    // 1. Tes koneksi sederhana dengan model gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const res = await model.generateContent("Halo");
    console.log("✅ KONEKSI BERHASIL! Respon:", res.response.text());
  } catch (err) {
    console.error("❌ GAGAL DETEKSI:");
    console.error("Pesan Error:", err.message);
    console.error("Status Code:", err.status);
  }
}

check();