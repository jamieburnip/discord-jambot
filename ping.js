const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  async execute(interaction) {
    //     // await interaction.reply('Pong!');
    //     // await interaction.reply('Pong!');
    //     // await wait(2000);
    //     // await interaction.editReply('Pong again!');

    //     await interaction.deferReply();
    //     await wait(4000);
    //     await interaction.editReply('Pong!');

    await interaction.reply('Pong!..');
  },
};
