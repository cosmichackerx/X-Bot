# X-Bot

 
```markdown
# 🚀 X-BOT | Advanced WhatsApp Automator

![Version](https://img.shields.io/badge/version-2.0.0-blue?style=for-the-badge)
![NodeJS](https://img.shields.io/badge/Node.js-18%2B-green?style=for-the-badge)
![Maintained](https://img.shields.io/badge/Maintained-Yes-orange?style=for-the-badge)

**X-BOT** is a powerful, modular WhatsApp Userbot built on `@whiskeysockets/baileys`. Designed by **CosmicHackerX**, it fuses advanced AI chat, OSINT (Open Source Intelligence) tools, and privacy features into a single lightweight platform.

---

## 🌟 Key Features

### 🧠 Artificial Intelligence
- **Groq AI (.groq):** Chat with Llama 3.1 & Mixtral models. Includes auto-fallback reliability.
- **Pollinations AI (.pollai):** Generate unlimited AI art/images instantly.
- **Automation:** Smart auto-reply and task handling.

### 🕵️‍♂️ OSINT & Hacking Tools
- **Carrier Info (.carrierinfo):** deeply analyze phone numbers (Region, Line Type, Carrier).
- **Subdomain Scanner (.subdomain):** Hunt hidden subdomains using Certificate Transparency logs.
- **Network Tools:** `gridscan`, `sequentialscan`, `neighbours` (Network mapping tools).
- **Carrier Hunt:** Advanced number scanning utilities.

### 🛡️ Privacy & Security
- **Anti-Delete:** Automatically recovers deleted messages (Text, Media, Voice) and forwards them to your private chat.
- **ViewOnce Unlocker:** Reply with `.send` to save "View Once" media permanently.
- **Status Saver:** Download anyone's WhatsApp Status instantly.

### ⚙️ System & Utilities
- **Dashboard (.systeminfo):** Real-time server health (RAM, CPU, Uptime) with visual progress bars.
- **Calculator (.calculate):** Scientific calculator engine.
- **Weather (.weather):** Live world-wide weather reports.
- **VCF Tools:** Contact file management.

---

## 📋 Requirements

Before you begin, ensure you have the following installed:

1.  **Node.js** (v18.0.0 or higher)
2.  **NPM** (Node Package Manager)
3.  **A valid WhatsApp Account** (to act as the bot)

---

## 🛠️ Installation & Setup

### 1. Clone the Repository
Open your terminal and clone the project:
```bash
git clone [https://github.com/cosmichackerx/X-Bot.git](https://github.com/cosmichackerx/X-Bot.git)
cd X-Bot

```

### 2. Install Dependencies

Install all required system modules:

```bash
npm install

```

### 3. Configuration

Create a `.env` file or edit `config.js` to set your credentials:

```javascript
// config.js
module.exports = {
    PREFIX: '.',
    OWNER_NUMBER: '923367307471', // Your number without +
    GROQ_API_KEY: 'gsk_...',      // Your Groq API Key
    WEATHER_API_KEY: '60ad...'    // OpenWeatherMap Key
};

```

### 4. Start the Bot

Run the following command to start the system:

```bash
npm start

```

*or for development:*

```bash
npm run dev

```

---

## 📱 Pairing Tutorial (No QR Code Needed)

X-BOT uses the modern **Pairing Code** method, so you don't need a second phone to scan QR codes.

1. Run `npm start`.
2. The console will show: `🚀 Web Interface running on port 20070`.
3. Open your browser and go to: `http://localhost:20070` (or your server IP).
4. Enter your phone number (e.g., `92336...`).
5. Click **GET PAIRING CODE**.
6. You will receive a notification on WhatsApp: *"Enter pairing code"*.
7. Tap the notification and enter the code displayed on the website.
8. **Success!** The bot is now connected.

---

## 📂 Project Structure

```text
X-Bot/
├── lib/               # Core System Files
│   ├── handler.js     # Plugin Loader & Command Processor
│   └── server.js      # Web Interface for Pairing
├── plugins/           # Feature Modules (Add your own here!)
│   ├── ai/            # Groq, PollAI
│   ├── tools/         # Calculator, Weather
│   ├── osint/         # Carrier, Subdomain
│   └── core/          # Menu, Ping, System
├── config.js          # Main Configuration
├── index.js           # Entry Point
└── package.json       # Dependencies

```

---

## ⚠️ Disclaimer

This project is for **Educational Purposes Only**.
The developer (**CosmicHackerX**) is not responsible for any misuse of the OSINT or "Nuke" tools provided in this repository. Use responsibly and respect WhatsApp's Terms of Service.

---

**Powered by [Baileys**](https://github.com/WhiskeySockets/Baileys)

```

```
