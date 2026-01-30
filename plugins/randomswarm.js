module.exports = {
    cmd: 'randomswarm',
    desc: 'Random swarm attack (Usage: .randomswarm number count)',
    run: async ({ sock, m, args, reply }) => {
        if (args.length < 2) return reply('❌ *.randomswarm 923367307471 50*');

        const baseNumber = args[0].replace(/[^0-9]/g, '');
        const count = Math.min(Math.max(parseInt(args[1]), 10), 100);

        await reply(`🐝 *Random Swarm*\nBase: ${baseNumber}\nTargets: ${count}`);

        const sleep = ms => new Promise(r => setTimeout(r, ms));
        const active = [];
        const checked = new Set();

        try {
            while (active.length < 15 && checked.size < count * 2) {
                const offset = Math.floor(Math.random() * 10000) - 5000;
                const testNum = (parseInt(baseNumber) + offset).toString();
                
                if (checked.has(testNum)) continue;
                checked.add(testNum);

                const result = await sock.onWhatsApp(testNum + '@s.whatsapp.net');
                if (result[0]?.exists) {
                    active.push(testNum);
                    if (active.length >= 15) break;
                }
                await sleep(80);
            }

            reply(active.length ? `🐝 *Swarm Results*\n${active.join('\n')}` : '❌ Swarm found nothing');
        } catch (e) {
            reply('❌ Swarm failed');
        }
    }
};
