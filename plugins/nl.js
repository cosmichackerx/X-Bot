// Global storage to prevent duplicate timers during hot-reloads
global.nlTimers = global.nlTimers || {
    w: null,
    d: null,
    daily: null,
    isActive: false
};

const TARGET_JID = "120363404984315672@g.us";

module.exports = {
    // We use the 'listen' event to grab the socket connection automatically
    listen: async ({ sock }) => {
        // If already running, do nothing
        if (global.nlTimers.isActive) return;

        console.log("🚀 NL Automation: Initializing Timers...");
        global.nlTimers.isActive = true;

        // ============================================================
        // 1. Send #w EVERY 1 MINUTE
        // ============================================================
        if (global.nlTimers.w) clearInterval(global.nlTimers.w);
        global.nlTimers.w = setInterval(async () => {
            try {
                await sock.sendMessage(TARGET_JID, { text: '#w' });
                console.log("⏰ NL Auto: Sent #w");
            } catch (e) {
                console.error("NL Auto Error:", e.message);
            }
        }, 1 * 60 * 1000); // 1 Minute

        // ============================================================
        // 2. Send #d all EVERY 30 MINUTES
        // ============================================================
        if (global.nlTimers.d) clearInterval(global.nlTimers.d);
        global.nlTimers.d = setInterval(async () => {
            try {
                await sock.sendMessage(TARGET_JID, { text: '#d all' });
                console.log("⏰ NL Auto: Sent #d all");
            } catch (e) {
                console.error("NL Auto Error:", e.message);
            }
        }, 30 * 60 * 1000); // 30 Minutes

        // ============================================================
        // 3. Send #daily EVERY 24 HOURS
        // ============================================================
        if (global.nlTimers.daily) clearInterval(global.nlTimers.daily);
        global.nlTimers.daily = setInterval(async () => {
            try {
                await sock.sendMessage(TARGET_JID, { text: '#daily' });
                console.log("⏰ NL Auto: Sent #daily");
            } catch (e) {
                console.error("NL Auto Error:", e.message);
            }
        }, 24 * 60 * 60 * 1000); // 24 Hours

        console.log(`✅ NL Automation Started for ${TARGET_JID}`);
    },

    // Optional: Command to stop it manually if needed
    cmd: 'nlstop',
    desc: 'Stop the auto-sender',
    run: async ({ reply }) => {
        clearInterval(global.nlTimers.w);
        clearInterval(global.nlTimers.d);
        clearInterval(global.nlTimers.daily);
        global.nlTimers.isActive = false;
        reply("🛑 NL Automation Stopped.");
    }
};
