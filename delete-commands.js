const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config');

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`Deleting all application (/) commands.`);

    await rest.put(Routes.applicationCommands(clientId), {
      body: [],
    });

    console.log('Successfully deleted all application commands.');
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
