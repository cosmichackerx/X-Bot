const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    cmd: 'send',
    desc: 'Save Status or Convert ViewOnce to Normal Media',
    run: async ({ sock, m, reply }) => {
        try {
            // 1. Check if replying to something
            const quotedContext = m.message.extendedTextMessage?.contextInfo;
            const quotedMsg = quotedContext?.quotedMessage;
            
            if (!quotedMsg) return reply('❌ Please reply to a Status or a ViewOnce message.');

            // 2. Determine Message Type & Content
            // We need to handle:
            // - Normal Status (Image/Video)
            // - Text Status
            // - ViewOnce (Image/Video/Audio) - These are wrapped inside 'viewOnceMessage'
            
            let targetMsg = quotedMsg;
            let type = Object.keys(quotedMsg)[0];
            let isViewOnce = false;

            // Unwrap ViewOnce messages (V1 and V2)
            if (type === 'viewOnceMessage' || type === 'viewOnceMessageV2') {
                isViewOnce = true;
                // The actual content is inside the viewOnce wrapper
                const innerMsg = quotedMsg[type].message;
                type = Object.keys(innerMsg)[0];
                targetMsg = innerMsg;
            }

            // 3. Process Content Based on Type
            let buffer;
            let stream;
            
            // --- IMAGE ---
            if (type === 'imageMessage') {
                stream = await downloadContentFromMessage(targetMsg.imageMessage, 'image');
                buffer = await streamToBuffer(stream);
                
                await sock.sendMessage(m.key.remoteJid, { 
                    image: buffer, 
                    caption: isViewOnce ? '🔓 *ViewOnce Unlocked*' : '✅ *Status Saved*' 
                }, { quoted: m });

            // --- VIDEO ---
            } else if (type === 'videoMessage') {
                stream = await downloadContentFromMessage(targetMsg.videoMessage, 'video');
                buffer = await streamToBuffer(stream);
                
                await sock.sendMessage(m.key.remoteJid, { 
                    video: buffer, 
                    caption: isViewOnce ? '🔓 *ViewOnce Unlocked*' : '✅ *Status Saved*' 
                }, { quoted: m });

            // --- AUDIO / VOICE NOTE ---
            } else if (type === 'audioMessage') {
                stream = await downloadContentFromMessage(targetMsg.audioMessage, 'audio');
                buffer = await streamToBuffer(stream);
                
                await sock.sendMessage(m.key.remoteJid, { 
                    audio: buffer, 
                    mimetype: 'audio/mp4', 
                    ptt: true // Send as Voice Note
                }, { quoted: m });

            // --- TEXT STATUS ---
            } else if (type === 'extendedTextMessage' || type === 'conversation') {
                const text = targetMsg.extendedTextMessage?.text || targetMsg.conversation;
                await reply(`📝 *Status Text:*\n\n${text}`);

            } else {
                return reply(`❌ Unsupported message type: ${type}`);
            }

        } catch (e) {
            console.error("Sender Error:", e);
            reply('❌ Error fetching media. It might be too old or deleted.');
        }
    }
};

// Helper: Convert download stream to buffer
async function streamToBuffer(stream) {
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}
