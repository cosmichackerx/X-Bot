const axios = require('axios');

module.exports = {
    cmd: 'pollai',
    desc: 'Generate AI Images (Pollinations)',
    run: async ({ sock, m, args, reply }) => {
        // --- 1. Help Menu (If no arguments) ---
        const promptRaw = args.join(' ');
        
        if (!promptRaw) {
            return reply(`🎨 *Pollinations AI Generator* 🎨

Use this command to generate free, unlimited AI art in various styles and sizes.

*Usage:*
.pollai [description] [flags]

*Available Flags:*
--anime      (Anime/Manga style)
--realistic  (Photorealistic/8k)
--3d         (3D Render/Pixar style)
--digital    (Digital Art/Illustration)
--portrait   (Vertical image for phone wallpaper)
--landscape  (Wide image for desktop/banner)

*Examples:*
• .pollai a red sports car --realistic --landscape
• .pollai naruto eating ramen --anime --portrait
• .pollai minimalist logo for a tech company --digital
`);
        }

        // --- 2. Configuration & Flag Detection ---
        let prompt = promptRaw;
        let style = '';
        // Default to Square (1:1)
        let width = 1024;
        let height = 1024;

        // Detect Size Flags
        if (prompt.includes('--portrait')) {
            width = 768;
            height = 1024;
            prompt = prompt.replace('--portrait', '');
        } else if (prompt.includes('--landscape')) {
            width = 1024;
            height = 768;
            prompt = prompt.replace('--landscape', '');
        }

        // Detect Style Flags
        if (prompt.includes('--anime')) {
            style = 'anime style, vibrant colors, studio ghibli, makoto shinkai, high detail';
            prompt = prompt.replace('--anime', '');
        } 
        else if (prompt.includes('--realistic')) {
            style = 'photorealistic, 8k, unreal engine 5, cinematic lighting, highly detailed, photography';
            prompt = prompt.replace('--realistic', '');
        }
        else if (prompt.includes('--3d')) {
            style = '3d render, blender, pixar style, isometric, crisp';
            prompt = prompt.replace('--3d', '');
        }
        else if (prompt.includes('--digital')) {
            style = 'digital art, concept art, sharp focus, illustration';
            prompt = prompt.replace('--digital', '');
        }

        // Clean up prompt
        prompt = prompt.trim();
        const finalPrompt = style ? `${prompt}, ${style}` : prompt; // Use raw prompt if no style flag (Generic Mode)

        try {
            // Inform user about the batch generation
            await reply(`🎨 *Generating 4 variations...*\nMode: ${style ? style.split(',')[0] : 'Generic/Mixed'}\nSize: ${width}x${height}`);

            // --- 3. Loop for Multiple Images (4 Variations) ---
            const imageCount = 4; 

            for (let i = 0; i < imageCount; i++) {
                // Random seed ensures every image is different even with same prompt
                const randomSeed = Math.floor(Math.random() * 10000000);
                
                const encodedPrompt = encodeURIComponent(finalPrompt);
                
                // Construct URL with Seed to force variety
                const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${randomSeed}&nolog=true`;

                const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data, 'utf-8');

                await sock.sendMessage(m.key.remoteJid, {
                    image: buffer,
                    caption: `🎨 *Pollinations AI* [${i+1}/${imageCount}]\nPrompt: "${prompt}"`
                }, { quoted: m });
            }

        } catch (e) {
            console.error("PollAI Error:", e.message);
            reply('❌ Error generating image. The API might be busy.');
        }
    }
};
