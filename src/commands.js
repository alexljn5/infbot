const { EmbedBuilder } = require('discord.js');
const { getRandomCreamImage } = require('./network/cream_net_fetch');
const { getRandomBigImage } = require('./network/big_net_fetch');
const { handleCreamMessage } = require('./creamai/cream');

const greetedThreads = new Set();

module.exports = {
    cat: {
        description: 'Random ASCII cat!',
        execute: (message) => {
            const fs = require('fs');
            const path = require('path');
            const dir = path.join(__dirname, 'ascii');
            let files;
            try {
                files = fs.readdirSync(dir).filter(f => /^cat\d+\.txt$/.test(f));
            } catch {
                return message.reply('No ascii dir!');
            }
            if (files.length === 0) return message.reply('No cat files!');
            const randomFile = files[Math.floor(Math.random() * files.length)];
            let cat;
            try {
                cat = fs.readFileSync(path.join(dir, randomFile), 'utf8').trim();
            } catch {
                return message.reply('Error reading cat!');
            }
            message.reply(`\`\`\`\n${cat}\n\`\`\``);
        }
    },
    reverse: {
        description: 'Reverse text',
        execute: (message) => {
            const text = message.content.slice(9).trim();
            const reversed = text.split(' ').reverse().join(' ');
            message.reply(reversed || 'Nothing to reverse!');
        }
    },
    zalgo: {
        description: 'Zalgo text',
        execute: (message) => {
            const chars = '\u030d\u030e\u0304\u0305\u033f\u0311\u0306\u0310\u0352\u0357\u0351\u0307\u0308\u0303\u0302\u030a\u0348\u0341\u0344\u034a\u034b\u034c'.split('');
            const text = message.content.slice(6).trim() || 'zalgo';
            const zalgoed = [...text].map(c => c + Array.from({ length: Math.floor(Math.random() * 7) }, () => chars[Math.floor(Math.random() * chars.length)]).join('')).join('');
            message.reply(zalgoed);
        }
    },
    cream: {
        description: '.cream - Random Cream the Rabbit image',
        execute: async (message) => {
            try {
                const img = await getRandomCreamImage();

                // Try to find the emoji by name on the server
                const serverEmoji = message.guild?.emojis.cache.find(e => e.name === 'serveradmin');
                const emojiStr = serverEmoji ? `<:${serverEmoji.name}:${serverEmoji.id}>` : '⛓';

                const embed = new EmbedBuilder()
                    .setTitle(`${emojiStr} Cream The Rabbit ${emojiStr}`)
                    .setImage(img)
                    .setColor('#ff0002');

                await message.channel.send({ embeds: [embed] });

            } catch (err) {
                console.error(err);
                message.reply('Error fetching Cream image!');
            }
        }
    },
    big: {
        description: '.big - Random Big the Cat image',
        execute: async (message) => {
            try {
                const img = await getRandomBigImage();

                // Try to find the emoji by name on the server
                const serverEmoji = message.guild?.emojis.cache.find(e => e.name === 'big');
                const emojiStr = serverEmoji ? `<:${serverEmoji.name}:${serverEmoji.id}>` : '';

                const embed = new EmbedBuilder()
                    .setTitle(`${emojiStr} Big the Cat ${emojiStr}`)
                    .setImage(img)
                    .setColor('#7A4FBF');

                await message.channel.send({ embeds: [embed] });

            } catch (err) {
                console.error(err);
                message.reply('Error fetching Big image!');
            }
        }
    },
    talk: {
        description: ".talk - Creates a permanent-ish thread to chat with Cream!",
        execute: async (message) => {
            let thread;
            try {
                thread = await message.channel.threads.create({
                    name: `Cream Chat - ${message.author.username}`,
                    autoArchiveDuration: 1440, // 24 hours
                    reason: "Chatting with Cream",
                });
            } catch (err) {
                console.error("Failed to create thread:", err);
                return message.reply("Could not create a temporary chat thread! Hop hop...");
            }

            let img;
            try { img = await getRandomCreamImage(); } catch { img = null; }

            if (img) {
                const embed = new EmbedBuilder()
                    .setTitle(`Hi ${message.author.username}! Cream is here and listening~`)
                    .setImage(img)
                    .setColor("#ff0002")
                    .setDescription("Just talk to me normally in this thread! I'll reply as Cream the Rabbit ♡");
                await thread.send({ embeds: [embed] });
            } else {
                await thread.send(`Hi ${message.author.username}! Cream is listening…`);
            }

            const { client } = message;
            const listener = async msg => {

                if (msg.channel.id !== thread.id) return;
                if (msg.author.bot) return;

                // Greeting only once
                if (!greetedThreads.has(thread.id)) {
                    greetedThreads.add(thread.id);
                    await thread.send("Hi hi~! Cream is here and super excited to chat! What’s on your mind?");
                    return;
                }

                try {
                    await handleCreamMessage(msg); // handler sends message itself
                } catch (err) {
                    console.error("AI response error in thread:", err);
                    await thread.send("Oopsie… Cream's brain went poof! Try again?");
                }
            };

            const collector = thread.createMessageCollector({
                filter: m => !m.author.bot
            });

            collector.on("collect", async msg => {

                if (!greetedThreads.has(thread.id)) {
                    greetedThreads.add(thread.id);
                    await thread.send("Hi hi~! Cream is here and super excited to chat! What’s on your mind?");
                    return;
                }

                try {
                    await handleCreamMessage(msg);
                } catch (err) {
                    console.error("AI response error:", err);
                    await thread.send("Oopsie… Cream's brain went poof!");
                }
            });

            // Optional: store listener if you want to remove it later
        }
    }
};