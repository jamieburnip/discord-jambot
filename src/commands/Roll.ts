'use strict';

import _ from "lodash";
import { DiceRoller } from "rpg-dice-roller";

module.exports = {
	name: 'roll',
	description: 'Dice roller.',
	args: true,
	execute(message, args) {
		// create a new instance of the DiceRoller
		const diceRoller = new DiceRoller();

		// roll the dice
		// diceRoller.roll('4d20');
		// diceRoller.roll(args[0]);

		// get the latest dice rolls from the log
		// let latestRoll = diceRoller.log.shift();
		let roll = _.flatten(diceRoller.roll(args[0]).export(2).rolls);
		let rollSum = _.sum(roll);

		// output the latest roll - it has a toString method for nice output
		// console.log(diceRoller.log);

		message.channel.send(`${rollSum} (${roll}) :game_die:`);
	},
};
