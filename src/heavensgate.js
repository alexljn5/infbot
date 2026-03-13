require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent  // make sure this is enabled in portal
    ]
});

if (!process.env.TOKEN) {
    console.error('No token found!');
    process.exit(1);
}

client.login(process.env.TOKEN).catch(err => {
    console.error('Login failed:', err.message);
    process.exit(1);
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});