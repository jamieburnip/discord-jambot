import { Message } from "discord.js";

module.exports = {
	name: 'yes',
	description: 'Answer yes.',
	execute(message: Message, args: string[]) {
		message.channel.send({ files: [`https://i.ytimg.com/vi/XvzD65QcCr0/maxresdefault.jpg`] });
	},
};
