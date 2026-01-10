const fs = require('fs');
const path = require('path');
const config = require('../config');

/**
 * Dynamic Command Handler
 * Supports Hot-Reloading: Edits in 'plugins' apply instantly.
 */
async function messageHandler(sock, m) {
    try {
        const msg = m.message;
        const type = Object.keys(msg)[0];
        const body = (type === 'conversation') ? msg.conversation :
                     (type === 'extendedTextMessage') ? msg.extendedTextMessage.text :
                     (type === 'imageMessage') ? msg.imageMessage.caption : '';

        if (!body) return;

        // 1. Check Prefix
        const prefix = config.PREFIX || '.';
        if (!body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        // 2. Locate Plugin File
        const pluginsDir = path.join(__dirname, '../plugins');
        if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);

        // We search for a file that matches the command name (e.g., "ping.js")
        const pluginFile = path.join(pluginsDir, `${commandName}.js`);

        if (fs.existsSync(pluginFile)) {
            // --- HOT RELOAD MECHANISM ---
            // Delete the file from Node's cache so we get the fresh version
            delete require.cache[require.resolve(pluginFile)];
            
            // Require the fresh file
            const plugin = require(pluginFile);
            
            // Execute
            console.log(`🚀 Executing command: ${commandName}`);
            await plugin.run({
                sock,
                m,
                args,
                text: args.join(' '),
                from: m.key.remoteJid,
                reply: (text) => sock.sendMessage(m.key.remoteJid, { text: text }, { quoted: m })
            });
        }
    } catch (e) {
        console.error("Handler Error:", e);
    }
}

module.exports = { messageHandler };
