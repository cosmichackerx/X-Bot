const axios = require('axios');
const config = require('../config');

// User Provided API Key
const API_KEY = '60ad2226c07a5882f6fc2781b442c29e';

module.exports = {
    cmd: 'weather',
    desc: 'Get weather info (current or forecast)',
    run: async ({ sock, m, args, reply }) => {
        try {
            // 1. INPUT HANDLING
            if (!args[0]) return reply('❌ Please provide a city name.\nExample: .weather London\nExample: .weather Dubai daily');

            // Check for mode (daily/forecast)
            const lastArg = args[args.length - 1].toLowerCase();
            let mode = 'current';
            let city = args.join(' ');

            if (['daily', 'weekly', 'forecast'].includes(lastArg)) {
                mode = 'forecast';
                city = args.slice(0, -1).join(' '); // Remove the mode word from city name
            }

            // 2. FETCH DATA
            // Encode city to handle spaces (e.g., "New York")
            const cityEncoded = encodeURIComponent(city);

            if (mode === 'current') {
                // === CURRENT WEATHER ===
                const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityEncoded}&appid=${API_KEY}&units=metric`;
                const { data } = await axios.get(url);

                const temp = Math.round(data.main.temp);
                const feelsLike = Math.round(data.main.feels_like);
                const desc = data.weather[0].description;
                const icon = getWeatherEmoji(data.weather[0].id);
                const humidity = data.main.humidity;
                const wind = data.wind.speed;
                const country = data.sys.country;
                const name = data.name;

                let report = `🌦️ *WEATHER REPORT*\n`;
                report += `------------------------\n`;
                report += `🌍 *Location:* ${name}, ${country}\n`;
                report += `${icon} *Condition:* ${capitalize(desc)}\n`;
                report += `🌡️ *Temp:* ${temp}°C (Feels: ${feelsLike}°C)\n`;
                report += `💧 *Humidity:* ${humidity}%\n`;
                report += `🌬️ *Wind:* ${wind} m/s\n`;
                report += `------------------------\n`;
                report += `_Tip: Type "${config.PREFIX}weather ${city} daily" for a forecast._`;

                await reply(report);

            } else {
                // === 5-DAY FORECAST ===
                // Free tier gives 5-day forecast in 3-hour steps
                const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityEncoded}&appid=${API_KEY}&units=metric`;
                const { data } = await axios.get(url);

                let report = `📅 *5-DAY FORECAST*\n`;
                report += `🌍 *Location:* ${data.city.name}, ${data.city.country}\n`;
                report += `------------------------\n`;

                // Filter to get roughly one reading per day (e.g., noon)
                // The API returns 40 list items (8 per day). We pick items at index 0, 8, 16, etc.
                const dailyData = data.list.filter((reading) => reading.dt_txt.includes("12:00:00"));

                dailyData.forEach(day => {
                    const date = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    const temp = Math.round(day.main.temp);
                    const desc = day.weather[0].main;
                    const icon = getWeatherEmoji(day.weather[0].id);
                    
                    report += `${icon} *${date}:* ${temp}°C (${desc})\n`;
                });

                report += `------------------------\n`;
                report += `_Powered by OpenWeather_`;

                await reply(report);
            }

        } catch (e) {
            console.error("Weather Error:", e.response ? e.response.data : e.message);
            if (e.response && e.response.status === 404) {
                return reply('❌ City not found. Please check the spelling.');
            }
            reply('❌ Error fetching weather data.');
        }
    }
};

// --- HELPERS ---

function capitalize(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
}

function getWeatherEmoji(id) {
    if (id >= 200 && id < 300) return '⚡'; // Thunderstorm
    if (id >= 300 && id < 500) return '🌧️'; // Drizzle
    if (id >= 500 && id < 600) return '☔'; // Rain
    if (id >= 600 && id < 700) return '❄️'; // Snow
    if (id >= 700 && id < 800) return '🌫️'; // Atmosphere (Fog/Mist)
    if (id === 800) return '☀️'; // Clear
    if (id > 800) return '☁️'; // Clouds
    return '🌡️';
}
