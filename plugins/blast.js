module.exports = {
    cmd: 'blast',
    desc: 'Repeats a message X times (Usage: .blast text | count)',
    run: async ({ sock, m, args, reply }) => {
        
        // 1. Validate Input
        const fullText = args.join(' ');
        
        if (!fullText.includes('|')) {
            return reply('❌ Format Error.\nUse: *.blast message | count*\nExample: *.blast Hello World | 10*');
        }

        const [message, countStr] = fullText.split('|');
        const count = parseInt(countStr.trim());
        const msgToSend = message.trim();

        // 2. Safety Checks
        if (isNaN(count) || count <= 0) {
            return reply('❌ Invalid count number.');
        }

        if (count > 100) {
            return reply('⚠️ Limit Exceeded. Max blast count is 100 to prevent bans.');
        }

        if (!msgToSend) {
            return reply('❌ Please provide a message to blast.');
        }

        // 3. Get the correct Chat ID (The Fix)
        // We check both m.chat and m.key.remoteJid to be safe
        const remoteJid = m.chat || m.key.remoteJid;

        await reply(`🚀 *Initiating Blast...*\nMessage: "${msgToSend}"\nCount: ${count}`);

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        try {
            for (let i = 0; i < count; i++) {
                // We use remoteJid here instead of m.chat
                await sock.sendMessage(remoteJid, { text: msgToSend });
                
                // 500ms delay - Keep this to avoid bans
                await sleep(500); 
            }

        } catch (e) {
            console.error(e);
            reply('❌ Error during blast: ' + e.message);
        }
    }
};
