require('dotenv').config();

module.exports = {
	prefix: '!',
	token: process.env.DISCORD_TOKEN,
	database : {
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		database: process.env.DB_NAME,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
	}
};
