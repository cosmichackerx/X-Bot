const fs = require('fs');
const path = require('path');
const config = require('../config');
const os = require('os');

// --- CONFIGURATION ---
const GITHUB_USER = 'cosmichackerx';
const GITHUB_LINK = `https://github.com/${GITHUB_USER}`;
const GITHUB_PF = `https://github.com/${GITHUB_USER}.png`; 
const BOT_NAME = "X BOT";

module.exports = {
    cmd: 'menu',
    desc: 'Displays the main command list',
    run: async ({ sock, m, args }) => {
        try {
            // 1. DEFINE SENDER (Fixes the crash)
            // In groups, the sender is 'participant'. In private, it's 'remoteJid'.
            const sender = m.key.participant || m.key.remoteJid;
            const pushName = m.pushName || "Cyber User";

            // 2. DYNAMIC PLUGIN LOADER
            const pluginsDir = path.join(__dirname, '../plugins');
            const files = fs.readdirSync(pluginsDir);
            
            let commands = [];
            files.forEach(file => {
                if (file.endsWith('.js')) {
                    try {
                        const plugin = require(path.join(pluginsDir, file));
                        if (plugin.cmd) {
                            commands.push({
                                cmd: plugin.cmd,
                                desc: plugin.desc || 'No description'
                            });
                        }
                    } catch (e) {
                        // Skip invalid files
                    }
                }
            });

            // Sort A-Z
            commands.sort((a, b) => a.cmd.localeCompare(b.cmd));

            // 3. SYSTEM STATS
            const uptimeSeconds = process.uptime();
            const days = Math.floor(uptimeSeconds / (3600 * 24));
            const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
            const minutes = Math.floor((uptimeSeconds % 3600) / 60);
            const seconds = Math.floor(uptimeSeconds % 60);
            const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            
            const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
            const totalRam = (os.totalmem() / 1024 / 1024).toFixed(2);
            const platform = os.platform();
            
            // Time
            const now = new Date();
            const time = now.toLocaleTimeString();
            const date = now.toLocaleDateString();

            // 4. BUILD MENU TEXT
            let text = `╭━━━〔 🚀 *${BOT_NAME}* 〕━━━┈\n`;
            text += `┃ 👋 *User:* @${sender.split('@')[0]}\n`;
            text += `┃ 👑 *Owner:* ${config.OWNER_NAME || 'Cosmic Hacker X'}\n`;
            text += `┃ ⚡ *Prefix:* [ ${config.PREFIX} ]\n`;
            text += `┃ 🖥️ *Host:* ${platform}\n`;
            text += `┃ 💾 *RAM:* ${ramUsage}MB / ${totalRam}MB\n`;
            text += `┃ ⏱️ *Runtime:* ${uptimeStr}\n`;
            text += `┃ 📅 *Date:* ${date}\n`;
            text += `┃ 🧩 *Commands:* ${commands.length}\n`;
            text += `╰━━━━━━━━━━━━━━━━━━┈\n\n`;

            text += `╭━━━〔 🛠️ *COMMAND LIST* 〕━━━┈\n`;
            commands.forEach((c, i) => {
                text += `┃ ${i+1}. *${config.PREFIX}${c.cmd}*\n`;
                text += `┃ └ ${c.desc}\n`;
            });
            text += `╰━━━━━━━━━━━━━━━━━━┈\n`;
            text += `\n_Select a command by typing ${config.PREFIX}commandname_`;

            // 5. SEND WITH AD-REPLY (Card Style)
            await sock.sendMessage(m.key.remoteJid, {
                text: text,
                contextInfo: {
                    mentionedJid: [sender], // Fixes the mention
                    externalAdReply: {
                        title: `${BOT_NAME} | Verified Menu`,
                        body: "Tap to visit GitHub Profile",
                        thumbnailUrl: GITHUB_PF,
                        sourceUrl: GITHUB_LINK,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        showAdAttribution: true 
                    }
                }
            }, { quoted: m });

        } catch (e) {
            console.error("Menu Error:", e);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Error generating menu: " + e.message });
        }
    }
};
