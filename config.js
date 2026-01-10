const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    // Basic Owner configuration
    // Reads from .env, falls back to string if missing
    OWNER_NUMBER: process.env.OWNER_NUMBER || "923133332240", 
    PREFIX: process.env.PREFIX || ".",
    
    // Session folder name
    SESSION_ID: "session"
};
