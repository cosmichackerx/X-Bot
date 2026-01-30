module.exports = {
    cmd: 'spamflood',
    desc: 'Floods with mixed message types (Usage: .spamflood text | count)',
    run: async ({ sock, m, args, reply }) => {
        const fullText = args.join(' ');
        if (!fullText.includes('|')) {
            return reply('❌ Format: *.spamflood message | count*\nExample: *.spamflood TEST | 50*');
        }

        const [message, countStr] = fullText.split('|');
        const count = parseInt(countStr.trim());
        const msg = message.trim();

        if (isNaN(count) || count <= 0 || count > 80) {
            return reply('❌ Count must be 1-80');
        }
        if (!msg) return reply('❌ Provide message');

        const remoteJid = m.chat || m.key.remoteJid;
        await reply(`💥 *Spam Flood Starting...*\n"${msg}" x${count}`);

        const sleep = (ms) => new Promise(r => setTimeout(r, ms));
        const types = [{text: msg}, {text: msg.toUpperCase()}, {text: msg.repeat(2)}];

        try {
            for (let i = 0; i < count; i++) {
                await sock.sendMessage(remoteJid, types[i % 3]);
                await sleep(400 + Math.random() * 200);
            }
        } catch (e) {
            reply('❌ Flood error: ' + e.message);
        }
    }
};
