import { Events, MessageFlags, ChatInputCommandInteraction } from 'discord.js';
import logger from '#utils/logger.js';

export const name = Events.InteractionCreate;
/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      if (interaction.isAutocomplete()) {
        await command.autocomplete(interaction);
      } else {
        await command.execute(interaction);
      }
    } catch (error) {
      logger.error(error);
      await interaction.reply({
        content: 'There was an error while executing this command!',
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  if (interaction.isAutocomplete()) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      logger.error(error);
      await interaction.reply({
        content: 'There was an error while executing this command!',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
