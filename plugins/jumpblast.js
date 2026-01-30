module.exports = {
    cmd: 'jumpblast',
    desc: 'Jumps intervals to scan (Usage: .jumpblast number jump)',
    run: async ({ sock, m, args, reply }) => {
        if (args.length < 2) return reply('❌ *.jumpblast 923367307471 100*');

        const inputNumber = args[0].replace(/[^0-9]/g, '');
        const jump = Math.max(parseInt(args[1]), 10);
        const targetInt = parseInt(inputNumber);

        await reply(`➰ *Jump Scan*\nTarget: ${inputNumber}\nJump: ${jump}`);

        const sleep = ms => new Promise(r => setTimeout(r, ms));
        const active = [];

        try {
            // Fibonacci-like jumps
            let jumps = [1, 1];
            for (let i = 0; i < 15; i++) {
                jumps.push(jumps[i] + jumps[i+1]);
            }

            for (let j of jumps.slice(0, 12)) {
                // Up and down jumps
                const upJid = (targetInt + (j * jump)) + '@s.whatsapp.net';
                const downJid = (targetInt - (j * jump)) + '@s.whatsapp.net';
                
                const [upRes, downRes] = await Promise.all([
                    sock.onWhatsApp(upJid),
                    sock.onWhatsApp(downJid)
                ]);

                if (upRes[0]?.exists) active.push(upRes[0].jid.split('@')[0]);
                if (downRes[0]?.exists) active.push(downRes[0].jid.split('@')[0]);
                
                await sleep(120);
            }

            reply(active.length ? `🎯 *Jump Hits (${active.length})*\n${active.join('\n')}` : '❌ No jumps landed');
        } catch (e) {
            reply('❌ Jump scan error');
        }
    }
};
