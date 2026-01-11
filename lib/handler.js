const fs = require('fs');
const path = require('path');
const config = require('../config');

// Store
const commands = new Map();
const events = new Map(); // Stores background tasks
const pluginsDir = path.join(__dirname, '../plugins');

// Ensure plugins dir exists
if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);

/**
 * LOADER FUNCTION
 */
const loadPlugin = (file) => {
    try {
        const filePath = path.join(pluginsDir, file);
        
        // Clear Cache to force reload
        if (require.cache[filePath]) {
            delete require.cache[filePath];
        }

        const plugin = require(filePath);
        
        // 1. Load Command
        if (plugin.cmd && plugin.run) {
            commands.set(plugin.cmd, plugin);
            console.log(`✅ Loaded Command: ${plugin.cmd}`);
        }

        // 2. Load Event
        if (plugin.events) {
            events.set(file, plugin.events);
            console.log(`⚡ Loaded Event: ${file}`);
        }

    } catch (e) {
        console.error(`❌ Error loading ${file}:`, e.message);
    }
};

// Initial Load
fs.readdirSync(pluginsDir).forEach(file => {
    if (file.endsWith('.js')) loadPlugin(file);
});

// --- 🔥 SAFE HOT RELOAD WATCHER ---
// Waits 1 second after save to prevent crashes
let watchTimeout;

fs.watch(pluginsDir, (eventType, filename) => {
    if (filename && filename.endsWith('.js')) {
        if (watchTimeout) clearTimeout(watchTimeout);

        watchTimeout = setTimeout(() => {
            console.log(`🔄 Reloading: ${filename}...`);
            loadPlugin(filename);
        }, 1000); 
    }
});

// 3. The Handler
async function messageHandler(sock, m) {
    try {
        if (!m.message) return;
        
        // --- A. RUN BACKGROUND EVENTS ---
        for (const [fileName, eventFn] of events) {
            try {
                await eventFn(sock, m);
            } catch (err) {
                console.error(`Error in event ${fileName}:`, err);
            }
        }

        // --- B. COMMAND HANDLING ---
        const msg = m.message;
        const type = Object.keys(msg)[0];
        const body = (type === 'conversation') ? msg.conversation :
                     (type === 'extendedTextMessage') ? msg.extendedTextMessage.text :
                     (type === 'imageMessage') ? msg.imageMessage.caption : '';

        if (!body) return;

        const prefix = config.PREFIX;
        if (!body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

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
