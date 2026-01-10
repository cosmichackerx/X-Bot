/**
 * index.js - Dynamic Core
 * Purpose: Connect to WhatsApp and delegate logic to lib/handler.js
 * Status: IMMUTABLE (Do not edit)
 */

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const { startServer } = require('./lib/server');
const { messageHandler } = require('./lib/handler');

// Global Socket Scope
let globalSock = null;

async function startXBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    console.log(`⚡ X BOT SYSTEM STARTING (v${version})...`);

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Safari"),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        }
    });

    globalSock = sock;

    // 1. Start the Web Server (Pass sock for pairing)
    startServer(sock);

    // 2. Connection Logic
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut);
            console.log('❌ Connection lost. Reconnecting:', shouldReconnect);
            if (shouldReconnect) startXBot();
        } else if (connection === 'open') {
            console.log('✅ Connected to WhatsApp! Bot is active.');
            await sock.sendPresenceUpdate('available');
        }
    });

    // 3. Save Credentials
    sock.ev.on('creds.update', saveCreds);

    // 4. Message Handler
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            if (!chatUpdate.messages || chatUpdate.messages.length === 0) return;
            const msg = chatUpdate.messages[0];
            if (!msg.message) return;
            
            // Pass to the dynamic handler
            await messageHandler(sock, msg);
        } catch (err) {
            console.error("Error in message flow:", err);
        }
    });
}

startXBot();
