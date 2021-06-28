import { Message } from 'discord.js';

module.exports = {
  name: '8ball',
  description: '8ball!',
  execute(message: Message, args: string[]) {
    const _ = require('lodash');
    const data = [
      // positive
      'It is certain',
      'It is decidedly so',
      'Without a doubt',
      'Yes definitely',
      'You may rely on it',
      'As I see it, yes',
      'Most likely',
      'Outlook good',
      'Yes',
      'Signs point to yes',
      // 'neutral'
      'Reply hazy try again',
      'Ask again later',
      'Better not tell you now',
      'Cannot predict now',
      'Concentrate and ask again',
      // 'negative'
      "Don't count on it",
      'My reply is no',
      'My sources say no',
      'Outlook not so good',
      'Very doubtful',
    ];

    const option = _.nth(data, _.random(data.length));

    // const Discord = require('discord.js');
    // const exampleEmbedd = new Discord.RichEmbed()
    // 	.setColor('#00ffce')
    // 	.setTitle(`${option} :8ball:`)
    // 	.setFooter(message.author.username, message.author.avatarURL);

    message.channel.send(`${option} :8ball:`);
  },
};
