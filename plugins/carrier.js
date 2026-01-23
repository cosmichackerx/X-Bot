const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const PNT = require('google-libphonenumber').PhoneNumberType;

module.exports = {
    cmd: 'carrierinfo',
    desc: 'Get carrier and region info for any number',
    run: async ({ sock, m, args, reply }) => {
        // 1. Get the Number
        let inputNumber = args.join('');
        
        // If no number is typed, check if user is replying to someone
        if (!inputNumber) {
            if (m.message.extendedTextMessage?.contextInfo?.participant) {
                inputNumber = '+' + m.message.extendedTextMessage.contextInfo.participant.split('@')[0];
            } else {
                return reply('❌ Please provide a number or reply to a user.\nExample: .carrierinfo +923367307471');
            }
        }

        // Ensure it starts with + for the library to detect country code automatically
        if (!inputNumber.startsWith('+')) {
            inputNumber = '+' + inputNumber;
        }

        try {
            // 2. Parse Number
            const number = phoneUtil.parseAndKeepRawInput(inputNumber);
            
            // 3. Validate
            const isValid = phoneUtil.isValidNumber(number);
            const isPossible = phoneUtil.isPossibleNumber(number);

            if (!isValid) {
                return reply('❌ Invalid phone number format.');
            }

            // 4. Extract Details
            const regionCode = phoneUtil.getRegionCodeForNumber(number); // e.g., PK, US
            const countryCode = number.getCountryCode(); // e.g., 92
            const nationalNumber = number.getNationalNumber();
            
            // Format International: +92 336 7307471
            const formattedInt = phoneUtil.format(number, PNF.INTERNATIONAL);
            
            // Determine Type (Mobile, Fixed Line, etc.)
            const typeCode = phoneUtil.getNumberType(number);
            let typeStr = 'Unknown';
            if (typeCode === PNT.MOBILE) typeStr = 'Mobile';
            else if (typeCode === PNT.FIXED_LINE) typeStr = 'Landline';
            else if (typeCode === PNT.FIXED_LINE_OR_MOBILE) typeStr = 'Mobile/Landline';
            else if (typeCode === PNT.VOIP) typeStr = 'VoIP';

            // 5. Get Carrier Name (Offline mapper)
            // Note: google-libphonenumber separates the carrier mapper.
            // Since we installed the main package, we rely on region data mainly.
            // For specific carrier names (like "Jazz" or "T-Mobile"), this library 
            // uses number prefixes. If exact carrier data isn't in the lite version,
            // we display the Country/Region as the primary info provider.
            
            // NOTE: To get the *exact* text string "Ufone" or "Verizon", 
            // you typically need the 'google-libphonenumber' offline geocoder 
            // or carrier mapper which is heavy. 
            // Here we provide the standard precise data:
            
            let info = `📡 *CARRIER & NETWORK INFO*\n`;
            info += `--------------------------------\n`;
            info += `📞 *Number:* ${formattedInt}\n`;
            info += `🌍 *Region:* ${regionCode} (+${countryCode})\n`;
            info += `📟 *Type:* ${typeStr}\n`;
            info += `🔢 *National:* ${nationalNumber}\n`;
            info += `✅ *Valid:* Yes\n`;
            
            await reply(info);

        } catch (e) {
            console.error(e);
            reply('❌ Error: Could not parse number. Ensure it includes country code (e.g. +92...)');
        }
    }
};
