const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const express = require("express");
const QRCode = require("qrcode");
const path = require("path");

let latestQR = null;
let botStatus = "🔴 Offline";

function evilBanner() {
    console.log(`
██████╗  █████╗ ██╗  ██╗██╗      ██╗  ██╗
██╔══██╗██╔══██╗██║ ██╔╝██║      ██║  ██║
██████╔╝███████║█████╔╝ ██║      ███████║
██╔═══╝ ██╔══██║██╔═██╗ ██║      ██╔══██║
██║     ██║  ██║██║  ██╗███████╗ ██║  ██║
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═╝  ╚═╝
     👑 RAHL XMD — Ancient Dark Overlord 👑
`);
}

async function startBot() {
    evilBanner();

    const { state, saveCreds } = await useMultiFileAuthState("auth_info");
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // disable terminal QR
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, qr } = update;
        if (qr) {
            latestQR = await QRCode.toDataURL(qr);
            console.log("📡 QR generated — open panel to scan.");
        }
        if (connection === "open") {
            console.log("✅ RAHL XMD has awakened. Darkness spreads...");
            botStatus = "🟢 Online";
            latestQR = null; // clear QR after login
        }
        if (connection === "close") {
            botStatus = "🔴 Offline";
        }
    });

    sock.ev.on("messages.upsert", async (msg) => {
        if (!msg.messages) return;
        const m = msg.messages[0];
        if (!m.message || m.key.fromMe) return;

        const sender = m.key.remoteJid;
        const text = m.message.conversation || m.message.extendedTextMessage?.text;

        if (text) {
            console.log("📩 Message from", sender, ":", text);

            if (text.toLowerCase() === "!ping") {
                await sock.sendMessage(sender, { text: "⚡ The shadows answer... Pong." });
            } else if (text.toLowerCase() === "!help") {
                await sock.sendMessage(sender, { text: "📜 Ancient Commands:\n!ping\n!help\n!darktruth" });
            }
        }
    });
}

// === Web Server for QR Panel ===
const app = express();
app.use(express.static(path.join(__dirname, "public")));

app.get("/status", (req, res) => {
    res.json({ status: botStatus, qr: latestQR });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌑 RAHL XMD Panel running at http://localhost:${PORT}`));

// Start Bot
startBot();
