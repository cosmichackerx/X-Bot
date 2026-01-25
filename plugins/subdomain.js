const axios = require('axios');

module.exports = {
    cmd: 'subdomain',
    desc: 'Find subdomains using Certificate Transparency (crt.sh)',
    run: async ({ sock, m, args, reply }) => {
        // 1. Check Input
        if (!args[0]) return reply('❌ Please provide a domain name.\nExample: .subdomain google.com');

        // 2. Smart Cleaning (The feature you asked for)
        // Turns "https://www.google.com/search" -> "google.com"
        // Turns "www.facebook.example.com" -> "facebook.example.com"
        let domain = args[0].toLowerCase();
        
        // Remove protocol (http://, https://)
        domain = domain.replace(/^https?:\/\//, '');
        // Remove www.
        domain = domain.replace(/^www\./, '');
        // Remove trailing paths (e.g. /login)
        domain = domain.split('/')[0];

        await reply(`🔍 *Scanning Subdomains...*\n🎯 Target: ${domain}\n_Source: crt.sh Transparency Logs_`);

        try {
            // 3. Fetch from crt.sh (Same logic as your Python script)
            const url = `https://crt.sh/?q=%.${domain}&output=json`;
            
            // Set a timeout to prevent hanging
            const response = await axios.get(url, { timeout: 20000 });

            if (!response.data || !Array.isArray(response.data)) {
                return reply(`❌ No records found for *${domain}*.`);
            }

            // 4. Process & Deduplicate Results
            const foundSubdomains = new Set();

            response.data.forEach(entry => {
                // crt.sh sometimes returns multiple domains in one string separated by newlines
                const nameValues = entry.name_value.split('\n');
                
                nameValues.forEach(name => {
                    // Clean wildcards (*.example.com -> example.com)
                    let cleanName = name.replace('*.', '').trim();
                    
                    // Only add if it actually contains our target domain
                    if (cleanName.includes(domain)) {
                        foundSubdomains.add(cleanName);
                    }
                });
            });

            // 5. Sort & Limit (WhatsApp has message limits)
            const sortedList = Array.from(foundSubdomains).sort();
            const totalFound = sortedList.length;
            const limit = 50; // Show max 50 to prevent crash
            const displayList = sortedList.slice(0, limit);

            // 6. Build Report
            let text = `🌐 *SUBDOMAINS DISCOVERED*\n`;
            text += `📁 *Total Found:* ${totalFound}\n`;
            text += `--------------------------------\n`;

            if (totalFound === 0) {
                text += `❌ No subdomains found publicly.`;
            } else {
                displayList.forEach(sub => {
                    text += `🔹 ${sub}\n`;
                });

                if (totalFound > limit) {
                    text += `\n...and ${totalFound - limit} others (Truncated).`;
                }
            }

            text += `\n_Powered by X BOT_`;

            await reply(text);

        } catch (e) {
            console.error("Subdomain Error:", e);
            reply('❌ Error: API request timed out or server is busy. Try again later.');
        }
    }
};
