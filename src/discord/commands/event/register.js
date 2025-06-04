import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { EventService } from '#services/eventService.js';

export const data = new SlashCommandBuilder()
  .setName('register')
  .setDescription('Register to the active event')
  .addStringOption((option) =>
    option
      .setName('rsn')
      .setDescription('Your RuneScape name (comma delimited for multiple names)')
      .setRequired(true)
  );

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  const rsn = interaction.options.getString('rsn');
  try {
    const success = await EventService.registerForActiveEvent(interaction.member, rsn);
    if (success) {
      await interaction.reply({
        content: `You have successfully registered for the event with RSN(s): ${rsn}`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content:
          'Failed to register for the event. The event may not be active or you may have already registered.',
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error('Error during event registration:', error);
    await interaction.reply({
      content: `Unable to register for the event. Error: ${error.message}`,
      ephemeral: true,
    });
  }
}
