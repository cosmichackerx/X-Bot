module.exports = {
    cmd: 'ping',
    desc: 'Check system status',
    run: async ({ sock, m, reply }) => {
        await reply('⚡ X Bot is Online and ready!');
    }
};
