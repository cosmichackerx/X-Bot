const axios = require('axios');

// 🔑 CONFIGURATION
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE';

// 📋 AVAILABLE MODELS
const models = {
    'llama3': 'llama3-8b-8192',
    'llama3-70': 'llama3-70b-8192',
    'mixtral': 'mixtral-8x7b-32768',
    'gemma': 'gemma-7b-it',
    'gemma2': 'gemma2-9b-it',
    'whisper': 'whisper-large-v3' 
};

const defaultModel = 'llama3-70b-8192';

module.exports = {
    cmd: 'groq',
    desc: 'Chat with ultra-fast Groq AI models',
    run: async ({ sock, m, args, reply }) => {
        // 1. HELP MENU
        if (!args[0]) {
            let menu = `⚡ *GROQ AI INTERFACE*\n`;
            menu += `---------------------------\n`;
            menu += `🚀 *Usage:*\n`;
            menu += `• .groq <question> (Default Llama3-70)\n`;
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

        const flagRegex = /--([a-z0-9-]+)/i;
        const match = prompt.match(flagRegex);

        if (match) {
            const flag = match[1].toLowerCase();
            
            if (models[flag]) {
                selectedModel = models[flag];
                prompt = prompt.replace(`--${flag}`, '').trim();
            } else {
                return reply(`❌ Unknown model flag: --${flag}\nType .groq for a list.`);
            }
        }

        if (!prompt) return reply('❌ Please provide a question/prompt.');

        await reply('⚡ *Processing...*');

        // 3. AI EXECUTION
        await runGroq(prompt, selectedModel, reply);
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
        return true;

    } catch (e) {
        console.error(`Groq Error (${model}):`, e.message);
        reply(`❌ Error with model ${model}. Please try again later.`);
        return false;
    }
}
