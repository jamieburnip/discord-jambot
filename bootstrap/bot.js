'use strict';

const fs = require('fs');
const moment = require('moment');
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
		// bot.user
		// 	.setAvatar('https://ih0.redbubble.net/image.625133945.6850/poster,840x830,f8f8f8-pad,750x1000,f8f8f8.u10.jpg')
		// 	.then(() => {
		// 		console.log('avatart updated!');
		// 	}).catch(err => {
		// 		console.log(err);
		//	});
		let guildData = bot.guilds.first();
		bot.guilds.forEach(async (guild) => {
			db.collection('guilds').doc(guild.id).get().then((q) => {
				guild.members.forEach(async (member) => {
					// q.ref.collection('users').doc(member.user.id).set({
					// 	userId: member.user.id,
					// 	userName: member.user.username,
					// 	userIsBot: member.user.bot,
					// 	userCreated: member.user.createdTimestamp,
					// 	points: 0,
					// 	pointsUpdatedTimestamp: moment().unix()
					// });
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

	function addPoints(message) {
		// var a = moment();
		// var b = moment().subtract(10, 'seconds');
		// // var b = moment().add(10, 'seconds');

		// console.log(
		// 	b.isSameOrAfter(a),
		// 	a.unix()
		// );

		if (message.author.bot) return;

		let recentlyUpdatedPoints = false;

		const userRef = db.collection('guilds').doc(message.guild.id).collection('users').doc(message.author.id);
		
		userRef.get().then((user) => {
			console.log(user.pointsUpdatedTimestamp);
		});

		if (recentlyUpdatedPoints) return;

		const pointsToIncrement = FieldValue.increment(
			Math.floor(Math.random() * 15) + 1
		);

		userRef.update({
			points: pointsToIncrement,
			pointsUpdatedTimestamp: moment().unix()
		});

		message.channel.send(`You gained points!`);
		
		// .get().then((guildQuery) => {
		// 	guildQuery.ref.collection('users').doc(message.author.id).update({

		// 	});
		// 	// guildQuery.ref.collection('users').doc(message.author.id).get().then((userQuery) => {
		// 		// userQuery.ref.collection('points').get().then(pointQuery => {
		// 			// console.log(pointQuery);
		// 		// });
		// 	// });
		// });
	}

	bot.on('message', async message => {
		let prefix = config.prefix;

		addPoints(message);

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
