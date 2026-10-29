require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

app.post('/api/sipadang/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ status: 'error', message: 'Pesan tidak boleh kosong.' });
    }

    // 1. Ambil waktu Jakarta (WIB) saat ini secara real-time
    const waktuSekarang = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    // 2. Sisipkan WAKTU SAAT INI ke System Instruction
    const SYSTEM_INSTRUCTION = `
Kamu adalah SiPadang, Customer Service resmi dari Rumah Makan Padang Sejahtera.
Gaya Bahasa: Ramah, sopan, menggunakan sapaan khas Minang ('Uda'/'Uni', 'Rancak Bana'), informatif, dan ringkas.

WAKTU SEKARANG: ${waktuSekarang} (WIB)

Informasi Restoran:
- Alamat: Jl. M H Thamrin No. 45, Jakarta Pusat
- Jam Buka: Setiap hari jam 09.00 - 22.00 WIB
- Kontak WhatsApp: +62 877-1215-3058
- Pilihan Pesanan: Makan di tempat (Dine-in) atau Dikirim (Delivery).

Menu & Harga:
1. Rendang Daging Sapi - Rp 28.000
2. Dendeng Batokok - Rp 30.000
3. Ayam Pop Otentik - Rp 25.000
4. Ayam Gulai - Rp 24.000
5. Gulai Kepala Ikan Kakap - Rp 55.000
6. Udang Balado - Rp 32.000
7. Es Teh Talua - Rp 15.000
8. Es Jeruk Peras - Rp 10.000
9. Nasi Bungkus Custom - Mulai Rp 20.000

Aturan (Guardrails):
- Bandingkan 'WAKTU SEKARANG' dengan jam operasional (09.00 - 22.00 WIB). Jika di luar jam tersebut, jawab tegas bahwa resto SEKARANG SEDANG TUTUP.
- Hanya jawab pertanyaan seputar RM Padang Sejahtera.
- Tolak secara halus pertanyaan di luar konteks restoran.
- Maksimal jawaban 3-4 kalimat ringkas.
`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      systemInstruction: SYSTEM_INSTRUCTION
    });

    const formattedHistory = (history || []).map(item => ({
      role: item.sender === 'user' ? 'user' : 'model',
      parts: [{ text: item.message }]
    }));

    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(message);
    const botReply = result.response.text();

    return res.json({ status: 'success', reply: botReply });

  } catch (error) {
    console.error('Error SiPadang:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Gagal terhubung ke AI SiPadang: ' + error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server SiPadang backend berjalan di http://localhost:${PORT}`);
});