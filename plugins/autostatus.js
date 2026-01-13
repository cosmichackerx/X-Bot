module.exports = {
    // Universal Listener for Status Updates
    listen: async ({ sock, m, from }) => {
        // Check if message is a Broadcast (Status Update)
        if (from === 'status@broadcast') {
            
            // 1. Auto View (Mark as Read)
            // specific key for the read receipt
            const key = {
                remoteJid: from,
                id: m.key.id,
                participant: m.key.participant 
            };
            
            await sock.readMessages([key]);

            // 2. Dynamic Reacts (Random Emoji)
            const emojis = ['💚', '🔥', '✨', '⚡', '😂', '👀', '🚀'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

            // React to the status
            // We use a try-catch to prevent crashes if reaction fails
            try {
                await sock.sendMessage(from, {
                    react: {
                        text: randomEmoji,
                        key: m.key
                    }
                }, { statusJidList: [m.key.participant] });
            } catch (e) {
                // Silent fail for reactions
            }

            // 3. Safe Logging (Fixed the crash here)
            // We check if participant exists before splitting
            const user = m.pushName || (m.key.participant ? m.key.participant.split('@')[0] : "Anonymous");
            console.log(`👁️ Auto Viewed Status from: ${user}`);
        }
    }
};
