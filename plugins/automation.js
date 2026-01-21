// Global storage to prevent duplicate timers during hot-reloads
global.automationTimers = global.automationTimers || {
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
        if (global.automationTimers.isActive) return;

        console.log("🚀 Automation: Initializing Timers...");
        global.automationTimers.isActive = true;

        // ============================================================
        // 1. Send #w EVERY 1 MINUTE
        // ============================================================
        if (global.automationTimers.w) clearInterval(global.automationTimers.w);
        global.automationTimers.w = setInterval(async () => {
            try {
                await sock.sendMessage(TARGET_JID, { text: '#w' });
                console.log("⏰ Auto: Sent #w");
            } catch (e) {
                console.error("Auto Error:", e.message);
            }
        }, 1 * 60 * 1000); // 1 Minute

        // ============================================================
        // 2. Send #d all EVERY 30 MINUTES
        // ============================================================
        if (global.automationTimers.d) clearInterval(global.automationTimers.d);
        global.automationTimers.d = setInterval(async () => {
            try {
                await sock.sendMessage(TARGET_JID, { text: '#d all' });
                console.log("⏰ Auto: Sent #d all");
            } catch (e) {
                console.error("Auto Error:", e.message);
            }
        }, 30 * 60 * 1000); // 30 Minutes

        // ============================================================
        // 3. Send #daily EVERY 24 HOURS
        // ============================================================
        if (global.automationTimers.daily) clearInterval(global.automationTimers.daily);
        global.automationTimers.daily = setInterval(async () => {
            try {
                await sock.sendMessage(TARGET_JID, { text: '#daily' });
                console.log("⏰ Auto: Sent #daily");
            } catch (e) {
                console.error("Auto Error:", e.message);
            }
        }, 24 * 60 * 60 * 1000); // 24 Hours

        console.log(`✅ Automation Started for ${TARGET_JID}`);
    },

    // Command to stop it manually if needed
    cmd: 'autostop',
    desc: 'Stop the auto-sender',
    run: async ({ reply }) => {
        clearInterval(global.automationTimers.w);
        clearInterval(global.automationTimers.d);
        clearInterval(global.automationTimers.daily);
        
        global.automationTimers = {
            w: null,
            d: null,
            daily: null,
            isActive: false
        };
        
        reply("🛑 Automation Stopped.");
    }
};
