module.exports = {
    cmd: 'profile',
    desc: 'Get profile info (Tag, Reply, or Number)',
    run: async ({ sock, m, args }) => {
        let targetJid;

        try {
            // 1. Determine Target
            if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                // Case 1: Mention (@user)
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.message.extendedTextMessage?.contextInfo?.participant) {
                // Case 2: Reply to a message
                targetJid = m.message.extendedTextMessage.contextInfo.participant;
            } else if (args.length > 0) {
                // Case 3: Typed number (Fix: Join all args to handle spaces)
                const number = args.join('').replace(/[^0-9]/g, '');
                targetJid = number + '@s.whatsapp.net';
            } else {
                // Case 4: Self
                targetJid = m.key.participant || m.key.remoteJid;
            }

            // 2. Fetch Profile Picture
            let ppUrl;
            try {
                ppUrl = await sock.profilePictureUrl(targetJid, 'image');
            } catch (e) {
                // Fallback if no PP or privacy restricted
                ppUrl = 'https://i.pinimg.com/736x/2a/2c/1d/2a2c1d90075390b22e7e6060254dab0d.jpg';
            }

            // 3. Fetch Status/About (With strict error handling)
            let status = 'Private / Unknown';
            try {
                const statusData = await sock.fetchStatus(targetJid);
                if (statusData && statusData.status) {
                    status = statusData.status;
                }
            } catch (e) {
                // If this fails, it usually means privacy settings are on "Nobody"
                status = '🔒 (Private)';
            }

            // 4. Check if registered
            let onWa = 'Unknown';
            try {
                const contact = await sock.onWhatsApp(targetJid);
                if (contact && contact[0]) {
                    onWa = contact[0].exists ? 'Yes' : 'No';
                }
            } catch (e) {}

            const caption = `👤 *USER PROFILE*\n\n` +
                            `🏷️ *Number:* ${targetJid.split('@')[0]}\n` +
                            `📝 *About:* ${status}\n` +
                            `✅ *On WhatsApp:* ${onWa}`;

            // Send
            await sock.sendMessage(m.key.remoteJid, {
                image: { url: ppUrl },
                caption: caption
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(m.key.remoteJid, { text: '❌ Error: ' + e.message }, { quoted: m });
        }
    }
};
