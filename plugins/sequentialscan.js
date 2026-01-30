module.exports = {
    cmd: 'seqscan',
    desc: 'Sequential range scanner (Usage: .seqscan number range)',
    run: async ({ sock, m, args, reply }) => {
        if (args.length < 2) return reply('❌ *.seqscan 923367307471 50* (range 1-200)');

        const inputNumber = args[0].replace(/[^0-9]/g, '');
        const range = Math.min(Math.max(parseInt(args[1]), 1), 200);
        const targetInt = parseInt(inputNumber);

        await reply(`🔢 *Sequential Scan*\nTarget: ${inputNumber}\nRange: ±${range}`);

        const sleep = ms => new Promise(r => setTimeout(r, ms));
        const active = [];

        try {
            // Scan forward
            for (let i = 1; i <= range; i++) {
                const jid = (targetInt + i) + '@s.whatsapp.net';
                const result = await sock.onWhatsApp(jid);
                if (result[0]?.exists) active.push(result[0].jid.split('@')[0]);
                await sleep(100);
            }

            // Scan backward  
            for (let i = 1; i <= range; i++) {
                const jid = (targetInt - i) + '@s.whatsapp.net';
                const result = await sock.onWhatsApp(jid);
                if (result[0]?.exists) active.push(result[0].jid.split('@')[0]);
                await sleep(100);
            }

            const report = active.length ? 
                `✅ *FOUND ${active.length}*\n${active.slice(0,10).join('\n')}${active.length>10 ? `\n... +${active.length-10}` : ''}` :
                '❌ No active numbers in range';

            reply(report);
        } catch (e) {
            reply('❌ Scan failed: ' + e.message);
        }
    }
};
