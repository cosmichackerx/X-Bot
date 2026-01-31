// File: lib/server.js
const express = require('express');
const config = require('../config');

// HTML Content with FIXED Copy Logic
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
            <textarea id="hidden-copy-input" style="position: absolute; left: -9999px;"></textarea>
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
            
            try {
                const response = await fetch('/pair?phone=' + num);
                const data = await response.json();
                
                if (data.code) {
                    document.getElementById('login-section').style.display = 'none';
                    const codeBox = document.getElementById('code-box');
                    codeBox.style.display = 'block';
                    codeBox.innerText = data.code;
                    
                    document.getElementById('hidden-copy-input').value = data.code; // Set hidden input
                    document.getElementById('copy-btn').style.display = 'block';
                    
                    status.innerText = "✅ Code Generated! Pair quickly.";
                } else {
                    throw new Error(data.error || "Failed to generate code.");
                }
            } catch (e) {
                btn.disabled = false; 
                btn.innerText = "GET PAIRING CODE"; 
                status.innerText = "❌ Error: " + e.message;
            }
        }

        function copyCode() {
            const codeText = document.getElementById('code-box').innerText;
            const hiddenInput = document.getElementById('hidden-copy-input');
            const btn = document.getElementById('copy-btn');

            // Robust Copy Method (Works on HTTP and HTTPS)
            hiddenInput.select();
            hiddenInput.setSelectionRange(0, 99999); // For mobile devices
            
            try {
                document.execCommand('copy');
                btn.innerText = "✅ COPIED!";
                setTimeout(() => btn.innerText = "📋 COPY CODE", 2000);
            } catch (err) {
                // Fallback attempt
                navigator.clipboard.writeText(codeText).then(() => {
                     btn.innerText = "✅ COPIED!";
                }).catch(() => {
                     btn.innerText = "❌ MANUAL COPY REQUIRED";
                });
            }
        }
    </script>
</body>
</html>
`;

function startServer(sock) {
    const app = express();
    const port = process.env.PORT || 20070;

    app.get('/', (req, res) => res.send(PAIRING_HTML));

    app.get('/pair', async (req, res) => {
        const phone = req.query.phone;
        
        if (!sock) return res.json({ error: "Bot is starting up... please wait 10 seconds." });

        try {
            if (!sock.authState.creds.registered) {
                // Formatting delay to ensure socket is ready
                await new Promise(r => setTimeout(r, 1000));
                
                let code = await sock.requestPairingCode(phone);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                res.json({ code: code });
            } else {
                res.json({ error: "Session already active! Delete 'session' folder to re-pair." });
            }
        } catch (e) {
            console.error("Pairing Error:", e);
            res.json({ error: "Failed: " + e.message });
        }
    });

    app.listen(port, () => console.log(`🚀 Web Interface running on port ${port}`));
}

module.exports = { startServer };
