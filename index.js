
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_TOKEN;
const ownerId = process.env.OWNER_ID;
const bot = new TelegramBot(token, { polling: true });

const DASHBOARD_URL = 'https://emixdev.github.io/Fittdat/data.json';

bot.setMyCommands([
  { command: "/start", description: "Mulai interaksi" },
  { command: "/menu", description: "Tampilkan menu utama" },
  { command: "/cekclient", description: "Cek data client aktif" },
  { command: "/quotes", description: "Random quotes" },
  { command: "/stats", description: "Statistik client" },
  { command: "/play", description: "Mainkan musik dummy" },
  { command: "/webclient", description: "Link dashboard client" }
]);

bot.onText(/\/start|\/menu/, (msg) => {
  const opts = {
    reply_markup: {
      keyboard: [
        ["📊 Cek Client Aktif", "📝 Quotes"],
        ["🎧 Play Musik", "🌐 Web Client"],
        ["📈 Statistik", "💬 Kirim WA"]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };
  bot.sendMessage(msg.chat.id, "Selamat datang di EmixBot. Silakan pilih menu di bawah:", opts);
});

bot.on("message", async (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;

  if (text === "📊 Cek Client Aktif") {
    try {
      const res = await axios.get(DASHBOARD_URL);
      const data = res.data.filter(d => d.status === "Aktif");
      if (!data.length) return bot.sendMessage(chatId, "Belum ada client aktif.");

      let message = "*Daftar Client Aktif:*

";
      data.forEach((d, i) => {
        message += `${i + 1}. ${d.nama} - ${d.hari} hari
`;
      });

      bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    } catch (err) {
      bot.sendMessage(chatId, "Gagal mengambil data dashboard.");
    }
  }

  if (text === "📝 Quotes") {
    const quotes = [
      "Jangan menyerah, awal yang besar dimulai dari langkah kecil.",
      "Waktu terbaik untuk memulai adalah sekarang.",
      "Kamu hebat, tetap semangat ya!"
    ];
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    bot.sendMessage(chatId, `"${random}"`);
  }

  if (text === "🎧 Play Musik") {
    bot.sendMessage(chatId, "Maaf, fitur musik ini hanya dummy. Fitur asli butuh VPS dan audio stream.");
  }

  if (text === "🌐 Web Client") {
    bot.sendMessage(chatId, "Buka dashboard client di sini:
https://emixdev.github.io/Fittdat/");
  }

  if (text === "📈 Statistik") {
    try {
      const res = await axios.get(DASHBOARD_URL);
      const data = res.data.filter(d => d.status === "Aktif");
      let total = data.length;
      let totalHari = data.reduce((sum, d) => sum + parseInt(d.hari), 0);
      bot.sendMessage(chatId, `Jumlah client aktif: ${total}
Total hari aktif: ${totalHari}`);
    } catch {
      bot.sendMessage(chatId, "Gagal mengambil statistik.");
    }
  }

  if (text === "💬 Kirim WA") {
    bot.sendMessage(chatId, "Ketik pesan yang ingin dikirim ke WhatsApp client. (Simulasi: belum konek WA)");
  }
});
