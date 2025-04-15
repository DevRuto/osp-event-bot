import prisma from '#utils/prisma.js';
import logger from '#utils/logger.js';

export class TeamService {
  /**
   * Create a new team in the database
   * @param {String} leaderId - (Optional) The ID of the team leader
   * @param {String} name - The name of the team
   * @param {String} description - The description of the team
   * @returns {Promise<void>}
   */
  static async createTeam(leaderId, name, description) {
    // Validate inputs
    if (!name || !leaderId) {
      throw new Error('Team name and leader id is required');
    }
    // Create the team
    try {
      await prisma.team.create({
        data: {
          name,
          description,
          leader: {
            connect: {
              discordId: leaderId,
            },
          },
        },
      });
    } catch (error) {
      logger.error('Error creating team', error.message);
      throw error;
    }
  }

  /**
   * Get all teams
   * @returns {Promise<import('@prisma/client').Team[]>} An array of teams
   */
  static async getTeams() {
    try {
      const teams = await prisma.team.findMany({
        orderBy: {
          name: 'asc',
        },
      });
      return teams;
    } catch (error) {
      logger.error('Error getting teams', error);
      throw error;
    }
  }

  /**
   * Delete a team by ID
   * @param {String} teamId - The ID of the team
   * @returns {Promise<void>}
   */
  static async deleteTeam(teamId) {
    try {
      await prisma.team.delete({
        where: {
          id: teamId,
        },
      });
    } catch (error) {
      logger.error('Error deleting team', error);
      throw error;
    }
  }

  /**
   * Get a team by ID
   * @param {String} teamId - The ID of the team
   * @returns {Promise<import('@prisma/client').Team>} The team object
   */
  static async getTeamById(teamId) {
    try {
      const team = await prisma.team.findUnique({
        where: {
          id: teamId,
        },
      });
      if (!team) {
        throw new Error('Team not found');
      }
      return team;
    } catch (error) {
      logger.error('Error getting team by ID', error);
      throw error;
    }
  }
  /**
   * Update a team by ID
   * @param {String} teamId - The ID of the team
   * @param {String} leaderId - The ID of the team leader
   * @param {Object} data - The data to update
   * @returns {Promise<import('@prisma/client').Team>} The updated team object
   */
  static async updateTeam(teamId, leaderId, name, description) {
    const updateData = {};
    try {
      if (leaderId) {
        updateData.leader = {
          connect: {
            discordId: leaderId,
          },
        };
      }
      if (name) updateData.name = name;
      if (description) updateData.description = description;

      return await prisma.team.update({
        where: {
          id: teamId,
        },
        data: updateData,
      });
    } catch (error) {
      logger.error('Error updating team', error);
      throw error;
    }
  }
}
