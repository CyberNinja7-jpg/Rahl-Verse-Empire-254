// index.js
import express from "express";
import { create } from "venom-bot";
import chalk from "chalk";
import QRCode from "qrcode";

const app = express();
let latestQR = null;
let botStatus = "🟥 Offline";

// ====== EVIL BANNER ======
console.clear();
console.log(chalk.redBright(`
██████╗  █████╗ ██╗  ██╗██╗     ██████╗ 
██╔══██╗██╔══██╗██║ ██╔╝██║     ██╔══██╗
██████╔╝███████║█████╔╝ ██║     ██║  ██║
██╔═══╝ ██╔══██║██╔═██╗ ██║     ██║  ██║
██║     ██║  ██║██║  ██╗███████╗██████╔╝
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═════╝ 
`));
console.log(chalk.magentaBright("⚡ RAHL XMD: Ancient Dark Evil Has Awakened ⚡\n"));

// ====== Serve homepage ======
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>RAHL XMD Panel</title>
        <style>
          body {
            background: black;
            color: #e60000;
            font-family: monospace;
            text-align: center;
            padding: 50px;
          }
          h1 { color: #ff1aff; }
          .status { margin-top: 20px; font-size: 18px; }
          img { margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>👑 RAHL XMD Control Panel</h1>
        <div class="status">
          <p>Status: ${botStatus}</p>
          ${latestQR 
            ? `<img src="${latestQR}" alt="Scan this QR to connect" />` 
            : "<p>No QR available (bot might already be online).</p>"}
        </div>
      </body>
    </html>
  `);
});

// ====== Status API ======
app.get("/status", (req, res) => {
  res.json({
    status: botStatus,
    qr: latestQR,
  });
});

// ====== Start WhatsApp bot ======
create({
  session: "RAHL-XMD",
  multidevice: true,
  headless: true,
  qrTimeout: 0,
})
.then((client) => start(client))
.catch((err) => console.error(chalk.red("❌ Error starting RAHL XMD Bot:"), err));

function start(client) {
  botStatus = "🟩 Online";
  console.log(chalk.green("✅ RAHL XMD is connected to WhatsApp."));

  client.onMessage((message) => {
    if (message.body.toLowerCase() === "rahl") {
      client.sendText(message.from, "👑 The Ancient One has heard your call...");
    }

    if (message.body.toLowerCase() === "ping") {
      client.sendText(message.from, "🏹 Pong! The darkness responds.");
    }
  });
}

// ====== Capture QR ======
import { default as venom } from "venom-bot";

venom.create({
  session: "RAHL-XMD",
  multidevice: true,
  headless: true,
  qrTimeout: 0,
  catchQR: async (qr) => {
    latestQR = await QRCode.toDataURL(qr);
    botStatus = "🟨 Waiting for QR scan";
    console.log("📡 New QR generated, scan from homepage panel.");
  }
});

// ====== Run Express server ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌍 Panel available at http://localhost:${PORT}`);
});
