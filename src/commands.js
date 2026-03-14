const { EmbedBuilder } = require('discord.js');
const { getRandomCreamImage } = require('./network/cream_net_fetch');

module.exports = {
    hello: {
        description: 'Replies with glitchy bnuuy!',
        execute: (message) => {
            message.reply('bnuuy!');
        }
    },
    roll: {
        description: 'Rolls dice: .roll [NdS] (default 1d6)',
        execute: (message) => {
            const args = message.content.slice(1).trim().split(/\s+/);
            const diceStr = args[1] || '1d6';
            const match = diceStr.match(/(\d+)d(\d+)/);
            if (!match) return message.reply('Format: NdS e.g. 2d20');
            const num = parseInt(match[1]);
            const sides = parseInt(match[2]);
            const rolls = Array.from({ length: num }, () => Math.floor(Math.random() * sides) + 1);
            message.reply(`Rolls: ${rolls.join(', ')} = **${rolls.reduce((a, b) => a + b, 0)}**`);
        }
    },
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
    meme: {
        description: 'A cool ass meme',
        execute: (message) => {
            message.reply('When the code works but you don\'t know why: bruh');
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
                const embed = new EmbedBuilder()
                    .setTitle('Cream the Rabbit!')
                    .setImage(img)
                    .setColor('#FFB6C1');
                await message.channel.send({ embeds: [embed] });
            } catch (err) {
                console.error(err);
                message.reply('Error fetching Cream image!');
            }
        }
    }
};