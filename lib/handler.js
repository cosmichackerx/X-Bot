const fs = require('fs');
const path = require('path');
const config = require('../config');

// Command Store
const commands = new Map();
const pluginsDir = path.join(__dirname, '../plugins');

// Ensure plugins dir exists
if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);

/**
 * LOADER FUNCTION
 * Clears cache and re-requires the file
 */
const loadPlugin = (file) => {
    try {
        const filePath = path.join(pluginsDir, file);
        
        // delete from node cache if exists
        if (require.cache[filePath]) {
            delete require.cache[filePath];
        }

        const plugin = require(filePath);
        
        if (plugin.cmd && plugin.run) {
            commands.set(plugin.cmd, plugin);
            console.log(`✅ Loaded/Reloaded: ${plugin.cmd}`);
        }
    } catch (e) {
        console.error(`❌ Error loading ${file}:`, e.message);
    }
};

// 1. Initial Load
fs.readdirSync(pluginsDir).forEach(file => {
    if (file.endsWith('.js')) loadPlugin(file);
});

// 2. HOT RELOAD WATCHER
// This watches the folder for ANY changes (add, edit, delete)
fs.watch(pluginsDir, (eventType, filename) => {
    if (filename && filename.endsWith('.js')) {
        console.log(`🔄 Detected change in: ${filename}`);
        loadPlugin(filename);
    }
});

// 3. The Handler
async function messageHandler(sock, m) {
    try {
        const msg = m.message;
        const type = Object.keys(msg)[0];
        const body = (type === 'conversation') ? msg.conversation :
                     (type === 'extendedTextMessage') ? msg.extendedTextMessage.text :
                     (type === 'imageMessage') ? msg.imageMessage.caption : '';

        if (!body) return;

        // Prefix Check
        const prefix = config.PREFIX;
        if (!body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        // Check Command Map
        if (commands.has(commandName)) {
            const plugin = commands.get(commandName);
            
            await plugin.run({
                sock,
                m,
                args,
                from: m.key.remoteJid,
                reply: (text) => sock.sendMessage(m.key.remoteJid, { text: text }, { quoted: m })
            });
        }
    } catch (e) {
        console.error("Handler Error:", e);
    }
}

module.exports = { messageHandler };
