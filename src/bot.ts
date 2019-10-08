import fs from 'fs';
// const Discord = require('discord.js');
import Discord from 'discord.js';
// const bugsnag = require('@bugsnag/js');
// const config = require('./../config');
import config from 'config';
// const pkgcnf = require('./../package.json');

// create a new Discord bot client
const bot = new Discord.Client();
// bot.commands = new Discord.Collection();


// login to Discord with your app's token
bot.login(config.token);