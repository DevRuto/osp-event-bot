import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { EventService } from '#services/eventService.js';
import logger from '#utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('register')
  .setDescription('Register yourself to the event')
  .addStringOption((option) =>
    option.setName('rsn').setDescription('Your RuneScape name').setRequired(true)
  );

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  const activeEvent = await EventService.getActiveEvent();
  if (!activeEvent) {
    await interaction.reply({
      content: 'There is no active event to register for.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const rsn = interaction.options.getString('rsn');
  if (!rsn) {
    await interaction.reply({
      content: 'Please provide a valid RuneScape name.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  try {
    await EventService.registerUserToEvent(interaction.user.id, rsn);
    await interaction.reply({
      content: `You have successfully registered for the event with RSN: ${rsn}`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.log(error);
    logger.error('Error registering user to event', error);
    await interaction.reply({
      content: 'An error occurred while registering you for the event. Please try again later.',
      flags: MessageFlags.Ephemeral,
    });
  }
}
