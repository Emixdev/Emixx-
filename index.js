const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const venom = require('venom-bot');

// === KONFIGURASI ===
const TELEGRAM_TOKEN = '7701966240:AAHFGHRVkXSnfOBt-FC5Ls991_t7nwSMbLA';
const ADMIN_ID = '8097806353'; // contoh: 123456789
const DATA_URL = 'https://emixdev.github.io/Fittdat/data.json';
let whatsappClient;

// === START TELEGRAM BOT ===
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const menu = {
    reply_markup: {
      keyboard: [
        ['📋 Data Client Aktif', '📊 Statistik'],
        ['🎴 Random Waifu', '🧮 Kalkulator'],
        ['📤 Broadcast WA', '🔧 Tools Tambahan']
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };
  bot.sendMessage(msg.chat.id, `Hai ${msg.from.first_name}!\n\nSelamat datang di *Emix Bot Panel*.\nPilih menu yang tersedia:`, { parse_mode: 'Markdown', ...menu });
});

// === DATA CLIENT ===
bot.onText(/Data Client Aktif/, async (msg) => {
  try {
    const res = await axios.get(DATA_URL);
    const activeClients = res.data.filter(c => c.status.toLowerCase() === 'aktif');
    let response = '*Client Aktif Emix Store:*\n\n';
    activeClients.forEach((c, i) => {
      response += `${i + 1}. ${c.nama} - ${c.paket} (${c.sisaHari} hari)\n`;
    });
    bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
  } catch (err) {
    bot.sendMessage(msg.chat.id, 'Gagal mengambil data client.');
  }
});

// === BROADCAST WA ===
bot.onText(/Broadcast WA/, async (msg) => {
  if (msg.chat.id != ADMIN_ID) return;
  bot.sendMessage(msg.chat.id, 'Ketik pesan broadcast yang ingin dikirim ke semua client WA:');
  bot.once('message', async (res) => {
    const message = res.text;
    const { data } = await axios.get(DATA_URL);
    const activeClients = data.filter(c => c.status.toLowerCase() === 'aktif');
    activeClients.forEach(client => {
      if (client.wa) {
        whatsappClient.sendText(client.wa + '@c.us', message);
      }
    });
    bot.sendMessage(msg.chat.id, 'Broadcast berhasil dikirim!');
  });
});

// === RANDOM WAIFU ===
bot.onText(/Random Waifu/, async (msg) => {
  const urls = [
    'https://i.pinimg.com/564x/0a/9e/b3/0a9eb3c65d384190aeb3088f17aa695e.jpg',
    'https://i.pinimg.com/564x/f3/84/b7/f384b774f25d9a2e3d83028719fa89dc.jpg',
    'https://i.pinimg.com/564x/cc/e4/6f/cce46fa45b88f2fa33480e7e1d1c77de.jpg'
  ];
  const random = urls[Math.floor(Math.random() * urls.length)];
  bot.sendPhoto(msg.chat.id, random, { caption: 'Waifu pilihan hari ini' });
});

// === KALKULATOR ===
bot.onText(/Kalkulator/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Ketik ekspresi matematika (contoh: 5+7*2):');
  bot.once('message', (res) => {
    try {
      const result = eval(res.text);
      bot.sendMessage(msg.chat.id, `Hasil: ${result}`);
    } catch {
      bot.sendMessage(msg.chat.id, 'Format tidak valid.');
    }
  });
});

// === STATISTIK ===
bot.onText(/Statistik/, async (msg) => {
  const res = await axios.get(DATA_URL);
  const data = res.data;
  const total = data.length;
  const aktif = data.filter(d => d.status.toLowerCase() === 'aktif').length;
  const expired = total - aktif;
  bot.sendMessage(msg.chat.id, `📊 Statistik Client:\n\nTotal: ${total}\nAktif: ${aktif}\nExpired: ${expired}`);
});

// === TOOLS TAMBAHAN ===
bot.onText(/Tools Tambahan/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Tools tambahan:\n\n- /linkdashboard\n- /contact\n- /play [judul musik]');
});

bot.onText(/\/linkdashboard/, (msg) => {
  bot.sendMessage(msg.chat.id, `Buka dashboard client:\nhttps://emixdev.github.io/Fittdat/`);
});

bot.onText(/\/contact/, (msg) => {
  bot.sendMessage(msg.chat.id, `Hubungi Developer:\nhttps://wa.me/62895391694499`);
});

// === PLAY MUSIC (YTDL) — KOSONG DULU ===
bot.onText(/\/play (.+)/, (msg, match) => {
  const keyword = match[1];
  bot.sendMessage(msg.chat.id, `Fitur play belum aktif, kamu cari: *${keyword}*`, { parse_mode: 'Markdown' });
});

// === START VENOM ===
venom
  .create({
    session: 'emixbot-session',
    multidevice: true
  })
  .then(client => {
    whatsappClient = client;
    console.log('WhatsApp connected!');
  })
  .catch(err => {
    console.error('WA connect error:', err);
  });
