const { EmbedBuilder } = require('discord.js');
const { getRandomCreamImage } = require('./network/cream_net_fetch');
const { getRandomBigImage } = require('./network/big_net_fetch');
const { getRandomRougeImage } = require('./network/rouge_net_fetch');
const { getRandomSonicImage } = require('./network/sonic_net_fetch');
const { getRandomMetalsonicImage } = require('./network/metalsonic_net_fetch');
const { getRandomAmyImage } = require('./network/amy_net_fetch');
const { getRandomSonicexeImage } = require('./network/sonicexe_net_fetch');
const { getRandomNeometalsonicImage } = require('./network/neo_metalsonic_net_fetch');
const { getRandomTailsImage } = require('./network/tails_net_fetch');
const { handleCreamMessage } = require('./creamai/cream');
const { callAgonyCreamAI } = require('./creamai/agonycream');
const { logError } = require('./logging/infbot_log_main');

const greetedThreads = new Set();

async function sendCharacterImage(
    message,
    fetchFn,
    titleBase,
    color,
    emojiName = null
) {
    try {
        const img = await fetchFn();
        const serverEmoji = emojiName
            ? message.guild?.emojis.cache.find(e => e.name.toLowerCase() === emojiName.toLowerCase())
            : null;
            //Change emoji here later to use one that already exists on the server
        const emojiStr = serverEmoji ? `<:${serverEmoji.name}:${serverEmoji.id}>` : '✨';

        const embed = new EmbedBuilder()
            .setTitle(`${emojiStr} ${titleBase} ${emojiStr}`)
            .setImage(img)
            .setColor(color)
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    } catch (err) {
        const channelName = message.channel?.name || 'DM';
        await logError(
            message.client,
            `Image Fetch Failed - ${titleBase}`,
            `Failed to fetch image for **${message.author.tag}** in **${channelName}**`,
            [
                { name: 'User', value: `${message.author.tag} (${message.author.id})`, inline: true },
                { name: 'Location', value: message.guild ? `${message.guild.name} (#${channelName})` : 'Direct Message', inline: true },
                { name: 'Error', value: err.message || 'Unknown error', inline: false },
                { name: 'Stack', value: (err.stack || 'No stack trace').slice(0, 800), inline: false }
            ]
        );
        console.error(`[Image:${titleBase}]`, err);
        await message.reply(`Oops… couldn't fetch **${titleBase}** right now! 🐾 Try again soon~`);
    }
}

