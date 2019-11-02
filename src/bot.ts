require('dotenv').config();

import fs from 'fs';
import { Client, Guild, Channel, Collection, Message } from 'discord.js';
import cron from 'node-cron';

import config from './config/bot';
const pkgcnf = require('./../package.json');

require('@bugsnag/js')({
    apiKey: process.env.BUGSNAG_TOKEN,
    appVersion: pkgcnf.version,
    appType: 'bot',
    releaseStage: process.env.APP_ENV,
});

// create a new Discord bot client
const discord = new Client();
const commands = new Collection();
const commandFiles = fs.readdirSync(`${__dirname}/commands`);

for (const file of commandFiles) {
    const command = require(`${__dirname}/commands/${file}`);
    commands.set(command.name, command);
}

const setActivity = (activity: string) => {
    discord.user.setActivity(activity, {
        url: 'https://jamieburnip.co.uk',
        type: 1,
    });
}

const setDefaultActivity = () => {
    setActivity('!jambot');
}

// when the client is ready, run this code
// this event will only trigger one time after logging in
discord.on('ready', async () => {
    console.log('JamBot up and running...');

    setDefaultActivity();

    cron.schedule('* * * * * *', () => {
        // discord.users.get(config.developerId)!.send('hi')
    });

    cron.schedule('0 * * * *', () => {
        setActivity('Ding! Dong!');

        setTimeout(() => {
            setDefaultActivity();
        }, 5 * 1000);
    }, {
        scheduled: true,
        timezone: 'Europe/London'
    });
});


discord.on('message', async (message: Message) => {
    let prefix = config.prefix;

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args: string[] = message.content.slice(prefix.length).split(' ');
    const commandName: string = args.shift()!.toLowerCase();

    if (!commands.has(commandName)) return;

    const command: any = commands.get(commandName);

    if (command.args && !args.length) {
        let reply: string = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return await message.channel.send(reply);
    }

    try {
        console.log(message, command, args);
        await command.execute(message, args);
    } catch (error) {
        // logger.error(error);
        await message.reply('there was an error trying to execute that command!');
    }
});

// login to Discord with your app's token
discord.login(config.token);