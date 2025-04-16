import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { EventService } from '#services/eventService.js';
import logger from '#utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('register')
  .setDescription('Register yourself to the event')
  .addStringOption((option) =>
    option.setName('rsn').setDescription('Your RuneScape name').setRequired(true)
  )
  .addStringOption((option) =>
    option.setName('duo').setDescription("Your duo partner's RuneScape name").setRequired(false)
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
  const duo = interaction.options.getString('duo');
  if (!rsn) {
    await interaction.reply({
      content: 'Please provide a valid RuneScape name.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  try {
    if (await EventService.isUserRegistered(interaction.user.id)) {
      await EventService.updateUserRsn(interaction.user.id, rsn, duo);
      await interaction.reply({
        content: 'You are already registered for the event. Updating details',
        flags: MessageFlags.Ephemeral,
      });
      logger.info(
        `User ${interaction.user.username} (${interaction.user.id}) updated their RSN to ${rsn} for event ${activeEvent.name}`
      );
      return;
    } else {
      await EventService.registerUserToEvent(interaction.user.id, rsn, duo);
      await interaction.reply({
        content:
          `You have successfully registered for the event with RSN: ${rsn}.` +
          (duo ? `Make sure your duo partner is registered with RSN: ${duo}.` : ''),
        flags: MessageFlags.Ephemeral,
      });
      logger.info(
        `User ${interaction.user.username} (${interaction.user.id}) registered for event ${activeEvent.name} with RSN ${rsn}`
      );
    }
  } catch (error) {
    console.log(error);
    logger.error('Error registering user to event', error);
    await interaction.reply({
      content: 'An error occurred while registering you for the event. Please try again later.',
      flags: MessageFlags.Ephemeral,
    });
  }
}
