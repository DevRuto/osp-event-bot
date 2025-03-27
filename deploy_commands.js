import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
import logger from './src/utils/logger.js';

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

const commands = [];
const baseDir = import.meta.dirname;
const commandFiles = await fs.opendir(path.join(baseDir, './src/commands'), { recursive: true });
for await (const commandFile of commandFiles) {
  if (commandFile.isFile() && commandFile.name.endsWith('.js')) {
    const relativeFile = `./${path.relative(baseDir, commandFile.parentPath)}/${commandFile.name}`;
    const command = await import(relativeFile);
    commands.push(command.data.toJSON());
    logger.info(`Loaded command: ${command.data.name} from ${relativeFile}`);
  }
}

const rest = new REST().setToken(DISCORD_TOKEN);
const data = await rest.put(
  // Remove guild id to register global commands
  Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
  { body: commands }
);
logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
