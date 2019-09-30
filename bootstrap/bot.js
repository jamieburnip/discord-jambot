'use strict';

const fs = require('fs');
const Discord = require('discord.js');
const bugsnag = require('@bugsnag/js');
const config = require('./../config');
const pkgcnf = require('./../package.json');

const firebase = require('firebase/app');
const admin = require('firebase-admin');
const FieldValue = admin.firestore.FieldValue;
const serviceAccount = require('./../serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://jambot-cccc6.firebaseio.com"
});

const db = admin.firestore();

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
		db.collection('guilds').doc(guildData.id).set({
			guildId: guildData.id,
			guildName: guildData.name,
			guildOwner: guildData.owner.user.username,
			guildOnwerId: guildData.owner.id,
			guildMemberCount: guildData.memberCount
		});
	});

	// when the client is ready, run this code
	// this event will only trigger one time after logging in
	bot.on('ready', async () => {		
		let guildData = bot.guilds.first();
		bot.guilds.forEach(async (guild) => {
			db.collection('guilds').doc(guild.id).get().then((q) => {
				guild.members.forEach(async (member) => {
					q.ref.collection('users').doc(member.user.id).set({
						userId: member.user.id,
						userName: member.user.username,
						userIsBot: member.user.bot,
						userCreated: member.user.createdTimestamp
					});
				});

				if(!q.exists) {
					db.collection('guilds').doc(guildData.id).set({
						guildId: guildData.id,
						guildName: guildData.name,
						guildOwner: guildData.owner.user.username,
						guildOnwerId: guildData.owner.id,
						guildMemberCount: guildData.memberCount,
						guildCreated: guildData.createdTimestamp,
						guildPrefix: '!'
					});
				}
			});
		});

	 	console.log('JamBot up and running...');

		bot.user.setPresence({ status: 'online', game: { name: '!jambot' } });
		// bot.user.setActivity(`!help | 1 by jamie`, { url: 'https://kate.js.org' });
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

		db.collection('messages').doc(message.id).set({
			messageId: message.id,
			messageGuildId: message.guild.id,
			messageContent: message.content,
			messageCreated: message.createdTimestamp
		});

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
			console.error(error);
			await message.reply('there was an error trying to execute that command!');
		}
	});

	// login to Discord with your app's token
	bot.login(config.token);
};
