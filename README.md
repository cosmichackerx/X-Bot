# 🚀 X-BOT | Advanced WhatsApp Automator

![Version](https://img.shields.io/badge/version-2.0.0-blue?style=for-the-badge)
![NodeJS](https://img.shields.io/badge/Node.js-18%2B-green?style=for-the-badge)
![Maintained](https://img.shields.io/badge/Maintained-Yes-orange?style=for-the-badge)

**X-BOT** is a powerful, modular WhatsApp Userbot built using [`@whiskeysockets/baileys`](https://github.com/WhiskeySockets/Baileys).
Developed by **CosmicHackerX**, it integrates AI systems, OSINT utilities, automation tools, and privacy modules into one scalable platform.

---

# 🌟 Key Features

## 🧠 Artificial Intelligence

* **Groq AI (`.groq`)** — Llama 3.1 & Mixtral with auto-fallback
* **Pollinations AI (`.pollai`)** — Unlimited AI image generation
* **Smart Automation** — Intelligent auto-replies

## 🕵️ OSINT & Intelligence Tools

* `.carrierinfo`
* `.subdomain`
* `gridscan`
* `sequentialscan`
* `neighbours`
* Carrier Hunt system

## 🛡️ Privacy & Security

* Anti-Delete
* ViewOnce Unlocker
* Status Saver

## ⚙️ Utilities

* `.systeminfo`
* `.calculate`
* `.weather`
* VCF Tools

---

# 📋 Requirements

* Node.js v18+
* NPM
* WhatsApp Account
* Stable Internet Connection

---

# 🛠️ Installation

```bash
git clone https://github.com/cosmichackerx/X-Bot.git
cd X-Bot
npm install
```

---

# ⚙️ Configuration

Edit `config.js`:

```javascript
module.exports = {
  PREFIX: '.',
  OWNER_NUMBER: '923XXXXXXXXX',
  GROQ_API_KEY: 'gsk_...',
  WEATHER_API_KEY: 'your_openweather_key'
};
```

Or use `.env` for production.

---

# ▶️ Running the Bot

Production:

```bash
npm start
```

Development:

```bash
npm run dev
```

---

# 📱 Pairing Method (No QR)

1. Run `npm start`
2. Open:

   ```
   http://localhost:20070
   ```
3. Enter WhatsApp number
4. Get pairing code
5. Enter inside WhatsApp
6. ✅ Connected

---

# 🚀 Complete Deployment Guide

---

# 🖥️ Windows Deployment

1. Install Node.js (v18+)
2. Install Git
3. Open **Command Prompt** or **PowerShell**
4. Run:

```bash
git clone https://github.com/cosmichackerx/X-Bot.git
cd X-Bot
npm install
npm start
```

Access pairing:

```
http://localhost:20070
```

---

# 🐧 Linux Deployment (General)

```bash
sudo apt update
sudo apt install nodejs npm git -y
git clone https://github.com/cosmichackerx/X-Bot.git
cd X-Bot
npm install
npm start
```

---

# 🟢 Ubuntu VPS Deployment

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nodejs npm git -y
git clone https://github.com/cosmichackerx/X-Bot.git
cd X-Bot
npm install
npm start
```

Optional: Use PM2

```bash
npm install -g pm2
pm2 start index.js --name x-bot
pm2 save
pm2 startup
```

---

# 📱 Termux Deployment (Android)

Install Termux from F-Droid.

Inside Termux:

```bash
pkg update && pkg upgrade -y
pkg install nodejs git -y
git clone https://github.com/cosmichackerx/X-Bot.git
cd X-Bot
npm install
npm start
```

Then open:

```
http://localhost:20070
```

---

# 🌐 Replit Deployment

1. Create new Node.js Repl
2. Upload project files or import from GitHub
3. In Shell:

```bash
npm install
npm start
```

4. Use Replit Web URL instead of localhost

---

# 🚂 Railway Deployment

1. Create new Railway project
2. Connect GitHub repository
3. Set:

   * Node version: 18+
4. Add environment variables
5. Deploy

Start Command:

```
npm start
```

---

# 🎨 Render Deployment

1. Create Web Service
2. Connect GitHub repo
3. Settings:

   * Runtime: Node
   * Build Command:

     ```
     npm install
     ```
   * Start Command:

     ```
     npm start
     ```
4. Add environment variables
5. Deploy

---

# 🟣 Heroku Deployment

1. Install Heroku CLI
2. Login:

```bash
heroku login
```

3. Create app:

```bash
heroku create x-bot-app
```

4. Push:

```bash
git push heroku main
```

5. Set environment variables:

```bash
heroku config:set GROQ_API_KEY=your_key
```

6. Open:

```bash
heroku open
```

---

# 🖥️ Panel Deployment (Pterodactyl)

1. Create Node.js server
2. Upload files
3. Startup command:

   ```
   npm start
   ```
4. Install dependencies:

   ```
   npm install
   ```
5. Set environment variables
6. Start server

---

# ☁️ Kata Byump Deployment

```bash
npm install && npm start
```

Ensure:

* Node 18+
* Environment variables configured

---

# 🖥️ Terminal Usage (General)

Basic commands:

```bash
cd X-Bot
npm install
npm start
npm run dev
```

Stop process:

```
CTRL + C
```

---

# 📂 Project Structure

```
X-Bot/
├── lib/
├── plugins/
├── config.js
├── index.js
└── package.json
```

---

# ⚠️ Disclaimer

For educational and research purposes only.
Users must comply with WhatsApp Terms of Service and local laws.

---

# 🤝 Contributing

Pull requests welcome.

---

 
# 🏁 Final Note

X-BOT is modular, scalable, and production-ready.
Built for developers who want complete automation control.

---

 
