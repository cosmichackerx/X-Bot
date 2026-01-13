module.exports = {
    // This plugin has NO 'cmd'. It uses 'listen' to run on every message.
    listen: async ({ sock, m, msg, from }) => {
        
        // Check if message is a Broadcast (Status Update)
        if (from === 'status@broadcast') {
            
            // 1. Auto View (Mark as Read)
            // We create a specific key for the read receipt
            const key = {
                remoteJid: from,
                id: m.key.id,
                participant: m.key.participant // The user who posted the status
            };
            
            await sock.readMessages([key]);

            // 2. Dynamic Reacts (Random Emoji)
            const emojis = ['💚', '🔥', '✨', '⚡', '😂', '👀', '🚀'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

            await sock.sendMessage(from, {
                react: {
                    text: randomEmoji,
                    key: m.key
                }
            }, { statusJidList: [m.key.participant] });

            console.log(`👁️ Auto Viewed Status from: ${m.pushName || m.key.participant.split('@')[0]}`);
        }
    }
};
