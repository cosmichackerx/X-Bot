const { PhoneNumberUtil, PhoneNumberFormat, PhoneNumberType } = require('google-libphonenumber');
// Load the TimeZone Mapper (Included in the library)
const PhoneNumberToTimeZonesMapper = require('google-libphonenumber').PhoneNumberToTimeZonesMapper;

const phoneUtil = PhoneNumberUtil.getInstance();
const tzMapper = PhoneNumberToTimeZonesMapper.getInstance();
const PNF = PhoneNumberFormat;
const PNT = PhoneNumberType;

module.exports = {
    cmd: 'carrierinfo',
    desc: 'Get carrier, region, time zone, and current time',
    run: async ({ sock, m, args, reply }) => {
        // 1. INPUT HANDLING (Robust Cleaner)
        // Joins all arguments to handle spaces: "92 336 ..." -> "92336..."
        let inputNumber = args.join('');
        
        // If no number provided, check for a reply
        if (!inputNumber) {
            if (m.message.extendedTextMessage?.contextInfo?.participant) {
                inputNumber = '+' + m.message.extendedTextMessage.contextInfo.participant.split('@')[0];
            } else {
                return reply('❌ Please provide a number or reply to a user.\nExample: .carrierinfo +923367307471');
            }
        }

        // Remove everything except numbers and '+'
        // This fixes formats like "(92) 336-730" -> "92336730"
        inputNumber = inputNumber.replace(/[^0-9+]/g, '');

        // Smart "+" prefixer:
        // If it doesn't start with +, add it.
        if (!inputNumber.startsWith('+')) {
            inputNumber = '+' + inputNumber;
        }

        try {
            // 2. PARSE NUMBER
            const number = phoneUtil.parseAndKeepRawInput(inputNumber);
            
            // 3. VALIDATE
            const isValid = phoneUtil.isValidNumber(number);
            if (!isValid) {
                return reply('❌ Invalid phone number format.\nEnsure it contains the Country Code (e.g. +92...)');
            }

            // 4. EXTRACT BASIC DETAILS
            const regionCode = phoneUtil.getRegionCodeForNumber(number); // PK, US, CU
            const countryCode = number.getCountryCode(); // 92, 1, 53
            const nationalNumber = number.getNationalNumber();
            const formattedInt = phoneUtil.format(number, PNF.INTERNATIONAL);
            
            // Type Detection
            const typeCode = phoneUtil.getNumberType(number);
            let typeStr = 'Unknown';
            switch (typeCode) {
                case PNT.MOBILE: typeStr = 'Mobile'; break;
                case PNT.FIXED_LINE: typeStr = 'Landline'; break;
                case PNT.FIXED_LINE_OR_MOBILE: typeStr = 'Mobile/Landline'; break;
                case PNT.VOIP: typeStr = 'VoIP'; break;
                case PNT.TOLL_FREE: typeStr = 'Toll Free'; break;
                default: typeStr = 'Unknown';
            }

            // 5. EXTRACT TIME ZONE & CURRENT TIME
            // This gets the list of timezones for this number (e.g. ['Asia/Karachi'])
            const timezones = tzMapper.getTimeZonesForGeographicalNumber(number);
            let timeZoneStr = 'Unknown';
            let localTimeStr = 'Unknown';

            if (timezones && timezones.length > 0) {
                // We use the first matched timezone (usually accurate for mobiles)
                const targetZone = timezones[0];
                timeZoneStr = targetZone;

                // Get Current Time in that Zone using Intl API
                try {
                    localTimeStr = new Date().toLocaleTimeString('en-US', {
                        timeZone: targetZone,
                        hour12: true,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        timeZoneName: 'short'
                    });
                } catch (err) {
                    localTimeStr = 'Clock Error';
                }
            } else {
                timeZoneStr = "Multiple/Unknown";
            }

            // 6. BUILD REPORT
            let info = `📡 *CARRIER & GEO INFO*\n`;
            info += `--------------------------------\n`;
            info += `📞 *Number:* ${formattedInt}\n`;
            info += `🌍 *Region:* ${regionCode} (+${countryCode})\n`;
            info += `📟 *Type:* ${typeStr}\n`;
            info += `🕰️ *Time Zone:* ${timeZoneStr}\n`;
            info += `⌚ *Local Time:* ${localTimeStr}\n`;
            info += `🔢 *National:* ${nationalNumber}\n`;
            info += `✅ *Valid:* Yes\n`;
            
            await reply(info);

        } catch (e) {
            console.error("Carrier Plugin Error:", e);
            reply('❌ Parsing Error: Please check the number format.');
        }
    }
};
