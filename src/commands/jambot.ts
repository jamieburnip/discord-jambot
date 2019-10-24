import { Message } from "discord.js";

import config from './../Config';

module.exports = {
	name: 'jambot',
	description: 'List all of my commands or info about a specific command.',
	aliases: ['help', 'commands'],
	usage: '[command name]',
	cooldown: 5,
	execute(message: Message, args: string[]) {
		const data = [];
		const { commands }: any = message.client;

		if (!args.length) {
			data.push('Here\'s a list of all my commands:');
			data.push(commands.map((command: any) => command.name).join(', '));
			data.push(
				`\nYou can send \`${config.prefix}jambot [command name]\` to get info on a specific command!`);

			return message.author.send(data, { split: true })
				.then(() => {
					if (message.channel.type === 'dm') return;
					message.reply('I\'ll DM you hun :wink:');
				})
				.catch(error => {
					console.error(`Could not send help DM to ${message.author.tag}.\n`,
						error);
					message.reply(
						'Huh? It looks like I can\'t DM you! Do you have DMs disabled?');
				});
		}
	},
};
