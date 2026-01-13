// File: lib/handler.js
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Command Store
const commands = new Map();
// Listener Store (for Auto Status, etc.)
const listeners = new Map();

const pluginsDir = path.join(__dirname, '../plugins');
if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);

/**
 * LOADER FUNCTION
 */
const loadPlugin = (file) => {
    try {
        const filePath = path.join(pluginsDir, file);
        if (require.cache[filePath]) delete require.cache[filePath];
        
        const plugin = require(filePath);
        
        // 1. Register Command
        if (plugin.cmd && plugin.run) {
            commands.set(plugin.cmd, plugin);
        }

        // 2. Register Background Listener (New Feature)
        if (plugin.listen) {
            listeners.set(file, plugin);
        }

        console.log(`✅ Loaded: ${file}`);
    } catch (e) {
        console.error(`❌ Error loading ${file}:`, e.message);
    }
};

// Initial Load & Watcher
fs.readdirSync(pluginsDir).forEach(file => { if (file.endsWith('.js')) loadPlugin(file); });
fs.watch(pluginsDir, (eventType, filename) => {
    if (filename && filename.endsWith('.js')) {
        console.log(`🔄 Reloading: ${filename}`);
        loadPlugin(filename);
    }
});

// MAIN HANDLER
async function messageHandler(sock, m) {
    try {
        const msg = m.message;
        if (!msg) return;

        const from = m.key.remoteJid;
        const type = Object.keys(msg)[0];
        const body = (type === 'conversation') ? msg.conversation :
                     (type === 'extendedTextMessage') ? msg.extendedTextMessage.text :
                     (type === 'imageMessage') ? msg.imageMessage.caption : '';

        // =======================================================
        // 1. RUN BACKGROUND LISTENERS (Auto Status, etc.)
        // =======================================================
        for (const [name, plugin] of listeners) {
            // Plugins can return false to stop execution if needed
            await plugin.listen({ sock, m, msg, from, body });
        }

        // =======================================================
        // 2. RUN COMMANDS
        // =======================================================
        if (!body || !body.startsWith(config.PREFIX)) return;

        const args = body.slice(config.PREFIX.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        if (commands.has(commandName)) {
            const plugin = commands.get(commandName);
            await plugin.run({
                sock,
                m,
                args,
                from,
                reply: (text) => sock.sendMessage(from, { text: text }, { quoted: m })
            });
        }

    } catch (e) {
        console.error("Handler Error:", e);
    }
}

module.exports = { messageHandler };
