module.exports = {
    cmd: 'patternhunt',
    desc: 'Scans common patterns (Usage: .patternhunt prefix)',
    run: async ({ sock, m, args, reply }) => {
        if (!args[0]) return reply('❌ *.patternhunt 92336* (scans 92336000-92336999)');

        const prefix = args[0].replace(/[^0-9]/g, '');
        if (prefix.length < 5) return reply('❌ Prefix needs 5+ digits');

        await reply(`🎯 *Pattern Hunt*\nScanning ${prefix}000 - ${prefix}999`);

        const sleep = ms => new Promise(r => setTimeout(r, ms));
        const active = [];
        const patterns = [111, 123, 777, 999, 000];

        try {
            for (let pat of patterns) {
                for (let i = 0; i < 10; i++) {
                    const num = prefix + String(pat).padStart(3, '0');
                    const jid = num + '@s.whatsapp.net';
                    const result = await sock.onWhatsApp(jid);
                    if (result[0]?.exists) active.push(num);
                    await sleep(120);
                }
            }

            reply(active.length ? `🔍 *Pattern Hits (${active.length})*\n${active.join('\n')}` : '❌ No pattern matches');
        } catch (e) {
            reply('❌ Pattern scan error: ' + e.message);
        }
    }
};
