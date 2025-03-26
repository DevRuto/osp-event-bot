import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import logger from '../../logger.js';

export const data = new SlashCommandBuilder()
  .setName('submit')
  .setDescription('Submit an item to the event')
  .addStringOption((option) =>
    option.setName('name').setDescription('The name of the item').setRequired(true)
  )
  .addStringOption((option) =>
    option.setName('value').setDescription('The value of the item').setRequired(true)
  )
  .addStringOption((option) =>
    option.setName('image').setDescription('The image link to the item').setRequired(false)
  )
  .addAttachmentOption((option) =>
    option.setName('attachment').setDescription('Attached image of item').setRequired(false)
  );

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  const name = interaction.options.getString('name');
  const value = interaction.options.getString('value');
  const image = interaction.options.getString('image');
  const attachment = interaction.options.getAttachment('attachment');

  const proof = image || attachment?.url;
  if (!proof) {
    await interaction.reply('Please provide an image or attachment as proof of the item.');
    return;
  }

  logger.info(`Item submitted: ${name} - ${value}`);
  await interaction.reply(`Item submitted: ${name} - ${value} - Proof type: ${proof}`);
}
