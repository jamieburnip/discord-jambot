const { SlashCommandBuilder } = require('discord.js');
const rpgDiceRoller = require('@dice-roller/rpg-dice-roller');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Roll the dice...')
    .addStringOption((option) =>
      option
        .setName('dice')
        .setDescription('Which dice would you like to roll?')
        .setRequired(true)
        .addChoices(
          { name: 'D20', value: 'd20' },
          { name: 'D12', value: 'd12' },
          { name: 'D10', value: 'd10' },
          { name: 'D8', value: 'd8' },
          { name: 'D6', value: 'd6' },
          { name: 'D4', value: 'd4' },
        ),
    )
    .addStringOption((option) =>
      option
        .setName('times')
        .setDescription('How many times should I roll this dice?'),
    ),
  async execute(interaction) {
    const diceOpt = interaction.options.getString('dice');
    const times = interaction.options.getString('times') ?? '1';
    const optStr = `${times}${diceOpt}`;

    const diceRoller = new rpgDiceRoller.DiceRoller();
    const roll = diceRoller.roll(optStr);

    await interaction.reply(`You rolled: :game_die: ${roll}`);
  },
};
