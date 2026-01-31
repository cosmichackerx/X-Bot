// File: lib/handler.js
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Store commands and listeners
const commands = new Map();
const listeners = new Map();

// Define Plugins Directory
const pluginsDir = path.join(__dirname, '../plugins');
if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);

/**
 * 🔄 RECURSIVE PLUGIN LOADER
 * Scans all folders and subfolders for .js files
 */
const getAllFiles = (dirPath, arrayOfFiles) => {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            if (file.endsWith('.js')) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
};

/**
 * 🛠️ LOAD SINGLE PLUGIN
 */
const loadPlugin = (filePath) => {
    try {
        // Clear Cache
        if (require.cache[filePath]) delete require.cache[filePath];

        const plugin = require(filePath);
        const fileName = path.basename(filePath);

        // 1. Register Command
        if (plugin.cmd && plugin.run) {
            commands.set(plugin.cmd, plugin);
        }

        // 2. Register Background Listener
        if (plugin.listen) {
            listeners.set(fileName, plugin);
        }

    } catch (e) {
        console.error(`❌ Error loading ${path.basename(filePath)}:`, e.message);
    }
};

/**
 * 🚀 INITIALIZE ALL PLUGINS
 */
const loadAllPlugins = () => {
    // Clear existing maps to prevent duplicates on reload
    commands.clear();
    listeners.clear();
    
    const files = getAllFiles(pluginsDir);
    files.forEach(file => loadPlugin(file));
    console.log(`✅ Loaded ${commands.size} commands & ${listeners.size} listeners from ${files.length} files.`);
};

// Start Loading
loadAllPlugins();

/**
 * 🔄 HOT RELOAD WATCHER (Recursive)
 * Watches the main directory and reloads everything on change
 * to ensure new folders/files are picked up immediately.
 */
let reloadTimeout = null;
fs.watch(pluginsDir, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.js')) {
        // Debounce to prevent multiple reloads for one save
        if (reloadTimeout) clearTimeout(reloadTimeout);
        
        reloadTimeout = setTimeout(() => {
            console.log(`🔄 Detected change in: ${filename}. Reloading plugins...`);
            loadAllPlugins();
        }, 500); // 500ms delay buffer
    }
});

/**
 * ⚡ MAIN MESSAGE HANDLER
 */
async function messageHandler(sock, m) {
    try {
        const msg = m.message;
        if (!msg) return;

        // 1. Efficient Message Parsing
        const from = m.key.remoteJid;
        const type = Object.keys(msg)[0];
        
        // Extract Body (Text) efficiently
        const body = (type === 'conversation') ? msg.conversation :
                     (type === 'extendedTextMessage') ? msg.extendedTextMessage.text :
                     (type === 'imageMessage') ? msg.imageMessage.caption :
                     (type === 'videoMessage') ? msg.videoMessage.caption : '';

        // =======================================================
        // 2. FAST LISTENER EXECUTION (Parallel)
        // =======================================================
        // We use Promise.allSettled to run all listeners at once 
        // without waiting for one to finish before starting the next.
        if (listeners.size > 0) {
            const listenerPromises = [];
            for (const [name, plugin] of listeners) {
                listenerPromises.push(plugin.listen({ sock, m, msg, from, body }));
            }
            // Fire and forget (don't await listeners unless critical)
            Promise.allSettled(listenerPromises); 
        }

        // =======================================================
        // 3. COMMAND EXECUTION
        // =======================================================
        if (!body || !body.startsWith(config.PREFIX)) return;

        // Clean text parsing
        const args = body.slice(config.PREFIX.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        if (commands.has(commandName)) {
            const plugin = commands.get(commandName);
            
            // Execute Command
            await plugin.run({
                sock,
                m,
                args,
                from,
                // Helper: Smart Reply
                reply: (text) => sock.sendMessage(from, { text: text }, { quoted: m })
            });
        }

    } catch (e) {
        console.error("Handler Fatal Error:", e);
    }
}

module.exports = { messageHandler };
