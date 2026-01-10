const express = require('express');
const config = require('../config');

function startServer(sock) {
    const app = express();
    const port = process.env.PORT || 20070;

    // Minimal "Cosmic" HTML
    const PAIRING_HTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>X BOT | Cosmic Control</title>
        <style>
            body { background: #0d1117; color: #c9d1d9; font-family: monospace; text-align: center; padding-top: 50px; }
            input, button { padding: 10px; margin: 10px; border-radius: 5px; }
            button { background: #238636; color: white; border: none; cursor: pointer; }
        </style>
    </head>
    <body>
        <h1>🚀 X BOT MANAGER</h1>
        <input type="text" id="phone" placeholder="92333..." value="${config.OWNER_NUMBER || ''}">
        <button onclick="pair()">GET CODE</button>
        <h2 id="code" style="color:#58a6ff; letter-spacing: 5px;"></h2>
        <script>
            async function pair() {
                const num = document.getElementById('phone').value;
                const res = await fetch('/pair?phone=' + num);
                const data = await res.json();
                document.getElementById('code').innerText = data.code || data.error;
            }
        </script>
    </body>
    </html>
    `;

    app.get('/', (req, res) => res.send(PAIRING_HTML));

    app.get('/pair', async (req, res) => {
        const phone = req.query.phone;
        if (!sock) return res.json({ error: "System starting..." });
        try {
            if (!sock.authState.creds.registered) {
                let code = await sock.requestPairingCode(phone);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                res.json({ code: code });
            } else {
                res.json({ error: "Already Connected" });
            }
        } catch (e) {
            res.json({ error: e.message });
        }
    });

    app.listen(port, () => console.log(`🌍 Web Interface running on port ${port}`));
}

module.exports = { startServer };
