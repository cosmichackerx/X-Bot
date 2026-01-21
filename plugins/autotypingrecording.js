module.exports = {
    // Listen to every incoming message
    listen: async ({ sock, m, from }) => {
        // 1. Safety Checks
        // Don't run on Status Updates or your own messages (to prevent loops)
        if (from === 'status@broadcast' || m.key.fromMe) return;

        // 2. Random Strategy Generator
        // We randomly pick one of 4 behaviors to mimic human indecision
        const strategies = [
            'type_only',    // Just types
            'record_only',  // Just records
            'type_record',  // Types, deletes, then records
            'record_type'   // Records, cancels, then types
        ];
        
        const strategy = strategies[Math.floor(Math.random() * strategies.length)];

        // Helper: Random wait time (2 to 5 seconds)
        const getRandomDuration = () => Math.floor(Math.random() * 3000) + 2000;
        const delay = (ms) => new Promise(res => setTimeout(res, ms));

        try {
            switch (strategy) {
                case 'type_only':
                    await sock.sendPresenceUpdate('composing', from);
                    await delay(getRandomDuration());
                    await sock.sendPresenceUpdate('paused', from);
                    break;

                case 'record_only':
                    await sock.sendPresenceUpdate('recording', from);
                    await delay(getRandomDuration());
                    await sock.sendPresenceUpdate('paused', from);
                    break;

                case 'type_record':
                    // Simulate: Started typing, changed mind, started recording
                    await sock.sendPresenceUpdate('composing', from);
                    await delay(2000); 
                    await sock.sendPresenceUpdate('paused', from);
                    await delay(500); // Small hesitation
                    await sock.sendPresenceUpdate('recording', from);
                    await delay(getRandomDuration());
                    await sock.sendPresenceUpdate('paused', from);
                    break;

                case 'record_type':
                    // Simulate: Started recording, changed mind, started typing
                    await sock.sendPresenceUpdate('recording', from);
                    await delay(2000);
                    await sock.sendPresenceUpdate('paused', from);
                    await delay(500); // Small hesitation
                    await sock.sendPresenceUpdate('composing', from);
                    await delay(getRandomDuration());
                    await sock.sendPresenceUpdate('paused', from);
                    break;
            }
        } catch (e) {
            // Ignore errors (connection closed, etc.)
        }
    }
};
