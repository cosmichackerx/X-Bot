const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// --- CONFIGURATION ---
const CONFIG = {
    AUTO_VIEW: true,
    AUTO_REACT: true,
    
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
        try {
            // Check if it's a status update
            if (m.key.remoteJid === 'status@broadcast' && !m.key.fromMe) {
                
                // CRITICAL: Get the sender's JID (participant)
                const participant = m.key.participant || m.participant;

                // 1. Auto View (Force strict key structure)
                if (CONFIG.AUTO_VIEW) {
                    await sock.readMessages([{ 
                        remoteJid: 'status@broadcast', 
                        id: m.key.id, 
                        participant: participant // <--- THIS IS KEY!
                    }]);
                    
                    console.log(`👁️ Auto-Viewed Status from: ${m.pushName || participant.split('@')[0]}`);
                }

                // 2. Auto React
                if (CONFIG.AUTO_REACT) {
                    const randomEmoji = CONFIG.REACT_EMOJIS[Math.floor(Math.random() * CONFIG.REACT_EMOJIS.length)];
                    
                    await sock.sendMessage('status@broadcast', {
                        react: {
                            text: randomEmoji,
                            key: m.key // React to the specific status key
                        }
                    }, { statusJidList: [participant] }); // Ensure it routes to the user
                }
            }
        } catch (err) {
            console.error("Error in AutoStatus Event:", err);
        }
    }
};
