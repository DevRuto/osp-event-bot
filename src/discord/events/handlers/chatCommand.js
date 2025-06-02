import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function handle(interaction) {
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(error);
    await interaction.reply({
      content: 'There was an error while executing this command!',
      flags: MessageFlags.Ephemeral,
    });
  }
}
