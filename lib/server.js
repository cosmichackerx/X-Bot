const express = require('express');
const config = require('../config');

// HTML Content with Timer, Fixed Copy, and Reload Button
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
        .copy-btn:hover { background: #388bfd; box-shadow: 0 0 15px #388bfd; }

        .reload-btn { background: #d23b3b; margin-top: 10px; display: none; }
        .reload-btn:hover { background: #e55353; box-shadow: 0 0 15px #e55353; }

        .timer { display: none; margin-top: 15px; font-size: 14px; color: #d2a8ff; font-weight: bold; animation: pulse 1.5s infinite; }
        
        .status { margin-top: 10px; font-size: 12px; }
        .footer { margin-top: 20px; font-size: 10px; opacity: 0.5; }
        
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
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
            <div class="timer" id="timer-box"></div>
            <button class="copy-btn" id="copy-btn" onclick="copyCode()">📋 COPY CODE</button>
            <button class="reload-btn" id="reload-btn" onclick="location.reload()">🔄 EXPIRED - RELOAD</button>
        </div>
        <p class="status" id="status-msg"></p>
    </div>
    <div class="footer">POWERED BY COSMIC HACKER X</div>
    <script>
        let countdownInterval;

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
                    document.getElementById('code-box').style.display = 'block';
                    document.getElementById('code-box').innerText = data.code;
                    document.getElementById('copy-btn').style.display = 'block';
                    status.innerText = "✅ Code Generated!";
                    
                    // Start the 2 minute countdown
                    startTimer(120); 
                } else {
                    throw new Error(data.error || "Failed");
                }
            } catch (e) {
                btn.disabled = false; 
                btn.innerText = "GET PAIRING CODE"; 
                status.innerText = "❌ Error: " + e.message;
            }
        }

        function startTimer(duration) {
            const timerBox = document.getElementById('timer-box');
            timerBox.style.display = 'block';
            let timer = duration, minutes, seconds;
            
            clearInterval(countdownInterval); 

            countdownInterval = setInterval(function () {
                minutes = parseInt(timer / 60, 10);
                seconds = parseInt(timer % 60, 10);

                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                timerBox.innerText = "⏳ EXPIRES IN: " + minutes + ":" + seconds;

                if (--timer < 0) {
                    clearInterval(countdownInterval);
                    timerBox.innerText = "⚠️ CODE EXPIRED";
                    timerBox.style.color = "#ff7b72"; // Reddish color for error
                    
                    // Hide copy button, show reload button
                    document.getElementById('copy-btn').style.display = 'none';
                    document.getElementById('reload-btn').style.display = 'block';
                    
                    // Dim the code box to indicate inactivity
                    document.getElementById('code-box').style.opacity = "0.5";
                }
            }, 1000);
        }

        function copyCode() {
            const codeText = document.getElementById('code-box').innerText;
            const btn = document.getElementById('copy-btn');
            
            const textArea = document.createElement("textarea");
            textArea.value = codeText;
            document.body.appendChild(textArea);
            textArea.select();
            textArea.setSelectionRange(0, 99999);
            
            try {
                document.execCommand('copy');
                btn.innerText = "✅ COPIED!";
            } catch (err) {
                console.error('Fallback copy failed', err);
                btn.innerText = "❌ COPY FAILED";
            }
            document.body.removeChild(textArea);
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
        if (!phone) return res.json({ error: "No number provided" });
        if (!sock) return res.json({ error: "Bot server not ready yet." });

        try {
            if (!sock.authState.creds.registered) {
                let code = await sock.requestPairingCode(phone);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                res.json({ code: code });
            } else {
                res.json({ error: "Already registered!" });
            }
        } catch (e) {
            res.json({ error: "Internal Error: " + e.message });
        }
    });

    app.listen(port, () => console.log(`🚀 Web Interface running on port ${port}`));
}

module.exports = { startServer };
