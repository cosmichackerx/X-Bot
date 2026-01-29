// Global storage to prevent duplicate timers during hot-reloads
global.automationTimers = global.automationTimers || {
    w: null,
    d: null,
    daily: null,
    isActive: false
};

const TARGET_JID = "120363404984315672@g.us";

// --- Helper Function: Start Timers ---
const startTimers = (sock) => {
    if (global.automationTimers.isActive) return false; // Already running

    console.log("🚀 Automation: Initializing Timers...");
    global.automationTimers.isActive = true;

    // 1. Send #w EVERY 1 MINUTE
    if (global.automationTimers.w) clearInterval(global.automationTimers.w);
    global.automationTimers.w = setInterval(async () => {
        try {
            await sock.sendMessage(TARGET_JID, { text: '#w' });
            console.log("⏰ Auto: Sent #w");
        } catch (e) {
            console.error("Auto Error:", e.message);
        }
    }, 1 * 60 * 1000); 

    // 2. Send #d all EVERY 30 MINUTES
    if (global.automationTimers.d) clearInterval(global.automationTimers.d);
    global.automationTimers.d = setInterval(async () => {
        try {
            await sock.sendMessage(TARGET_JID, { text: '#d all' });
            console.log("⏰ Auto: Sent #d all");
        } catch (e) {
            console.error("Auto Error:", e.message);
        }
    }, 30 * 60 * 1000);

    // 3. Send #daily EVERY 6 HOURS
    if (global.automationTimers.daily) clearInterval(global.automationTimers.daily);
    global.automationTimers.daily = setInterval(async () => {
        try {
            await sock.sendMessage(TARGET_JID, { text: '#daily' });
            console.log("⏰ Auto: Sent #daily");
        } catch (e) {
            console.error("Auto Error:", e.message);
        }
    }, 6 * 60 * 60 * 1000); 

    console.log(`✅ Automation Started for ${TARGET_JID}`);
    return true; // Successfully started
};

// --- Helper Function: Stop Timers ---
const stopTimers = () => {
    if (!global.automationTimers.isActive) return false; // Already stopped

    clearInterval(global.automationTimers.w);
    clearInterval(global.automationTimers.d);
    clearInterval(global.automationTimers.daily);
    
    global.automationTimers = {
        w: null,
        d: null,
        daily: null,
        isActive: false
    };
    
    console.log("🛑 Automation Stopped manually.");
    return true; // Successfully stopped
};

module.exports = {
    // 1. Auto-start on bot startup
    listen: async ({ sock }) => {
        startTimers(sock);
    },

    // 2. Manual Control Command
    cmd: 'automation',
    desc: 'Control automation (start/stop)',
    run: async ({ sock, args, reply }) => {
        // args[0] is the first word after command (e.g., "start" or "stop")
        const action = args[0] ? args[0].toLowerCase() : '';

        if (action === 'stop') {
            const stopped = stopTimers();
            if (stopped) reply("🛑 Automation Stopped.");
            else reply("⚠️ Automation is already stopped.");
        } 
        else if (action === 'start') {
            const started = startTimers(sock);
            if (started) reply("✅ Automation Started.");
            else reply("⚠️ Automation is already active.");
        } 
        else {
            reply("Usage: *.automation stop* or *.automation start*");
        }
    }
};
