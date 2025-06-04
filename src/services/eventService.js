import prisma from '#utils/prisma.js';
import logger from '#utils/logger.js';

export class EventService {
  /**
   * Create a new event in the database
   * @param {String} name - The name of the event
   * @param {String} description - The description of the event
   * @param {String} startDate - (Optional) The start date of the event
   * @param {String} endDate - (Optional) The end date of the event
   * @returns {Promise<import('#utils/prisma/client').Event>}
   */
  static async createEvent(name, description, startDate = undefined, endDate = undefined) {
    // Validate inputs
    if (!name) {
      throw new Error('Event name is required');
    }
    // Create the event
    try {
      const eventData = { name, description, active: false };
      if (startDate) {
        // Ensure startDate is a valid date string
        if (isNaN(Date.parse(startDate))) {
          throw new Error('Invalid start date format');
        }
        eventData.startDate = startDate;
      } else {
        eventData.startDate = new Date().toISOString();
      }
      if (!endDate) {
        // Ensure startDate is a valid date string
        if (isNaN(Date.parse(endDate))) {
          throw new Error('Invalid start date format');
        }
        eventData.endDate = endDate;
      }

      return await prisma.event.create({
        data: eventData,
      });
    } catch (error) {
      logger.error(error, 'Error creating event');
      throw error;
    }
  }

  /**
   * Activate an event by its ID
   * @param {String} eventId - The ID of the event to activate
   * @returns {Promise<import('#utils/prisma/client').Event | boolean>} The activated event or false if activation fails
   * @throws {Error} If activation fails
   */
  static async activateEvent(eventId) {
    try {
      // Deactivate any currently active events
      await prisma.event.updateMany({
        where: { active: true },
        data: { active: false },
      });

      // Activate the specified event
      return await prisma.event.update({
        where: { id: eventId },
        data: { active: true },
      });
    } catch (error) {
      logger.error(error, 'Error activating event');
      return false;
    }
  }

  /**
   * Get the active event
   * @returns {Promise<import('#utils/prisma/client').Event | null>}
   */
  static async getActiveEvent() {
    try {
      // Fetch the active event from the database
      const activeEvent = await prisma.event.findFirst({
        where: {
          active: true,
        },
      });

      if (!activeEvent) {
        logger.warn('No active event found');
        return null;
      }

      logger.info(`Active event found: ${activeEvent.name}`);
      return activeEvent;
    } catch (error) {
      logger.error(error, 'Error fetching active event');
      throw error;
    }
  }

  /**
   * Register a user for an event
   * @param {import('discord.js').GuildMember} member - The Discord member to register
   * @param {String} rsn - The user's RuneScape name (can be comma-delimited) (required)
   * @return {Promise<boolean>} True if registration was successful, false otherwise
   */
  static async registerForActiveEvent(member, rsn) {
    try {
      const activeEvent = await this.getActiveEvent();
      if (!activeEvent) {
        logger.warn('No active event to register for');
        return false;
      }

      // Trim rsn and handle comma-delimited names
      if (rsn) {
        rsn = rsn.trim().toLowerCase();
        if (rsn.includes(',')) {
          rsn = rsn
            .split(',')
            .map((name) => name.trim())
            .join(',');
        }
      } else {
        logger.warn('RSN is required for event registration');
        throw new Error('RSN is required for event registration');
      }

      // Get the list of rsn's registered for the event
      const registeredRsns = await prisma.eventParticipant.findMany({
        where: { eventId: activeEvent.id },
        select: { rsn: true },
      });
      const existingRsns = registeredRsns.flatMap((participant) => participant.rsn.split(','));
      const inputRsns = rsn.split(',').map((name) => name);

      // Check if any of the input RSNs are already registered
      const alreadyRegistered = inputRsns.find((name) => existingRsns.includes(name));
      if (alreadyRegistered) {
        throw new Error(`RSN "${alreadyRegistered}" is already registered for this event.`);
      }

      // Check if the user is already registered
      const existingRegistration = await prisma.eventParticipant.findFirst({
        where: {
          eventId: activeEvent.id,
          userId: member.id,
        },
      });
      if (existingRegistration) {
        // Update the RSN if provided
        if (rsn && existingRegistration.rsn !== rsn) {
          await prisma.eventParticipant.update({
            where: { id: existingRegistration.id },
            data: { rsn },
          });
          logger.info(`User ${member.user.tag} updated RSN for event with ${rsn}`);
        } else {
          logger.info(`User ${member.user.tag} is already registered for the event`);
        }
        return true; // User is already registered
      }

      await prisma.eventParticipant.create({
        data: {
          eventId: activeEvent.id,
          userId: member.id,
          rsn,
        },
      });
      logger.info(`User ${member.user.tag} registered for event`);
      return true;
    } catch (error) {
      logger.error(error, `Error registering user ${member.user.tag} for event`);
      throw error;
    }
  }
}
