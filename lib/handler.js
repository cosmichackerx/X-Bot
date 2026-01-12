/**
 * lib/handler.js
 * Purpose: Load plugins and route messages
 * Status: FIXED & UPGRADED (Supports Regex & standard plugins)
 */

const fs = require('fs');
const path = require('path');
const config = require('../config');

// Plugin Store
// We store plugins in a simple array to support Regex iteration
const plugins = new Map(); 

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
        
        // Store the plugin using the filename as key
        plugins.set(file, plugin);
        
        if (plugin.command || plugin.cmd) {
            console.log(`✅ Loaded Plugin: ${file}`);
        }
        if (plugin.events) {
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

// Helper: Extract text from various message types
function getMessageText(m) {
    if (!m.message) return '';
    const type = Object.keys(m.message)[0];
    const msg = m.message[type];
    
    if (type === 'conversation') return msg;
    if (type === 'extendedTextMessage') return msg.text;
    if (type === 'imageMessage') return msg.caption;
    if (type === 'videoMessage') return msg.caption;
    return '';
}

// 3. The Handler
async function messageHandler(sock, m) {
    try {
        if (!m.message) return;
        
        const body = getMessageText(m);
        const prefix = config.PREFIX || '.';
        const isCommand = body.startsWith(prefix);
        
        // Context object to pass to plugins
        // This makes your plugins cleaner
        const ctx = {
            conn: sock,    // Standard naming 'conn'
            sock: sock,    // Alternate naming
            m,
            text: isCommand ? body.slice(1).trim().split(/\s+/).slice(1).join(" ") : null,
            args: isCommand ? body.slice(1).trim().split(/\s+/) : [],
            usedPrefix: prefix,
            command: isCommand ? body.slice(1).trim().split(/\s+/).shift().toLowerCase() : null
        };

        // --- A. RUN BACKGROUND EVENTS (Always run) ---
        // (e.g., auto-downloaders, chatgpt without prefix, etc.)
        for (const [fileName, plugin] of plugins) {
            if (plugin.events && typeof plugin.events === 'function') {
                try {
                    // Check if event returns true/false to stop propagation if needed
                    await plugin.events(sock, m, ctx); 
                } catch (err) {
                    console.error(`Error in event ${fileName}:`, err);
                }
            }
        }

        if (!isCommand) return;

        // --- B. COMMAND HANDLING ---
        // Iterate through all plugins to find a matching command
        for (const [fileName, plugin] of plugins) {
            let isMatch = false;

            // 1. Check Regex Command (Standard)
            if (plugin.command) {
                if (plugin.command instanceof RegExp) {
                    isMatch = plugin.command.test(ctx.command);
                } else if (Array.isArray(plugin.command)) {
                    isMatch = plugin.command.includes(ctx.command);
                } else if (typeof plugin.command === 'string') {
                    isMatch = plugin.command === ctx.command;
                }
            } 
            // 2. Check Legacy 'cmd' (Your previous structure)
            else if (plugin.cmd) {
                isMatch = plugin.cmd === ctx.command;
            }

            // Execute if matched
            if (isMatch) {
                // Determine which function to run
                // Standard plugins usually export the function directly or as 'handler'
                // Your structure uses 'plugin.run'
                const runFunc = plugin.run || plugin.handler || (typeof plugin === 'function' ? plugin : null);
                
                if (runFunc) {
                    await runFunc(m, ctx); // Pass m and the context object
                }
                break; // Stop after finding the command
            }
        }

    } catch (e) {
        console.error("Handler Error:", e);
    }
}

module.exports = { messageHandler };
