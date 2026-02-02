const os = require('os');
const process = require('process');
const { performance } = require('perf_hooks');

// Capture the time when the bot started
const START_TIME = new Date();

module.exports = {
    cmd: 'systeminfo',
    desc: 'Shows System Resources (RAM, CPU, Uptime) - IP Hidden',
    run: async ({ sock, m, reply }) => {
        try {
            // 1. GATHER SYSTEM METRICS
            // ========================
            
            // RAM Usage
            const memoryUsage = process.memoryUsage();
            const ramUsed = memoryUsage.rss; 
            const totalMem = os.totalmem(); 
            
            // CPU Usage
            const cpus = os.cpus();
            const cpuModel = cpus[0].model.trim();
            const cpuSpeed = cpus[0].speed;
            const coreCount = cpus.length;
            const loadAvg = os.loadavg()[0]; // 1-minute load average
            
            // CPU Percentage Calculation
            const cpuPercent = Math.min(Math.floor(loadAvg * 100 / coreCount), 100);

            // Uptime Calculation
            const uptimeSeconds = process.uptime();
            const uptimeStr = formatUptime(uptimeSeconds);
            
            // Platform Info
            const platform = os.platform(); // "linux"
            const arch = os.arch(); // "x64"

            // 2. GENERATE VISUAL BARS
            // ========================
            // Note: We use a fixed 100 for CPU max to keep the bar consistent
            const ramBar = drawProgressBar(ramUsed, totalMem);
            const cpuBar = drawProgressBar(cpuPercent, 100);

            // 3. BUILD THE DASHBOARD REPORT
            // ========================
            let text = `🖥️ *SYSTEM DASHBOARD*\n`;
            text += `━━━━━━━━━━━━━━━━━━━━━\n`;
            
            text += `⏱️ *Runtime:* ${uptimeStr}\n`;
            text += `🔄 *Last Start:* ${START_TIME.toLocaleTimeString()}\n`;
            text += `⚙️ *System:* ${platform} (${arch})\n`; // Replaced Host with generic OS info
            text += `🚀 *Cores:* ${coreCount}x ${cpuSpeed}MHz\n`;
            text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

            // RAM SECTION
            text += `💾 *MEMORY (RAM)*\n`;
            text += `*${formatBytes(ramUsed)}* / ${formatBytes(totalMem)}\n`;
            text += `Usage: ${drawProgressBar(ramUsed, totalMem)} *${(ramUsed / totalMem * 100).toFixed(1)}%*\n\n`;

            // CPU SECTION
            text += `🧠 *CPU LOAD*\n`;
            text += `Model: ${cpuModel}\n`;
            text += `Usage: ${drawProgressBar(cpuPercent, 100)} *${cpuPercent}%*\n\n`;

            text += `_🛡️ Security: Host IP Hidden_`;

            await reply(text);

        } catch (e) {
            console.error("SystemInfo Crash:", e);
            reply("❌ Error fetching system stats.");
        }
    }
};

// --- HELPER FUNCTIONS ---

// 1. Draw Text-Based Progress Bar [████░░░░░░]
function drawProgressBar(current, total) {
    const size = 10; // Length of bar
    const percentage = Math.min(current / total, 1); // Cap at 100%
    const filledLength = Math.round(size * percentage);
    const emptyLength = size - filledLength;

    const bar = '█'.repeat(filledLength) + '░'.repeat(emptyLength);
    return `[${bar}]`;
}

// 2. Format Bytes to MB/GB
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

// 3. Format Uptime (Seconds -> H:M:S)
function formatUptime(seconds) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    let parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    parts.push(`${m}m`);
    parts.push(`${s}s`);
    
    return parts.join(' ');
}
