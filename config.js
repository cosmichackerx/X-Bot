const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    OWNER_NUMBER: process.env.OWNER_NUMBER || "923367307471",
    PREFIX: process.env.PREFIX || ".",
    SESSION_ID: process.env.SESSION_ID || "session"
};
