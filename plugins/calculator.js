module.exports = {
    cmd: 'calculate',
    desc: 'Scientific calculator (Basic, Trig, Powers, etc.)',
    run: async ({ sock, m, args, reply }) => {
        try {
            // 1. INPUT VALIDATION & HELP GUIDE
            // If no input is provided, show the "Professional Manual"
            if (!args || args.length === 0) {
                return reply(
                    `🧮 *SCIENTIFIC CALCULATOR GUIDE*\n` +
                    `Usage: .calculate <expression>\n\n` +
                    `✅ *Basic:* +, -, *, /, %, ^\n` +
                    `👉 Example: .calculate 25 * 4 + 10\n` +
                    `👉 Example: .calculate 2^5 (Power)\n\n` +
                    `📐 *Trigonometry:* sin, cos, tan\n` +
                    `👉 Example: .calculate sin(45 * pi / 180)\n` +
                    `👉 Example: .calculate cos(0)\n\n` +
                    `📊 *Advanced:* sqrt, log, abs, round, floor, ceil\n` +
                    `👉 Example: .calculate sqrt(144)\n` +
                    `👉 Example: .calculate log(100)\n\n` +
                    `🔢 *Constants:* pi, e\n` +
                    `_Tip: Use brackets ( ) for complex math._`
                );
            }

            // 2. PRE-PROCESS INPUT
            // Join args to form the expression (e.g., "2 + 2")
            let expression = args.join('').toLowerCase();

            // Replace user-friendly symbols with JavaScript Math syntax
            expression = expression
                // Basic Operators
                .replace(/x/g, '*')      // 'x' becomes '*'
                .replace(/÷/g, '/')      // '÷' becomes '/'
                .replace(/\^/g, '**')    // '^' becomes power
                
                // Constants
                .replace(/pi/g, 'Math.PI')
                .replace(/π/g, 'Math.PI')
                .replace(/e/g, 'Math.E')
                
                // Functions (Map common names to Math.x)
                .replace(/sqrt/g, 'Math.sqrt')
                .replace(/sin/g, 'Math.sin')
                .replace(/cos/g, 'Math.cos')
                .replace(/tan/g, 'Math.tan')
                .replace(/abs/g, 'Math.abs')
                .replace(/log/g, 'Math.log10') // Standard log base 10 for users
                .replace(/ln/g, 'Math.log')    // Natural log
                .replace(/round/g, 'Math.round')
                .replace(/ceil/g, 'Math.ceil')
                .replace(/floor/g, 'Math.floor')
                .replace(/rad/g, ' * (Math.PI / 180)') // Easy conversion helper
                .replace(/deg/g, ' * (180 / Math.PI)');

            // 3. SECURITY CHECK (Anti-Crash)
            // Ensure only math characters are present to prevent code injection
            // Allowed: numbers, operators, parens, points, "Math", and property names
            const validSyntax = /^[0-9+\-*/%().\sMathPIE_a-z]+$/;
            if (!validSyntax.test(expression)) {
                return reply('❌ Invalid characters detected. Please use numbers and math functions only.');
            }

            // 4. EVALUATE
            // We use a strict function constructor for safer evaluation than direct eval()
            let result;
            try {
                // Determine if it's a factorial request (custom logic)
                if (expression.includes('!')) {
                    return reply("❌ Factorial (!) not supported directly. Please use simple multiplication.");
                }

                const calculateFunc = new Function('return ' + expression);
                result = calculateFunc();

            } catch (err) {
                return reply('❌ Math Error: Invalid Expression.\nCheck your brackets () and operators.');
            }

            // 5. FORMAT OUTPUT
            // Handle Infinity or NaN
            if (!isFinite(result) || isNaN(result)) {
                return reply('❌ Result is undefined or infinite.');
            }

            // Format big numbers or long decimals
            const finalResult = Number.isInteger(result) ? result : result.toFixed(4).replace(/\.?0+$/, '');

            const response = `🧮 *CALCULATION RESULT*\n` +
                             `📝 *Input:* ${args.join(' ')}\n` +
                             `✅ *Output:* ${finalResult}`;

            await reply(response);

        } catch (e) {
            console.error("Calculator Error:", e);
            reply('❌ Error processing calculation.');
        }
    }
};
