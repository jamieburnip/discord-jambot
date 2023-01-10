import { Message } from 'discord.js';
import _flatten from 'lodash/flatten';
import _sum from 'lodash/sum';
import { DiceRoller } from 'rpg-dice-roller';

module.exports = {
  name: 'roll',
  description: 'Dice roller.',
  args: true,
  execute(message: Message, args: string[]) {
    // create a new instance of the DiceRoller
    const diceRoller = new DiceRoller();

    // roll the dice
    diceRoller.roll('4d20');
    diceRoller.roll(args[0]);

    // get the latest dice rolls from the log
    let latestRoll = diceRoller.log.shift();

    // TODO: DON'T FORGET ABOUT THIS ERROR
    const roll = _flatten(diceRoller.roll(args[0]).export(2).rolls);
    const rollSum = _sum(roll);

    // output the latest roll - it has a toString method for nice output
    console.log(diceRoller.log);
    message.channel.send(`${rollSum} (${roll}) :game_die:`);
  },
};
