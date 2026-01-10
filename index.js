/**
 * index.js - Minimal WhatsApp Connection
 * Purpose: Establish and maintain a WhatsApp connection via Baileys.
 */

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers,
    delay
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');
const config = require('./config');

// ============================================================
// 🌐 WEB INTERFACE (GUI) CONFIGURATION
// ============================================================
const app = express();
const port = process.env.PORT || process.env.SERVER_PORT || 20070;
let globalSock = null;

// 🎨 COSMIC THEMED HTML INTERFACE
const PAIRING_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>X BOT | Cosmic Connection</title>
    <style>
        body { background-color: #0d1117; color: #c9d1d9; font-family: 'Courier New', Courier, monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; flex-direction: column; }
        .container { background: #161b22; padding: 30px; border-radius: 15px; box-shadow: 0 0 20px #58a6ff; text-align: center; width: 90%; max-width: 400px; border: 1px solid #30363d; }
        h1 { color: #58a6ff; text-shadow: 0 0 10px #58a6ff; }
        input { width: 100%; padding: 12px; margin: 10px 0; background: #0d1117; border: 1px solid #30363d; color: #fff; border-radius: 5px; font-size: 16px; text-align: center; }
        button { width: 100%; padding: 12px; margin-top: 10px; background: #238636; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; transition: 0.3s; font-weight: bold; }
        button:hover { background: #2ea043; box-shadow: 0 0 15px #2ea043; }
        .code-display { display: none; margin-top: 20px; padding: 15px; background: #21262d; border: 2px dashed #58a6ff; font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #58a6ff; word-break: break-all; }
        .copy-btn { background: #1f6feb; margin-top: 10px; display: none; }
        .status { margin-top: 10px; font-size: 12px; }
        .footer { margin-top: 20px; font-size: 10px; opacity: 0.5; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 X BOT CONTROL</h1>
        <div id="login-section">
            <p>Enter your number (with country code) to pair.</p>
            <input type="text" id="number" placeholder="923367307471" value="${config.OWNER_NUMBER || ''}">
            <button onclick="getPairingCode()" id="submit-btn">GET PAIRING CODE</button>
        </div>
        
        <div id="result-section">
            <div class="code-display" id="code-box"></div>
            <button class="copy-btn" id="copy-btn" onclick="copyCode()">📋 COPY CODE</button>
        </div>
        
        <p class="status" id="status-msg"></p>
    </div>
    <div class="footer">POWERED BY COSMIC HACKER X</div>

    <script>
        async function getPairingCode() {
            const num = document.getElementById('number').value.replace(/[^0-9]/g, '');
            const btn = document.getElementById('submit-btn');
            const status = document.getElementById('status-msg');
            
            if (!num) return alert("Please enter a valid number!");
            
            btn.disabled = true;
            btn.innerText = "⏳ GENERATING...";
            status.innerText = "Connecting to server...";
            status.style.color = "#e3b341";

            try {
                const response = await fetch('/pair?phone=' + num);
                const data = await response.json();
                
                if (data.code) {
                    document.getElementById('login-section').style.display = 'none';
                    document.getElementById('code-box').style.display = 'block';
                    document.getElementById('code-box').innerText = data.code;
                    document.getElementById('copy-btn').style.display = 'block';
                    status.innerText = "✅ Code Generated! Paste this in WhatsApp > Linked Devices.";
                    status.style.color = "#3fb950";
                } else {
                    throw new Error(data.error || "Failed");
                }
            } catch (e) {
                btn.disabled = false;
                btn.innerText = "GET PAIRING CODE";
                status.innerText = "❌ Error: " + e.message;
                status.style.color = "#f85149";
            }
        }

        function copyCode() {
            const codeText = document.getElementById('code-box').innerText;
            const btn = document.getElementById('copy-btn');
            
            const textArea = document.createElement("textarea");
            textArea.value = codeText;
            textArea.style.position = "fixed";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                if(successful) {
                    btn.innerText = "✅ COPIED!";
                } else {
                    btn.innerText = "❌ FAILED";
                }
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
                btn.innerText = "❌ MANUAL COPY REQ";
            }
            
            document.body.removeChild(textArea);
            setTimeout(() => btn.innerText = "📋 COPY CODE", 2000);
        }
    </script>
</body>
</html>
`;

// Express Routes
app.get('/', (req, res) => {
    res.send(PAIRING_HTML);
});

app.get('/pair', async (req, res) => {
    const phone = req.query.phone;
    if (!phone) return res.json({ error: "No number provided" });
    if (!globalSock) return res.json({ error: "Bot server not ready yet. Wait 10s." });

    try {
        if (!globalSock.authState.creds.registered) {
            let code = await globalSock.requestPairingCode(phone);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            res.json({ code: code });
        } else {
            res.json({ error: "Already registered! Delete session to repair." });
        }
    } catch (e) {
        console.error(e);
        res.json({ error: "Internal Error: " + e.message });
    }
});

app.listen(port, () => console.log(`\n🚀 Server listening on port ${port} - OPEN BROWSER TO PAIR\n`));


// ------------------------------------------------------------
// MAIN BOT FUNCTION
// ------------------------------------------------------------
async function startXBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    console.log(`Starting X BOT (v${version})`);

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Safari"),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        // We handle messages minimally to keep connection alive
        getMessage: async (key) => {
            return { conversation: 'Hello' };
        }
    });

    // Assign to global variable for Express to access
    globalSock = sock;

    // Connection Logic
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut);
            console.log('❌ Connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
            // Reconnect if not logged out
            if (shouldReconnect) {
                startXBot();
            }
        } else if (connection === 'open') {
            console.log('✅ Connected! X Bot is Live.');
            
            // Send presence update to stay online
            await sock.sendPresenceUpdate('available');
        }
    });

    // Save credentials whenever updated
    sock.ev.on('creds.update', saveCreds);

    // Keep-alive mechanism (optional but recommended for long running)
    setInterval(() => {
        try {
            sock.sendPresenceUpdate('available');
        } catch(e) {}
    }, 60000); // Every 1 minute
}

startXBot();
