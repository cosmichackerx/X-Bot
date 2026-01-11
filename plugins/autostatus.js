const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// --- CONFIGURATION ---
const CONFIG = {
    AUTO_VIEW: true,           // Set to false to disable auto-read
    AUTO_REACT: true,          // Set to false to disable auto-react
    
    // Add as many emojis as you want here
    REACT_EMOJIS: ['💚', '🔥', '😂', '😍', '👍', '😎', '💯', '🥵', '👋', '🤖', '⚡'] 
};

module.exports = {
    // 1. COMMAND: .sendme (To download status)
    cmd: 'sendme',
    
    run: async ({ sock, m, reply }) => {
        const quotedContext = m.message?.extendedTextMessage?.contextInfo;
        
        // Ensure reply is to a Status
        if (!quotedContext || quotedContext.remoteJid !== 'status@broadcast') {
            return reply("❌ Please reply to a WhatsApp Status (Image/Video) with .sendme");
        }

        const quotedMsg = quotedContext.quotedMessage;
        if (!quotedMsg) return reply("❌ Error: Could not fetch original status message.");

        try {
            let buffer, type, mimetype;

            if (quotedMsg.imageMessage) {
                type = 'image';
                mimetype = 'image/jpeg';
                const stream = await downloadContentFromMessage(quotedMsg.imageMessage, 'image');
                let bufferArray = [];
                for await (const chunk of stream) bufferArray.push(chunk);
                buffer = Buffer.concat(bufferArray);
            } else if (quotedMsg.videoMessage) {
                type = 'video';
                mimetype = 'video/mp4';
                const stream = await downloadContentFromMessage(quotedMsg.videoMessage, 'video');
                let bufferArray = [];
                for await (const chunk of stream) bufferArray.push(chunk);
                buffer = Buffer.concat(bufferArray);
            } else {
                return reply("❌ Only Images and Videos are supported.");
            }

            // Send to private chat
            await sock.sendMessage(m.key.remoteJid, {
                [type]: buffer,
                caption: "🤖 Status Saved!",
                mimetype: mimetype
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            reply("❌ Failed to download status.");
        }
    },

    // 2. BACKGROUND EVENT: Auto View & Random React
    events: async (sock, m) => {
        if (m.key.remoteJid === 'status@broadcast' && !m.key.fromMe) {
            
            // Auto View
            if (CONFIG.AUTO_VIEW) {
                await sock.readMessages([m.key]);
                console.log(`👁️ Auto-Viewed Status from ${m.pushName || 'Unknown'}`);
            }

            // Auto React (Randomly)
            if (CONFIG.AUTO_REACT) {
                const randomEmoji = CONFIG.REACT_EMOJIS[Math.floor(Math.random() * CONFIG.REACT_EMOJIS.length)];
                
                await sock.sendMessage(m.key.remoteJid, {
                    react: { text: randomEmoji, key: m.key }
                });
            }
        }
    }
};
