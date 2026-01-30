module.exports = {
    cmd: 'gridscan',
    desc: 'Grid-based scanner (Usage: .gridscan number gridsize)',
    run: async ({ sock, m, args, reply }) => {
        if (args.length < 2) return reply('❌ *.gridscan 923367307471 25*');

        const base = parseInt(args[0].replace(/[^0-9]/g, ''));
        const gridSize = Math.max(parseInt(args[1]), 10);

        await reply(`📐 *Grid Scan*\nBase: ${base}\nGrid: ${gridSize}x${gridSize}`);

        const sleep = ms => new Promise(r => setTimeout(r, ms));
        const active = [];

        try {
            // Create grid pattern
            for (let x = 0; x < gridSize && active.length < 20; x++) {
                for (let y = 0; y < gridSize && active.length < 20; y++) {
                    const offsetX = (x - gridSize/2) * 100;
                    const offsetY = (y - gridSize/2) * 10;
                    const testNum = (base + offsetX + offsetY).toString();
                    
                    const result = await sock.onWhatsApp(testNum + '@s.whatsapp.net');
                    if (result[0]?.exists) active.push(testNum);
                    await sleep(90);
                }
            }

            reply(active.length ? `🟦 *Grid Hits (${active.length})*\n${active.slice(0,15).join('\n')}` : '❌ Empty grid');
        } catch (e) {
            reply('❌ Grid scan error');
        }
    }
};
