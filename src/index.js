import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Load commands
client.commands = new Collection();
const baseDir = import.meta.dirname;
const commandFiles = await fs.opendir(path.join(baseDir, 'commands'), { recursive: true });
for await (const commandFile of commandFiles) {
  if (commandFile.isFile() && commandFile.name.endsWith('.js')) {
    const relativeFile = `./${path.relative(baseDir, commandFile.parentPath)}/${commandFile.name}`;
    const command = await import(relativeFile);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      console.log(`Loaded command: ${command.data.name} from ${relativeFile}`);
    } else {
      console.log(`Command file ${relativeFile} is missing data or execute function`);
    }
  }
}

// Register events
const eventFiles = await fs.opendir(path.join(baseDir, 'events'), { recursive: true });
for await (const eventFile of eventFiles) {
  if (eventFile.isFile() && eventFile.name.endsWith('.js')) {
    const relativeFile = `./${path.relative(baseDir, eventFile.parentPath)}/${eventFile.name}`;
    const event = await import(relativeFile);
    if (event.once) {
      console.log(`Loaded single event: ${event.name} from ${relativeFile}`);
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      console.log(`Loaded event: ${event.name} from ${relativeFile}`);
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}

client.login(process.env.DISCORD_TOKEN);
