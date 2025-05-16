import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { Router } from 'express';
import { client } from '#discordbot.js';
import { EventService } from '#services/eventService.js';
import { SubmissionService } from '#services/submissionService.js';
import { ConfigService } from '#services/configService.js';
import logger from '#utils/logger.js';
import { formatValueOutput } from '#utils/format.js';

const router = Router();
router.post('/submit', async (req, res) => {
  const { rsn, name, value, proof, self } = req.body;

  if (!rsn || !name || !value || !proof) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const currentEvent = await EventService.getActiveEvent();
  if (!currentEvent) {
    return res.status(400).json({ error: 'No active event found' });
  }

  // Make sure event is within time
  const now = new Date();
  if (now < currentEvent.startDate || now > currentEvent.endDate) {
    return res.status(400).json({ error: 'Event is not active' });
  }

  // Try to find the participant
  const participant = await EventService.getUserDetailsByRsn(rsn);
  if (!participant) {
    return res.status(400).json({ error: 'Participant not found' });
  }
  let submission;
  try {
    submission = await SubmissionService.addSubmission(
      participant.userId,
      name,
      value,
      proof,
      !self
    );
    logger.info(
      `Submission added by ${rsn}: ${submission.id} - ${submission.name} (${submission.value})`
    );
    res.status(200).json(submission);
  } catch (error) {
    logger.error('Error adding submission:', error);
    res.status(500).json({ error: 'Failed to create submission.', details: error.message });
    return;
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
  if (/^https:\/\/.*\.(?:png|jpg|jpeg|gif|webp)(\?.*)?$/i.test(proof)) {
    embed.image.url = proof;
  }
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

export default router;
