import { Events, MessageFlags, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { ConfigService } from '#services/configService.js';
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

  if (interaction.isButton()) {
    const [event, action, id] = interaction.customId.split('_');
    if (event !== 'submission') return;

    // TODO: Update db with the action and id

    // Update embed to include approval status
    const originalEmbed = interaction.message.embeds[0];
    if (!originalEmbed) return;
    const embed = EmbedBuilder.from(originalEmbed); // Convert to EmbedBuilder if not already
    embed.setColor(action === 'approve' ? '#00FF00' : '#FF0000'); // Set color based on action
    const fields = embed.data.fields ?? [];
    const index = fields.findIndex((field) => field.name === 'Status');
    if (index === -1) {
      fields.push({
        name: 'Status',
        value: `${action} by <@${interaction.user.id}>`,
        inline: false,
      });
    } else {
      fields[index].value = `${action} by <@${interaction.user.id}>`;
    }
    embed.setFields(fields);
    await interaction.update({ embeds: [embed] });

    // If approved, submit to accepted channel
    if (action === 'approve') {
      const acceptedChannelId = await ConfigService.getAcceptedChannel(interaction.guildId);
      if (!acceptedChannelId) return;
      const acceptedChannel = await interaction.client.channels.fetch(acceptedChannelId);
      if (acceptedChannel) {
        await acceptedChannel.send({
          embeds: [embed],
        });
      }
    }
  }
}
