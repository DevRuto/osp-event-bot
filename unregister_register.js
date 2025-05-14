import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const rest = new REST().setToken(token);

try {
  const commands = await rest.get(Routes.applicationGuildCommands(clientId, guildId));
  const command = commands.find((cmd) => cmd.name === 'register');

  if (command) {
    await rest.delete(Routes.applicationGuildCommand(clientId, guildId, command.id));
    console.log(`Deleted command: ${command.name}`);
  } else {
    console.log('Command not found.');
  }
} catch (error) {
  console.error('Error deleting command:', error);
}
