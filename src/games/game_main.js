const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const game = require('./games/game_main');

module.exports = {
    game: {
        description: '.game - simple player actions',
        execute: async (message) => {
            try {
                // Add player to ensure they exist
                game.addPlayer(message.author.id);
                const player = game.players.get(message.author.id);

                // Build buttons for actions
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('heal')
                            .setLabel('Heal')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('status')
                            .setLabel('Check Status')
                            .setStyle(ButtonStyle.Primary)
                    );

                // Embed showing current player info
                const embed = new EmbedBuilder()
                    .setTitle(`${message.author.username}'s Game`)
                    .setDescription('Click a button to perform an action')
                    .addFields(
                        { name: 'HP', value: `${player.hp}/${player.maxHp}`, inline: true }
                    )
                    .setColor('#ff0002');

                const sentMessage = await message.reply({ embeds: [embed], components: [row] });

                // Create a collector for button clicks
                const collector = sentMessage.createMessageComponentCollector({ time: 60000 });

                collector.on('collect', async interaction => {
                    if (interaction.user.id !== message.author.id) {
                        return interaction.reply({ content: "This isn't your game!", ephemeral: true });
                    }

                    const cmd = interaction.customId; // 'heal' or 'status'
                    const response = game.handleCommand(message.author.id, cmd, []);

                    // Update embed with new info
                    const updatedPlayer = game.players.get(message.author.id);
                    const updatedEmbed = EmbedBuilder.from(embed)
                        .spliceFields(0, 1, { name: 'HP', value: `${updatedPlayer.hp}/${updatedPlayer.maxHp}`, inline: true });

                    await interaction.update({ content: response, embeds: [updatedEmbed], components: [row] });
                });

                collector.on('end', () => {
                    sentMessage.edit({ components: [] }).catch(() => {});
                });

            } catch (err) {
                console.error('[Game] Interactive command failed:', err);
                await message.reply("Something went wrong with the game.");
            }
        }
    }
};