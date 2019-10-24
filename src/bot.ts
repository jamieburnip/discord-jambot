import fs from 'fs';
import Discord, { Guild, Channel, Collection, Message } from 'discord.js';
import bugsnag from '@bugsnag/js';

import config from './Config';
const pkgcnf = require('./../package.json');

const pgp = require('pg-promise')();
function dbConnect() {
    if (process.env.DATABASE_URL) {
        return pgp(process.env.DATABASE_URL);
    }

    return pgp(`postgres://${config.database.user}:${config.database.password}@${config.database.host}:${config.database.port}/${config.database.database}`);
}
const db = dbConnect();

// create a new Discord bot client
const bot:{[k: string]: any} = new Discord.Client();
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./../commands/${file}`);
    bot.commands.set(command.name, command);
}

// bot.on('guildCreate', async guildData => {
    // db.collection('guilds').doc(guildData.id).set({
    	// guildId: guildData.id,
    // 	guildName: guildData.name,
    // 	guildOwner: guildData.owner.user.username,
    // 	guildOnwerId: guildData.owner.id,
    // 	guildMemberCount: guildData.memberCount
    // });
// });

interface iGuild {
    id: number,
    guild_id: string,
    guild_name: string,
    guild_owner: string,
    guild_owner_id: string,
    guild_created: string,
    guild_prefix: string,
    created_at: string,
    updated_at: string,
}

async function findGuildById(id: string){
    let returnGuild;

    await db.oneOrNone('SELECT * FROM guilds WHERE guild_id = ${guildId}', {
        guildId: id
    }).then((guild: iGuild) => {
        if (guild) {
            // guildInDb = true;
            // guild.guild_prefix;
        }

        returnGuild = guild;
    });

    return returnGuild;
}

// when the client is ready, run this code
// this event will only trigger one time after logging in
bot.on('ready', async () => {
    let guildData: Guild = bot.guilds.first();
    let guildInDb: boolean = true;

    // console.log(findGuildById(guildData.id));

    if (!guildInDb) {
        db.none('INSERT INTO guilds(guild_id, guild_name, guild_owner, guild_owner_id, guild_created, guild_prefix, created_at, updated_at) VALUES(${guildId}, ${guildName}, ${guildOwner}, ${guildOwnerId}, ${guildCreated}, ${guildPrefix}, now(), now())', {
            guildId: guildData.id,
            guildName: guildData.name,
            guildOwner: guildData.owner.user.username,
            guildOwnerId: guildData.owner.id,
            guildCreated: guildData.createdTimestamp,
            guildPrefix: '!'
        });
    }
    
    console.log('JamBot up and running...');

    bot.user.setActivity('!jambot', {
        url: 'https://jamieburnip.co.uk',
        type: 1,
    });
});


bot.on('message', async (message: Message) => {
    let prefix = config.prefix;

    // db.collection('messages').doc(message.id).set({
    // 	messageId: message.id,
    // 	messageGuildId: message.guild.id,
    // 	messageContent: message.content,
    // 	messageCreated: message.createdTimestamp
    // });

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args: string[] = message.content.slice(prefix.length).split(' ');
    const commandName: string = args.shift()!.toLowerCase();

    if (!bot.commands.has(commandName)) return;

    const command: any = bot.commands.get(commandName);

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
    //     // logger.error(error);
        await message.reply('there was an error trying to execute that command!');
    }
});

// login to Discord with your app's token
bot.login(config.token);