const fs = require('fs');
const Discord = require('discord.js');
const bugsnag = require('@bugsnag/js');
const { prefix, token } = require('./../config');

import { prefix, token } from "./../Config"

export default class Bot {
    run(): void {
        bugsnag({
            apiKey: process.env.BUGSNAG_TOKEN,
            // appVersion: '0.1.0',
            appType: 'bot',
            releaseStage: process.env.APP_ENV,
        });
    
        // create a new Discord bot client
        const bot = new Discord.Client();
        bot.commands = new Discord.Collection();
        const commandFiles = fs.readdirSync('./commands')
            .filter(file => file.endsWith('.js'));
    
        for (const file of commandFiles) {
            const command = require(`./../commands/${file}`);
            bot.commands.set(command.name, command);
        }
    
        // when the client is ready, run this code
        // this event will only trigger one time after logging in
        bot.once('ready', () => {
            console.log('JamBot up and running...');
    
            bot.user.setPresence({ status: 'online', game: { name: '!jambot' } });
    
            // const exampleEmbed = new Discord.RichEmbed()
            // 	.setColor('#0099ff')
            // 	.setTitle('Some title')
            // 	.setURL('https://discord.js.org/')
            // 	.setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png',
            // 		'https://discord.js.org')
            // 	.setDescription('Some description here')
            // 	.setThumbnail('https://i.imgur.com/wSTFkRM.png')
            // 	.addField('Regular field title', 'Some value here')
            // 	.addBlankField()
            // 	.addField('Inline field title', 'Some value here', true)
            // 	.addField('Inline field title', 'Some value here', true)
            // 	.addField('Inline field title', 'Some value here', true)
            // 	.setImage('https://i.imgur.com/wSTFkRM.png')
            // 	.setTimestamp()
            // 	.setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
    
            const channel = bot.channels.find(ch => ch.name === 'general');
    
            if (channel) {
                // Send the message, mentioning the member
                // channel.send(exampleEmbed);
            }
        });
    
        bot.on('message', message => {
            if (!message.content.startsWith(prefix) || message.author.bot) return;
    
            const args = message.content.slice(prefix.length).split(' ');
            const commandName = args.shift().toLowerCase();
    
            if (!bot.commands.has(commandName)) return;
    
            const command = bot.commands.get(commandName);
    
            if (command.args && !args.length) {
                let reply = `You didn't provide any arguments, ${message.author}!`;
    
                if (command.usage) {
                    reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
                }
    
                return message.channel.send(reply);
            }
    
            try {
                command.execute(message, args);
            } catch (error) {
                console.error(error);
                message.reply('there was an error trying to execute that command!');
            }
        });
    
        // login to Discord with your app's token
        bot.login(token);
    }
}