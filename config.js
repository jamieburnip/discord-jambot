require('dotenv').config();

module.exports = {
	'prefix': '!',
	'token': process.env.DISCORD_TOKEN,
	'meaning_of_life': 42,
	'passwords_array': ['please', 'dont', 'hack', 'me'],
	'secret_passcodes': {
		'bank': 1234,
		'home': 4321,
	},
};
