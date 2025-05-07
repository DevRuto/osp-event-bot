import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  Collection,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
import logger from '#utils/logger.js';
import express from 'express';
import { EventService } from '#services/eventService.js';
import { SubmissionService } from '#services/submissionService.js';
import { ConfigService } from '#services/configService.js';
import { formatValueOutput } from '#utils/format.js';

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
      logger.info(`Loaded command: ${command.data.name} from ${relativeFile}`);
    } else {
      logger.warn(`Command file ${relativeFile} is missing data or execute function`);
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
      logger.info(`Loaded single event: ${event.name} from ${relativeFile}`);
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      logger.info(`Loaded event: ${event.name} from ${relativeFile}`);
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}

client.login(process.env.DISCORD_TOKEN);

// Start web server
const app = express();

app.use(express.json());
app.post('/api/submit', async (req, res) => {
  const { rsn, name, value, proof } = req.body;

  if (!rsn || !name || !value || !proof) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const currentEvent = await EventService.getActiveEvent();
  if (!currentEvent) {
    return res.status(400).json({ error: 'No active event found' });
  }

  // Try to find the participant
  const participant = await EventService.getUserDetailsByRsn(rsn);
  if (!participant) {
    return res.status(400).json({ error: 'Participant not found' });
  }
  let submission;
  try {
    submission = await SubmissionService.addSubmission(participant.userId, name, value, proof);
    res.status(200).json(submission);
  } catch (error) {
    logger.error('Error adding submission:', error);
    res.status(500).json({ error: 'Failed to create submission.', details: error.message });
  }
  const approvalChannel = await ConfigService.getApprovalChannel(process.env.GUILD_ID);

  // Forward the submission to the approval channel
  const embed = {
    title: 'New Item Submission',
    description: `Name: ${name}\nValue: ${formatValueOutput(parseInt(submission.value))}`,
    image: { url: proof },
    fields: [
      { name: 'Status', value: 'Pending', inline: false },
      { name: 'Proof', value: `[Click to view image](${proof})` },
    ],
    footer: { text: `Submitted by: ${participant.user.username}` },
  };
  embed.image.url = proof;
  // Create approve and deny buttons
  const approve = new ButtonBuilder()
    .setCustomId(`submission_approve_${submission.id}`)
    .setLabel('Approve')
    .setStyle(ButtonStyle.Success);

  const deny = new ButtonBuilder()
    .setCustomId(`submission_deny_${submission.id}`)
    .setLabel('Deny')
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(approve, deny);

  const channel = await client.channels.fetch(approvalChannel);
  await channel.send({
    embeds: [embed],
    components: [row],
  });
});

app.use(express.static('./webapp'));
app.get('*a', (req, res) => {
  res.sendFile(path.resolve('./src/webapp/index.html'), (err) => {
    if (err) {
      res.status(500).send('Error loading the fallback page.');
      logger.error(`Error serving fallback page: ${err.message}`);
    }
  });
});

app.listen(process.env.PORT || 3000, () => {
  logger.info(`Web server is running on port ${process.env.PORT || 3000}`);
});
