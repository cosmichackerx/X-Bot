const { 
    default: makeWASocket, 
    proto, 
    prepareWAMessageMedia, 
    generateWAMessageFromContent 
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Configuration
const GITHUB_USER = 'cosmichackerx';
const GITHUB_LINK = `https://github.com/${GITHUB_USER}`;
const GITHUB_PF = `https://github.com/${GITHUB_USER}.png`;

module.exports = {
    cmd: 'menu',
    desc: 'Opens the Ultimate Menu',
    run: async ({ sock, m, args }) => {
        try {
            // 1. Dynamic Plugin Loader
            const pluginsDir = path.join(__dirname, '../plugins');
            const files = fs.readdirSync(pluginsDir);
            let commands = [];
            
            files.forEach(file => {
                if (file.endsWith('.js')) {
                    try {
                        const plugin = require(path.join(pluginsDir, file));
                        if (plugin.cmd) {
                            commands.push({ cmd: plugin.cmd, desc: plugin.desc || '' });
                        }
                    } catch (err) {}
                }
            });
            commands.sort((a, b) => a.cmd.localeCompare(b.cmd));

            // 2. Build Menu Text
            const prefix = config.PREFIX;
            const time = new Date().toLocaleTimeString();
            
            let menuBody = `👋 *Hi, @${m.sender.split('@')[0]}*\n`;
            menuBody += `🤖 *Bot:* X BOT Pro\n`;
            menuBody += `👑 *Owner:* ${config.OWNER_NAME || 'Cosmic'}\n`;
            menuBody += `⌚ *Time:* ${time}\n`;
            menuBody += `🧩 *Plugins:* ${commands.length}\n\n`;
            
            menuBody += `*⬇️ AVAILABLE COMMANDS ⬇️*\n`;
            commands.forEach((c, i) => {
                menuBody += `▸ *${prefix}${c.cmd}* ${c.desc ? ' - ' + c.desc : ''}\n`;
            });

            // 3. Prepare the Image Header
            const msgResponse = await prepareWAMessageMedia({ 
                image: { url: GITHUB_PF } 
            }, { upload: sock.waUploadToServer });

            // 4. Construct the Interactive Message (Buttons V2)
            const interactiveMessage = {
                body: { text: menuBody },
                footer: { text: "© Powered by Cosmic Hacker X" },
                header: {
                    title: "🚀 X BOT DASHBOARD",
                    subtitle: "Advanced WhatsApp System",
                    hasMediaAttachment: true,
                    imageMessage: msgResponse.imageMessage
                },
                nativeFlowMessage: {
                    buttons: [
                        {
                            // BUTTON 1: GitHub Link (Replaces Telegram)
                            name: "cta_url",
                            buttonParamsJson: JSON.stringify({
                                display_text: "🖇️ GitHub Profile",
                                url: GITHUB_LINK,
                                merchant_url: GITHUB_LINK
                            })
                        },
                        {
                            // BUTTON 2: Copy Owner Contact (Simulated Action)
                            name: "cta_copy",
                            buttonParamsJson: JSON.stringify({
                                display_text: "👤 Owner Number",
                                copy_code: config.OWNER_NUMBER || "923367307471"
                            })
                        },
                        {
                            // BUTTON 3: Quick Reply (Simulated List)
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "⚡ Ping Server",
                                id: `${prefix}ping`
                            })
                        }
                    ],
                    messageParamsJson: ""
                }
            };

            // 5. Generate and Send the Message
            let msg = generateWAMessageFromContent(m.key.remoteJid, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: interactiveMessage
                    }
                }
            }, { userJid: m.sender, quoted: m });

            // 6. Inject Context Info for "Blue Tick" / Forwarded look
            msg.message.viewOnceMessage.message.interactiveMessage.contextInfo = {
                mentionedJid: [m.sender],
                isForwarded: true, 
                forwardingScore: 999,
                businessMessageForwardInfo: { businessOwnerJid: sock.user.id }
            };

            await sock.relayMessage(m.key.remoteJid, msg.message, { messageId: msg.key.id });

        } catch (e) {
            console.error("Menu Error:", e);
            // Fallback to simple text if buttons fail
            await sock.sendMessage(m.key.remoteJid, { 
                text: "❌ *Menu Error:* Buttons failed to render. Use standard text commands." 
            });
        }
    }
};
