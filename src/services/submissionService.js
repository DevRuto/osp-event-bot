import prisma from '#utils/prisma.js';
import { EventService } from '#services/eventService.js';
import { TeamService } from '#services/teamService.js';
import { ImageService } from '#services/imageService.js';
import logger from '#utils/logger.js';
import { parseValueInput } from '#utils/format.js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export class SubmissionService {
  static async addSubmission(discordId, name, value, proofUrl, backup = true) {
    const event = await EventService.getActiveEvent();
    if (!event) {
      throw new Error('No active event found');
    }
    if (!(await EventService.isUserRegistered(discordId))) {
      throw new Error('User is not registered for the event');
    }
    const team = await TeamService.getCurrentTeam(discordId);
    if (!team) {
      throw new Error('User is not part of a team');
    }

    const duplicate = await prisma.submission.findFirst({
      where: { proofUrl, eventId: event.id },
    });
    if (duplicate) {
      throw new Error('That proof has already been submitted.');
    }

    let backupImagePath;
    if (backup) {
      backupImagePath = await ImageService.backupImageUrl(proofUrl);
      if (!backupImagePath) {
        throw new Error('Unable to save the image. Make sure the URL is valid.');
      }
    }

    const parsedValue = parseValueInput(value);
    if (parsedValue === null) {
      throw new Error('Invalid value format. Use numbers with optional k, m, or b suffixes.');
    }
    const cappedValue = Math.min(parsedValue, 200_000_000);
    try {
      const submission = await prisma.submission.create({
        data: {
          name,
          value: cappedValue + '',
          proofUrl: backup ? `${BASE_URL}${backupImagePath}` : proofUrl,
          backupUrl: proofUrl,
          user: {
            connect: {
              id: discordId,
            },
          },
          event: {
            connect: {
              id: event.id,
            },
          },
          team: {
            connect: {
              id: team.id,
            },
          },
        },
      });
      return submission;
    } catch (error) {
      logger.error(`Error adding submission for user ${discordId}:`, error);
      throw error;
    }
  }

  static async approveSubmission(submissionId, approverId) {
    try {
      const submission = await prisma.submission.update({
        where: { id: parseInt(submissionId) },
        data: {
          status: 'APPROVED',
          approverId,
        },
      });
      return submission;
    } catch (error) {
      console.error(error);
      throw new Error(`Error approving submission ${submissionId}: ${JSON.stringify(error)}`);
    }
  }

  static async rejectSubmission(submissionId, approverId) {
    try {
      const submission = await prisma.submission.update({
        where: { id: parseInt(submissionId) },
        data: {
          status: 'REJECTED',
          approverId,
        },
      });
      return submission;
    } catch (error) {
      console.error(error);
      throw new Error(`Error rejecting submission ${submissionId}: ${JSON.stringify(error)}`);
    }
  }

  static async getSubmission(submissionId) {
    try {
      const submission = await prisma.submission.findUnique({
        where: { id: parseInt(submissionId) },
      });
      return submission;
    } catch (error) {
      console.error(error);
      throw new Error(`Error getting submission ${submissionId}: ${JSON.stringify(error)}`);
    }
  }
}
