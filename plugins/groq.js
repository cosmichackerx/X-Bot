const axios = require('axios');

// 🔑 CONFIGURATION
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE';

// 📋 AVAILABLE MODELS
const models = {
    'default': 'llama-3.1-8b-instant',    // Super fast default
    'fast': 'llama-3.1-8b-instant',
    'smart': 'llama-3.1-70b-versatile',   // High intelligence
    'mini': 'llama-3.2-1b-preview',       // Lightweight
    'mixtral': 'mixtral-8x7b-32768',      // Strong logic
    'gemma': 'gemma2-9b-it',              // Google
    'llama3': 'llama3-70b-8192'           // Legacy fallback
};

module.exports = {
    cmd: 'groq',
    desc: 'Chat with Groq AI (Auto-Fallback enabled)',
    run: async ({ sock, m, args, reply }) => {
        // 1. HELP MENU (If no prompt provided)
        if (!args[0]) {
            let menu = `⚡ *GROQ AI USAGE*\n`;
            menu += `---------------------------\n`;
            menu += `🗣️ *Chat:* .groq <question>\n`;
            menu += `🎯 *Specific:* .groq --model <question>\n\n`;
            menu += `📂 *Available Models:*\n`;
            
            Object.keys(models).forEach(key => {
                if (key !== 'default') {
                    menu += `🔹 --${key}\n`;
                }
            });
            
            menu += `\n_Example: .groq --smart Explain quantum physics_`;
            return reply(menu);
        }

        // 2. PARSE INPUT & SELECT MODEL
        let prompt = args.join(' ');
        let selectedKey = 'default';
        let userSelected = false;

        // Check for flags (e.g. --smart)
        const words = prompt.split(' ');
        const flagIndex = words.findIndex(w => w.startsWith('--'));

        if (flagIndex !== -1) {
            const flag = words[flagIndex].replace('--', '').toLowerCase();
            if (models[flag]) {
                selectedKey = flag;
                userSelected = true;
                // Remove flag from prompt
                words.splice(flagIndex, 1);
                prompt = words.join(' ');
            }
        }

        if (!prompt.trim()) return reply('❌ Please provide a prompt after the model flag.');

        await reply(`⚡ *Thinking...* (${models[selectedKey]})`);

        // 3. EXECUTION WITH FALLBACK
        // Create a list of models to try. 
        // First is the selected one, followed by the rest as backup.
        let attemptList = [models[selectedKey]];
        
        // Add others as fallback (excluding the one we just added)
        Object.values(models).forEach(mId => {
            if (!attemptList.includes(mId)) attemptList.push(mId);
        });

        let finalResponse = null;
        let successModel = '';

        // Loop through models until one works
        for (const modelId of attemptList) {
            try {
                // If this is a fallback attempt, log it
                if (modelId !== models[selectedKey]) {
                    console.log(`⚠️ Primary failed. Retrying with fallback: ${modelId}`);
                }

                const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                    model: modelId,
                    messages: [
                        { role: "user", content: prompt }
                    ],
                    temperature: 1,
                    max_completion_tokens: 1024,
                    top_p: 1,
                    stream: false
                }, {
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });

                finalResponse = response.data.choices[0].message.content;
                successModel = modelId;
                break; // Stop loop on success!

            } catch (e) {
                const errCode = e.response?.status;
                const errMsg = e.response?.data?.error?.message || e.message;
                console.error(`❌ Failed (${modelId}): ${errMsg}`);

                // If Invalid API Key, stop immediately (fallback won't help)
                if (errMsg.includes('invalid_api_key') || errCode === 401) {
                    return reply('❌ Error: Invalid Groq API Key. Check your config.');
                }
            }
        }

        // 4. FINAL RESULT
        if (finalResponse) {
            // If we had to switch models, indicate it in the header
            const header = successModel === models[selectedKey] 
                ? `🤖 *Groq (${selectedKey})*`
                : `🤖 *Groq (Fallback: ${successModel})*`;

            await reply(`${header}\n\n${finalResponse}`);
        } else {
            reply('❌ All Groq models are currently busy or down. Please try again later.');
        }
    }
};
