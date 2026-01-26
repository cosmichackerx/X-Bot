const axios = require('axios');

module.exports = {
    cmd: 'gembanana',
    desc: 'Generate AI Images',
    run: async ({ sock, m, args, reply }) => {
        const prompt = args.join(' ');
        if (!prompt) return reply('❌ Please describe the image.\nExample: .gembanana A cyberpunk cat in rain');

        try {
            await reply('🎨 *Painting...*');

            // We use Pollinations AI for instant, free, unlimited image generation.
            // This saves your Gemini Key quota for text chats.
            const encodedPrompt = encodeURIComponent(prompt);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

            // Fetch Image Buffer
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'utf-8');

            // Send Image
            await sock.sendMessage(m.key.remoteJid, {
                image: buffer,
                caption: `🍌 *Gemini Banana Art*\nPrompt: "${prompt}"`
            }, { quoted: m });

        } catch (e) {
            console.error("GemBanana Error:", e.message);
            reply('❌ Error generating image. Please try a simpler prompt.');
        }
    }
};
