const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// Global cache to temporarily store messages
// This is necessary because once a message is deleted, its content is removed from the server.
const msgCache = new Map();

module.exports = {
    // This plugin uses the 'listen' event to monitor all incoming traffic
    listen: async ({ sock, m, from }) => {
        try {
            const msg = m.message;
            if (!msg) return;

            // ============================================================
            // PART 1: CACHE INCOMING MESSAGES
            // ============================================================
            // If it's NOT a protocol message (like a status update or delete request), save it.
            if (!msg.protocolMessage) {
                const msgId = m.key.id;
                msgCache.set(msgId, m);
                
                // Auto-clear cache after 10 minutes to save RAM
                setTimeout(() => {
                    msgCache.delete(msgId);
                }, 10 * 60 * 1000); 
                return;
            }

            // ============================================================
            // PART 2: DETECT DELETED MESSAGES
            // ============================================================
            // type === 0 indicates a REVOKE (Delete for Everyone) action
            if (msg.protocolMessage && msg.protocolMessage.type === 0) {
                const deletedKey = msg.protocolMessage.key;
                const deletedId = deletedKey.id;
                
                // Check if we have the original message in our secret cache
                if (msgCache.has(deletedId)) {
                    const originalMsg = msgCache.get(deletedId);
                    
                    // Identify the sender
                    const senderJid = originalMsg.key.participant || originalMsg.key.remoteJid;
                    const senderName = originalMsg.pushName || "Unknown User";
                    const chatSource = from.endsWith('@g.us') ? "Group Chat" : "Private Chat";

                    // Determine Owner's JID (Send to yourself)
                    // sock.user.id is usually "12345:5@s.whatsapp.net", we need just the number part
                    const ownerJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

                    // Build the Report Caption
                    const caption = `🗑️ *ANTIDELETE RECOVERY*\n` +
                                    `---------------------------\n` +
                                    `👤 *Who:* ${senderName}\n` +
                                    `📱 *Number:* +${senderJid.split('@')[0]}\n` +
                                    `📍 *Source:* ${chatSource}\n` +
                                    `🕒 *Time:* ${new Date().toLocaleTimeString()}\n` +
                                    `---------------------------`;

                    // RECOVER & SEND BASED ON TYPE
                    const messageContent = originalMsg.message;
                    const type = Object.keys(messageContent)[0];

                    // 1. Text Message
                    if (type === 'conversation' || type === 'extendedTextMessage') {
                        const text = messageContent.conversation || messageContent.extendedTextMessage.text;
                        await sock.sendMessage(ownerJid, { text: `${caption}\n\n📝 *Deleted Text:* ${text}` });
                    }
                    
                    // 2. Image
                    else if (type === 'imageMessage') {
                        const stream = await downloadContentFromMessage(messageContent.imageMessage, 'image');
                        const buffer = await streamToBuffer(stream);
                        await sock.sendMessage(ownerJid, { image: buffer, caption: caption });
                    }
                    
                    // 3. Video
                    else if (type === 'videoMessage') {
                        const stream = await downloadContentFromMessage(messageContent.videoMessage, 'video');
                        const buffer = await streamToBuffer(stream);
                        await sock.sendMessage(ownerJid, { video: buffer, caption: caption });
                    }

                    // 4. Voice Note / Audio
                    else if (type === 'audioMessage') {
                        const stream = await downloadContentFromMessage(messageContent.audioMessage, 'audio');
                        const buffer = await streamToBuffer(stream);
                        // Send info first, then audio
                        await sock.sendMessage(ownerJid, { text: caption + "\n(Voice Note Below)" });
                        await sock.sendMessage(ownerJid, { audio: buffer, mimetype: 'audio/mp4', ptt: true });
                    }

                    // 5. Sticker
                    else if (type === 'stickerMessage') {
                        const stream = await downloadContentFromMessage(messageContent.stickerMessage, 'sticker');
                        const buffer = await streamToBuffer(stream);
                        await sock.sendMessage(ownerJid, { text: caption + "\n(Sticker Below)" });
                        await sock.sendMessage(ownerJid, { sticker: buffer });
                    }
                }
            }
        } catch (e) {
            console.error("Antidelete Error:", e.message);
        }
    }
};

// Helper function to process media streams
async function streamToBuffer(stream) {
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}
