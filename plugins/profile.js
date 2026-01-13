const { getContentType } = require('@whiskeysockets/baileys');

module.exports = {
    cmd: 'profile',
    desc: 'Get profile info (Tag, Reply, or Number)',
    run: async ({ sock, m, args }) => {
        let targetJid;

        // 1. Determine Target
        if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (m.message.extendedTextMessage?.contextInfo?.participant) {
            targetJid = m.message.extendedTextMessage.contextInfo.participant;
        } else if (args.length > 0) {
            // Remove spaces, dashes, parentheses
            targetJid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        } else {
            targetJid = m.key.remoteJid; // Self
        }

        // 2. Fetch Data
        try {
            // Profile Picture
            let ppUrl;
            try {
                ppUrl = await sock.profilePictureUrl(targetJid, 'image');
            } catch {
                ppUrl = 'https://i.pinimg.com/736x/2a/2c/1d/2a2c1d90075390b22e7e6060254dab0d.jpg'; // Fallback image
            }

            // Status (About)
            let status = 'Unknown';
            try {
                const statusData = await sock.fetchStatus(targetJid);
                status = statusData.status || 'None';
            } catch {}

            // Business Profile?
            // Note: This often requires the contact to be in your device, but we can try generic detection
            const contact = await sock.onWhatsApp(targetJid);
            const exists = contact && contact[0] && contact[0].exists;

            const caption = `👤 *USER PROFILE*\n\n` +
                            `🏷️ *JID:* ${targetJid}\n` +
                            `📝 *About:* ${status}\n` +
                            `✅ *On WhatsApp:* ${exists ? 'Yes' : 'No'}`;

            // Send
            await sock.sendMessage(m.key.remoteJid, {
                image: { url: ppUrl },
                caption: caption
            }, { quoted: m });

        } catch (e) {
            await sock.sendMessage(m.key.remoteJid, { text: '❌ Could not fetch profile. ' + e.message }, { quoted: m });
        }
    }
};