module.exports = {
    help: {
        description: '.help - Show all available commands',
        execute: async (message) => {
            try {
                const commands = Object.entries(module.exports)
                    .filter(([name]) => name !== 'help')
                    .map(([name, cmd]) => ({
                        name: `.${name}`,
                        value: cmd.description || 'No description',
                        inline: false
                    }));

                const embed = new EmbedBuilder()
                    .setTitle('INFBOT Commands ♡')
                    .setColor('#ff0002')
                    .setThumbnail(message.client.user.displayAvatarURL())
                    .setDescription('Here are all the cute commands you can use~')
                    .addFields(commands)
                    .setFooter({ text: `Requested by ${message.author.tag}` });

                await message.channel.send({ embeds: [embed] });
            } catch (err) {
                await logError(
                    message.client,
                    'Help Command Failed',
                    `Failed to generate help embed for ${message.author.tag}`,
                    [{ name: 'Error', value: err.message }]
                );
                await message.reply("Couldn't show the help list… something went hoppy wrong! 🐰");
            }
        }
    },

    // ────────────────────────────────────────────────
    // Character image commands (using shared helper)
    // ────────────────────────────────────────────────
    cream: {
        description: '.cream - Random Cream the Rabbit image',
        execute: (message) => sendCharacterImage(message, getRandomCreamImage, 'Cream The Rabbit', '#ff0002', 'serveradmin')
    },
    big: {
        description: '.big - Random Big the Cat image',
        execute: (message) => sendCharacterImage(message, getRandomBigImage, 'Big the Cat', '#7A4FBF', 'big')
    },
    rouge: {
        description: '.rouge - Random Rouge the Bat image',
        execute: (message) => sendCharacterImage(message, getRandomRougeImage, 'Rouge the Bat', '#FFD700', 'rouge')
    },
    sonic: {
        description: '.sonic - Random Sonic the Hedgehog image',
        execute: (message) => sendCharacterImage(message, getRandomSonicImage, 'Sonic the Hedgehog', '#0066CC', 'sonic')
    },
    metal: {
        description: '.metal - Random Metal Sonic image',
        execute: (message) => sendCharacterImage(message, getRandomMetalsonicImage, 'Metal Sonic', '#A9A9A9', 'metalsonic')
    },
    amy: {
        description: '.amy - Random Amy Rose image',
        execute: (message) => sendCharacterImage(message, getRandomAmyImage, 'Amy Rose', '#FF69B4', 'amy')
    },
    sonicexe: {
        description: '.sonicexe - Random Sonic.EXE image',
        execute: (message) => sendCharacterImage(message, getRandomSonicexeImage, 'Sonic.EXE', '#8B0000', 'sonicexe')
    },
    neometal: {
        description: '.neometal - Random Neo Metal Sonic image',
        execute: (message) => sendCharacterImage(message, getRandomNeometalsonicImage, 'Neo Metal Sonic', '#696969', 'neometalsonic')
    },
    tails: {
        description: '.tails - Random Tails The Fox image',
        execute: (message) => sendCharacterImage(message, getRandomTailsImage, 'Tails The Fox', '#696969', 'tails')
    },

    cat: {
        description: 'Random ASCII cat!',
        execute: (message) => {
            const fs = require('fs');
            const path = require('path');
            const dir = path.join(__dirname, 'ascii');

            try {
                const files = fs.readdirSync(dir).filter(f => /^cat\d+\.txt$/.test(f));
                if (files.length === 0) return message.reply('No cat files found!');

                const randomFile = files[Math.floor(Math.random() * files.length)];
                const cat = fs.readFileSync(path.join(dir, randomFile), 'utf8').trim();

                message.reply(`\`\`\`\n${cat}\n\`\`\``);
            } catch (err) {
                logError(message.client, 'ASCII Cat Failed', 'Could not read ASCII cat files', [
                    { name: 'Error', value: err.message }
                ]);
                message.reply('No ascii dir or error reading cats!');
            }
        }
    },

    reverse: {
        description: 'Reverse text',
        execute: (message) => {
            const text = message.content.slice(9).trim();
            if (!text) return message.reply('Nothing to reverse! Try `.reverse hello`');
            const reversed = text.split('').reverse().join('');
            message.reply(reversed);
        }
    },

    zalgo: {
        description: 'Zalgo text generator',
        execute: (message) => {
            const chars = '\u030d\u030e\u0304\u0305\u033f\u0311\u0306\u0310\u0352\u0357\u0351\u0307\u0308\u0303\u0302\u030a\u0348\u0341\u0344\u034a\u034b\u034c'.split('');
            const text = message.content.slice(6).trim() || 'zalgo';
            const zalgoed = [...text].map(c =>
                c + Array.from({ length: Math.floor(Math.random() * 7) }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
            ).join('');
            message.reply(zalgoed || 'Zalgo ate the text!');
        }
    },

    talk: {
        description: '.talk - Start a long-term chat thread with Cream!',
        execute: async (message) => {
            let thread;
            try {
                thread = await message.channel.threads.create({
                    name: `Cream Chat - ${message.author.username}`,
                    autoArchiveDuration: 1440, // 24 hours
                    reason: 'Chatting with Cream ♡'
                });
            } catch (err) {
                await logError(message.client, 'Thread Creation Failed', `User ${message.author.tag} couldn't create Cream thread`, [
                    { name: 'Error', value: err.message }
                ]);
                return message.reply("Couldn't create chat thread… hop hop");
            }

            // Greeting embed
            try {
                const img = await getRandomCreamImage().catch(() => null);
                const embed = new EmbedBuilder()
                    .setTitle(`Hi ${message.author.username}! Cream is here~`)
                    .setDescription("Just talk to me normally in this thread!\nI'll reply as Cream the Rabbit ♡")
                    .setColor('#ff0002');

                if (img) embed.setImage(img);
                await thread.send({ embeds: [embed] });
            } catch (err) {
                await thread.send("Hi hi~! Cream is listening… (image failed tho...)");
            }

            // Message collector (no time limit – thread lives until archived)
            const collector = thread.createMessageCollector({ filter: m => !m.author.bot });

            collector.on('collect', async (msg) => {
                try {
                    // Optional: one-time greeting if needed (but handler can handle it)
                    if (!greetedThreads.has(thread.id)) {
                        greetedThreads.add(thread.id);
                        await thread.send("Eeee~ hi hi hi!! Cream is bouncing with happiness! What’s on your mind?");
                    }

                    await handleCreamMessage(msg); // assumes it sends the reply itself
                } catch (err) {
                    await logError(message.client, 'Cream AI Error in Thread', `Thread ${thread.id} – msg by ${msg.author.tag}`, [
                        { name: 'User Message', value: msg.content.slice(0, 500) || '[empty]', inline: false },
                        { name: 'Error', value: err.message, inline: false },
                        { name: 'Stack', value: (err.stack || '').slice(0, 800), inline: false }
                    ]);
                    await thread.send("Oopsie… Cream's brain went poof! Try again?");
                }
            });
        }
    },

    agony: {
        description: '.agony - Ask INFBOT to produce unsettling text',
        execute: async (message) => {
            const prompt = message.content.slice(7).trim() || 'Describe a surreal, eerie scenario.';
            try {
                const response = await callAgonyCreamAI(prompt);
                await message.reply(response || '…the void stared back.');
            } catch (err) {
                await logError(message.client, 'Agony Command Failed', `Prompt: "${prompt.slice(0, 200)}..." by ${message.author.tag}`, [
                    { name: 'Error', value: err.message }
                ]);
                await message.reply("INFBOT couldn't think… the darkness is too thick tonight.");
            }
        }
    }
};