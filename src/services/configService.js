import prisma from '#utils/prisma.js';
import logger from '#utils/logger.js';
import { SettingTypes } from '#constants/settings.js';

export class ConfigService {
  /**
   * Get the approval channel for a guild
   * @param {String} guildId - A Discord guild ID
   * @returns {Promise<String>} The approval channel ID
   */
  static async getApprovalChannel(guildId) {
    try {
      const config = await prisma.config.findUnique({
        where: { guildId, settingType: SettingTypes.APPROVAL_CHANNEL },
      });

      return config?.value;
    } catch (error) {
      logger.error(`Error getting approval channel for guild ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Set the approval channel for a guild
   * @param {String} guildId - A Discord guild ID
   * @param {String} channelId - The approval channel ID
   * @returns {Promise<void>}
   */
  static async setApprovalChannel(guildId, channelId) {
    try {
      const existingConfig = await prisma.config.findUnique({
        where: { guildId, settingType: SettingTypes.APPROVAL_CHANNEL },
      });

      if (existingConfig) {
        await prisma.config.update({
          where: { guildId, settingType: SettingTypes.APPROVAL_CHANNEL },
          data: { value: channelId },
        });
      } else {
        await prisma.config.create({
          data: {
            guildId,
            settingType: SettingTypes.APPROVAL_CHANNEL,
            value: channelId,
          },
        });
      }
    } catch (error) {
      logger.error(`Error setting approval channel for guild ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Get the admin role for a guild
   * @param {String} guildId - A Discord guild ID
   * @returns {Promise<String>} The admin role ID
   */
  static async getAdminRole(guildId) {
    try {
      const config = await prisma.config.findUnique({
        where: { guildId, settingType: SettingTypes.ADMIN_ROLE },
      });

      return config?.value;
    } catch (error) {
      logger.error(`Error getting admin role for guild ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Set the admin role for a guild
   * @param {String} guildId - A Discord guild ID
   * @param {String} roleId - The admin role ID
   * @returns {Promise<void>}
   */
  static async setAdminRole(guildId, roleId) {
    try {
      const existingConfig = await prisma.config.findUnique({
        where: { guildId, settingType: SettingTypes.ADMIN_ROLE },
      });

      if (existingConfig) {
        await prisma.config.update({
          where: { guildId, settingType: SettingTypes.ADMIN_ROLE },
          data: { value: roleId },
        });
      } else {
        await prisma.config.create({
          data: {
            guildId,
            settingType: SettingTypes.ADMIN_ROLE,
            value: roleId,
          },
        });
      }
    } catch (error) {
      logger.error(`Error setting admin role for guild ${guildId}:`, error);
      throw error;
    }
  }
}
