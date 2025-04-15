const venom = require('venom-bot');

venom
  .create({
    session: 'emix-session',
    multidevice: true, // penting! agar support WA terbaru
  })
  .then((client) => start(client))
  .catch((err) => {
    console.log('Gagal buat session WA:', err);
  });

function start(client) {
  console.log('WhatsApp siap digunakan!');

  // Contoh kirim pesan otomatis
  client.sendText('62895391694499@c.us', 'Halo dari Emix Bot!')
    .then(() => console.log('Pesan berhasil dikirim!'))
    .catch((err) => console.error('Gagal kirim:', err));
}
