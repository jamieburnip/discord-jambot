import fs from 'fs';
import Discord, { Guild } from 'discord.js';
import bugsnag from '@bugsnag/js';

import config from './Config';
// const config = require('./../config');
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
const bot = new Discord.Client();
const commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands')
    .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./../commands/${file}`);
    commands.set(command.name, command);
}

bot.on('guildCreate', async guildData => {
    // db.collection('guilds').doc(guildData.id).set({
    // 	guildId: guildData.id,
    // 	guildName: guildData.name,
    // 	guildOwner: guildData.owner.user.username,
    // 	guildOnwerId: guildData.owner.id,
    // 	guildMemberCount: guildData.memberCount
    // });
});

// when the client is ready, run this code
// this event will only trigger one time after logging in
bot.on('ready', async () => {
    let guildData = bot.guilds.first();
    let guidInDb: any = true;

    await db.oneOrNone('SELECT * FROM guilds WHERE guild_id = ${guildId}', {
        guildId: guildData.id
    }).then((guild: Guild) => guidInDb = guild).catch((err: any) => console.log(err)); // logger.error(err)

    console.log(!guidInDb);
    if (!guidInDb) {
        db.none('INSERT INTO guilds(guild_id, guild_name, guild_owner, guild_owner_id, guild_created, guild_prefix, created_at, updated_at) VALUES(${guildId}, ${guildName}, ${guildOwner}, ${guildOwnerId}, ${guildCreated}, ${guildPrefix}, now(), now())', {
            guildId: guildData.id,
            guildName: guildData.name,
            guildOwner: guildData.owner.user.username,
            guildOwnerId: guildData.owner.id,
            guildCreated: guildData.createdTimestamp,
            guildPrefix: '!'
        });
    }
    // q.ref.collection('users').doc(member.user.id).set({
    // 	userId: member.user.id,
    // 	userName: member.user.username,
    // 	userIsBot: member.user.bot,
    // 	userCreated: member.user.createdTimestamp
    // });

    // logger.info('JamBot up and running...');
    console.log('JamBot up and running...');

    bot.user.setActivity('!jambot', {
        url: 'https://jamieburnip.co.uk',
        type: 1,
    });
    // bot.user.setUsername('test-jambot');

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

    // const channel = bot.channels.find(ch => ch.name === 'general');

    // if (channel) {
    // Send the message, mentioning the member
    // channel.send(exampleEmbed);

    // 			channel.send(`= STATISTICS =
    // • Mem Usage  :: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
    // • Users      :: ${bot.users.size.toLocaleString()}
    // • Servers    :: ${bot.guilds.size.toLocaleString()}
    // • Channels   :: ${bot.channels.size.toLocaleString()}`, {code: "asciidoc"});
    // }
});

// login to Discord with your app's token
bot.login(config.token);