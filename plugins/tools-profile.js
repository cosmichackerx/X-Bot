let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        let who;

        // 1. Determine the target user (who)
        if (m.isGroup) {
            // If user mentioned someone: .profile @user
            if (m.mentionedJid.length > 0) {
                who = m.mentionedJid[0];
            } 
            // If user replied to a message: .profile (replying to someone)
            else if (m.quoted) {
                who = m.quoted.sender;
            } 
            // If user provided text (phone number): .profile +20 12 123456789
            else if (text) {
                // Strip non-numeric characters and append standard suffix
                who = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            } 
            // If no input, target the sender (self)
            else {
                who = m.sender;
            }
        } else {
            // In private chat, default to the chat partner unless text is provided
            who = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.chat;
        }

        // 2. Fetch Profile Picture
        let pp = './src/avatar_contact.png'; // Make sure you have a default image or URL here
        try {
            pp = await conn.profilePictureUrl(who, 'image');
        } catch (e) {
            // Use a standard default placeholder if they have no PP or privacy settings hide it
            // pp = 'https://i.imgur.com/your-default-image.jpg'; 
        }

        // 3. Fetch About/Bio Description
        let about = 'Private / Not available';
        try {
            let statusData = await conn.fetchStatus(who);
            about = statusData.status;
        } catch (e) {
            // Usually fails if the user has "About" privacy set to "Nobody" or "Contacts"
            console.log(e);
        }

        // 4. Fetch Name
        // conn.getName() is a common helper function in these bot bases
        let name = await conn.getName(who);

        // 5. Construct the Caption
        let str = `
👤 *USER PROFILE*

• *Name:* ${name}
• *About:* ${about}
• *Number:* ${who.split('@')[0]}
• *Link:* wa.me/${who.split('@')[0]}
`.trim();

        // 6. Send the result
        // Using sendFile to send the image with caption
        await conn.sendFile(m.chat, pp, 'profile.jpg', str, m);

    } catch (e) {
        console.error(e);
        m.reply('❎ Could not fetch profile data. The number might be invalid or doesn\'t exist on WhatsApp.');
    }
}

// Metadata for the help menu
handler.help = ['profile', 'whois'].map(v => v + ' <@tag/number>');
handler.tags = ['tools'];
handler.command = /^(profile|whois|user)$/i;

module.exports = handler;
