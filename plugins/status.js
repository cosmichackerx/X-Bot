const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    cmd: 'status',
    desc: 'Reply to a status to save it',
    run: async ({ sock, m, reply }) => {
        // Check if replying to a status
        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quoted) return reply('❌ Please reply to a WhatsApp Status to save it.');

        try {
            // Detect media type
            const type = Object.keys(quoted)[0];
            let mediaStream;
            let extension = '';

            if (type === 'imageMessage') {
                mediaStream = await downloadContentFromMessage(quoted.imageMessage, 'image');
                extension = 'jpg';
            } else if (type === 'videoMessage') {
                mediaStream = await downloadContentFromMessage(quoted.videoMessage, 'video');
                extension = 'mp4';
            } else {
                return reply('❌ Only Images and Videos can be saved.');
            }

            // Convert stream to buffer
            let buffer = Buffer.from([]);
            for await (const chunk of mediaStream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // Send back to user
            if (type === 'imageMessage') {
                await sock.sendMessage(m.key.remoteJid, { image: buffer, caption: '✅ Status Saved' }, { quoted: m });
            } else {
                await sock.sendMessage(m.key.remoteJid, { video: buffer, caption: '✅ Status Saved' }, { quoted: m });
            }

        } catch (e) {
            console.error(e);
            reply('❌ Error downloading status.');
        }
    }
};
