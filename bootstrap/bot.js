'use strict';

const fs = require('fs');
const Discord = require('discord.js');
const bugsnag = require('@bugsnag/js');
const config = require('./../config');
const pkgcnf = require('./../package.json');

const winston = require('winston');

let logPrefix = new Date().toISOString().substring(0, 10);

const logger = winston.createLogger({
	level: 'info',
	timestamps: true,
	format: winston.format.json(),
	defaultMeta: { service: 'user-service' },
	transports: [
	  //
	  // - Write to all logs with level `info` and below to `combined.log` 
	  // - Write all logs error (and below) to `error.log`.
	  //
	  new winston.transports.File({ filename: `storage/logs/${logPrefix}-error.log`, level: 'error' }),
	  new winston.transports.File({ filename: `storage/logs/${logPrefix}-combined.log` })
	]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// 
if (process.env.NODE_ENV !== 'production') {
	logger.add(new winston.transports.Console({
		format: winston.format.simple()
	}));
}

const pgp = require('pg-promise')();
// const _host = 'ec2-54-247-72-30.eu-west-1.compute.amazonaws.com:5432';
// const _database = 'd4oihl2688rohc';
// const _user = 'uzgxxfcndrpwnf';
// const _password = '0220e67f52e4209b3df20c4ab9fc490f75f7eb31d845f32aef1b3be2db444db9';
function dbConnect(){
	if (process.env.DATABASE_URL) {
		return pgp(process.env.DATABASE_URL);
	}
	
	return pgp(`postgres://${config.database.user}:${config.database.password}@${config.database.host}:${config.database.port}/${config.database.database}`);
}

const db = dbConnect();

// db.query('SELECT * FROM guilds').then((eh) => {
// 	console.log(eh);
// }).catch(err => logger.error(err.message));

module.exports.run = async => {
	bugsnag({
		apiKey: process.env.BUGSNAG_TOKEN,
		appVersion: pkgcnf.version,
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
		let guidInDb;

		await db.oneOrNone('SELECT * FROM guilds WHERE guild_id = ${guildId}', {
			guildId: guildData.id
		}).then(guild => guidInDb = guild).catch(err => logger.error(err));

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

		logger.info('JamBot up and running...');

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

		const channel = bot.channels.find(ch => ch.name === 'general');

		if (channel) {
			// Send the message, mentioning the member
			// channel.send(exampleEmbed);

// 			channel.send(`= STATISTICS =
// • Mem Usage  :: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
// • Users      :: ${bot.users.size.toLocaleString()}
// • Servers    :: ${bot.guilds.size.toLocaleString()}
// • Channels   :: ${bot.channels.size.toLocaleString()}`, {code: "asciidoc"});
		}
	});

	bot.on('message', async message => {
		let prefix = config.prefix;

		// db.collection('messages').doc(message.id).set({
		// 	messageId: message.id,
		// 	messageGuildId: message.guild.id,
		// 	messageContent: message.content,
		// 	messageCreated: message.createdTimestamp
		// });

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

			return await message.channel.send(reply);
		}

		try {
			await command.execute(message, args);
		} catch (error) {
			logger.error(error);
			await message.reply('there was an error trying to execute that command!');
		}
	});

	// login to Discord with your app's token
	bot.login(config.token);
};
