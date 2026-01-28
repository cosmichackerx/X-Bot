const axios = require('axios');

// 🔑 CONFIGURATION
// Get your free key from: https://console.groq.com/keys
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE';

// 📋 AVAILABLE MODELS (Free Tier)
const models = {
    'llama3': 'llama3-8b-8192',         // Fast & Efficient
    'llama3-70': 'llama3-70b-8192',     // High Intelligence
    'mixtral': 'mixtral-8x7b-32768',    // Strong Logic
    'gemma': 'gemma-7b-it',             // Google's Model
    'gemma2': 'gemma2-9b-it',           // Google's Newest
    'whisper': 'whisper-large-v3'       // Audio (Not for text chat, but good to know)
};

const defaultModel = 'llama3-70b-8192';

module.exports = {
    cmd: 'groq',
    desc: 'Chat with ultra-fast Groq AI models',
    run: async ({ sock, m, args, reply }) => {
        // 1. HELP MENU (If no args)
        if (!args[0]) {
            let menu = `⚡ *GROQ AI INTERFACE*\n`;
            menu += `---------------------------\n`;
            menu += `🚀 *Usage:*\n`;
            menu += `• .groq <question> (Default Llama3-70)\n`;
            menu += `• .groq --random <question> (Auto-Switch)\n`;
            menu += `• .groq --<model> <question> (Specific)\n\n`;
            menu += `📂 *Available Models:*\n`;
            
            Object.keys(models).forEach(key => {
                menu += `🔹 --${key} \n`;
            });
            
            menu += `\n_Example: .groq --mixtral Write a python script_`;
            return reply(menu);
        }

        // 2. PARSE ARGUMENTS & DETECT FLAGS
        let prompt = args.join(' ');
        let selectedModel = defaultModel;
        let isRandom = false;

        // Check for specific flags (e.g., --mixtral)
        const flagRegex = /--([a-z0-9-]+)/i;
        const match = prompt.match(flagRegex);

        if (match) {
            const flag = match[1].toLowerCase();
            
            if (flag === 'random') {
                isRandom = true;
                // Remove the flag from the prompt
                prompt = prompt.replace(`--${flag}`, '').trim();
            } else if (models[flag]) {
                selectedModel = models[flag];
                prompt = prompt.replace(`--${flag}`, '').trim();
            } else {
                return reply(`❌ Unknown model flag: --${flag}\nType .groq for a list.`);
            }
        }

        if (!prompt) return reply('❌ Please provide a question/prompt.');

        await reply('⚡ *Processing...*');

        // 3. AI EXECUTION LOGIC
        if (isRandom) {
            await runRandomFallback(prompt, reply);
        } else {
            await runGroq(prompt, selectedModel, reply);
        }
    }
};

/**
 * 🛠️ CORE FUNCTION: Call Groq API
 */
async function runGroq(prompt, model, reply) {
    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const answer = response.data.choices[0].message.content;
        await reply(`🤖 *Groq (${model}):*\n\n${answer}`);
        return true; // Success

    } catch (e) {
        console.error(`Groq Error (${model}):`, e.message);
        return false; // Failed
    }
}

/**
 * 🎲 RANDOM FALLBACK SYSTEM
 * Tries a random model. If it fails, tries another until success.
 */
async function runRandomFallback(prompt, reply) {
    // Get all model IDs as an array
    const modelKeys = Object.values(models);
    
    // Shuffle the array to create a random try-order
    const shuffledModels = modelKeys.sort(() => 0.5 - Math.random());

    let success = false;
    
    for (const model of shuffledModels) {
        // Skip Whisper (it's for audio)
        if (model.includes('whisper')) continue;

        // Try the model
        success = await runGroq(prompt, model, reply);
        
        if (success) {
            console.log(`✅ Random Success with: ${model}`);
            break; // Stop loop on success
        } else {
            console.log(`⚠️ Failed with ${model}, switching...`);
        }
    }

    if (!success) {
        reply('❌ All Groq models are currently busy or the API Key is invalid.');
    }
}
