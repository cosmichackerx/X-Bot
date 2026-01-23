module.exports = {
    cmd: 'vcf',
    desc: 'Get all group members as a VCF contact file',
    run: async ({ sock, m, reply }) => {
        // 1. Check if we are in a group
        const isGroup = m.key.remoteJid.endsWith('@g.us');
        if (!isGroup) return reply('❌ This command only works in groups.');

        try {
            await reply('🔄 Fetching group contacts... Please wait.');

            // 2. Fetch Group Metadata
            const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
            const groupName = groupMetadata.subject.replace(/[^a-zA-Z0-9 ]/g, ''); // Clean name
            const participants = groupMetadata.participants;

            // 3. Generate VCard Data
            let vcardContent = '';

            for (const p of participants) {
                const jid = p.id;
                const number = jid.split('@')[0];
                
                // Format: "+92333... - GroupName"
                // This makes the contact unique and easy to identify
                const contactName = `+${number} - ${groupName}`;

                vcardContent += [
                    'BEGIN:VCARD',
                    'VERSION:3.0',
                    `FN:${contactName}`, // Full Name
                    `TEL;type=CELL;type=VOICE;waid=${number}:+${number}`, // Phone Number
                    'END:VCARD',
                    '', // Empty line between contacts
                ].join('\n');
            }

            // 4. Create Buffer
            const buffer = Buffer.from(vcardContent, 'utf-8');

            // 5. Send File
            await sock.sendMessage(m.key.remoteJid, {
                document: buffer,
                mimetype: 'text/vcard',
                fileName: `${groupName}_Contacts.vcf`,
                caption: `✅ Successfully fetched ${participants.length} contacts from *${groupName}*.\n\n📂 Click the file to import.`
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            reply('❌ Error fetching contacts: ' + e.message);
        }
    }
};
