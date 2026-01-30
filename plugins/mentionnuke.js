module.exports = {
    cmd: 'mentionnuke',
    desc: 'Mass @mention blast (Usage: .mentionnuke text | count)',
    run: async ({ sock, m, args, reply }) => {
        const fullText = args.join(' ');
        if (!fullText.includes('|')) {
            return reply('❌ *.mentionnuke message | count*');
        }

        const [message, countStr] = fullText.split('|');
        const count = parseInt(countStr.trim());
        const msg = message.trim();

        if (isNaN(count) || count <= 0 || count > 60) {
            return reply('❌ 1-60 mentions only');
        }

        const remoteJid = m.chat || m.key.remoteJid;
        await reply(`📢 *Mention Nuke x${count}* "${msg}"`);

        const sleep = (ms) => new Promise(r => setTimeout(r, ms));

        try {
            for (let i = 0; i < count; i++) {
                const mentions = [`@${sock.user.id.split('@')[0]}`, `@everyone`];
                await sock.sendMessage(remoteJid, { 
                    text: `@everyone ${msg} #${i+1}`, 
                    mentions 
                });
                await sleep(600 + Math.random() * 300);
            }
        } catch (e) {
            reply('❌ Mention error: ' + e.message);
        }
    }
};
