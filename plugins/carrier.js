const { PhoneNumberUtil, PhoneNumberFormat, PhoneNumberType } = require('google-libphonenumber');
// We use a dedicated package for TimeZones because google-libphonenumber doesn't export the Mapper in JS
const ct = require('countries-and-timezones');

const phoneUtil = PhoneNumberUtil.getInstance();
const PNF = PhoneNumberFormat;
const PNT = PhoneNumberType;

module.exports = {
    cmd: 'carrierinfo',
    desc: 'Get carrier, region, time zone, and current time',
    run: async ({ sock, m, args, reply }) => {
        // 1. INPUT HANDLING
        let inputNumber = args.join('');
        
        // If no number provided, check for a reply
        if (!inputNumber) {
            if (m.message.extendedTextMessage?.contextInfo?.participant) {
                inputNumber = '+' + m.message.extendedTextMessage.contextInfo.participant.split('@')[0];
            } else {
                return reply('❌ Please provide a number or reply to a user.\nExample: .carrierinfo +923367307471');
            }
        }

        // Clean input
        inputNumber = inputNumber.replace(/[^0-9+]/g, '');
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
            const regionCode = phoneUtil.getRegionCodeForNumber(number); // e.g. "PK"
            const countryCode = number.getCountryCode(); // e.g. 92
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

            // 5. EXTRACT TIME ZONE & CURRENT TIME (Fixed Strategy)
            let timeZoneStr = 'Unknown';
            let localTimeStr = 'Unknown';

            // Get country data using the Region Code (e.g. "PK")
            const countryData = regionCode ? ct.getCountry(regionCode) : null;
            
            if (countryData && countryData.timezones.length > 0) {
                // We pick the first timezone for the country (Primary)
                // For huge countries (US/RU), this is an approximation, but efficient for bots
                const targetZone = countryData.timezones[0];
                timeZoneStr = targetZone;

                // Get Current Time in that Zone
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
            }

            // 6. BUILD REPORT
            let info = `📡 *CARRIER & GEO INFO*\n`;
            info += `--------------------------------\n`;
            info += `📞 *Number:* ${formattedInt}\n`;
            info += `🌍 *Region:* ${regionCode} (+${countryCode})\n`;
            info += `📟 *Line Type:* ${typeStr}\n`;
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
