require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const command = {
  name: 'ping',
  description: 'Replies with Pong!',
};

client.on('ready', async () => {
  try {
    console.log('Starting OSP Event Bot.');

    const guild = client.guilds.cache.first();
    if (!guild) {
      console.error('No guild found! Make sure the bot is in a server.');
      return;
    }

    await guild.commands.create(command);
    console.log(`Successfully started OSP Event Bot in: ${guild.name}`);
  } catch (error) {
    console.error('Error registering commands:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});

client.login(process.env.DISCORD_TOKEN);
