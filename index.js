/**
 * index.js - The Static Engine
 * YOU NEVER NEED TO EDIT THIS FILE AGAIN.
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

// Global Socket
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

    // 1. Start the Pairing Web Server
    startServer(sock);

    // 2. Connection Update Listener
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

    // 3. Credentials Update
    sock.ev.on('creds.update', saveCreds);

    // 4. Message Listener (Passes to Handler)
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            if (!chatUpdate.messages || chatUpdate.messages.length === 0) return;
            const msg = chatUpdate.messages[0];
            if (!msg.message) return;
            
            // Pass execution to the "Brain"
            await messageHandler(sock, msg);
        } catch (err) {
            console.error("Error in message loop:", err);
        }
    });
}

startXBot();
