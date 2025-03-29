import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import logger from '../src/utils/logger.js';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.submission.deleteMany();
  await prisma.eventParticipant.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.event.deleteMany();
  await prisma.discordUser.deleteMany();

  // Create Discord users
  const users = await Promise.all(
    Array.from({ length: 10 }, async () => {
      return prisma.discordUser.create({
        data: {
          discordId: faker.string.uuid(),
          username: faker.internet.userName(),
          discriminator: faker.string.numeric(4),
          avatar: faker.image.avatar(),
          roles: JSON.stringify([faker.string.uuid(), faker.string.uuid()]),
          joinedAt: faker.date.past(),
          lastSeen: faker.date.recent(),
        },
      });
    })
  );

  // Create events
  const events = await Promise.all(
    Array.from({ length: 3 }, async () => {
      const startDate = faker.date.future();
      return prisma.event.create({
        data: {
          name: faker.word.words(3),
          description: faker.lorem.paragraph(),
          startDate,
          endDate: faker.date.future({ years: 1, refDate: startDate }),
          status: faker.helpers.arrayElement(['PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED']),
        },
      });
    })
  );

  // Create teams
  const teams = await Promise.all(
    Array.from({ length: 5 }, async () => {
      const leader = faker.helpers.arrayElement(users);
      return prisma.team.create({
        data: {
          name: faker.word.words(2),
          description: faker.lorem.sentence(),
          leaderId: leader.id,
        },
      });
    })
  );

  // Create team members (ensuring no duplicates)
  for (const team of teams) {
    // Get available users (excluding the team leader)
    const availableUsers = users.filter((user) => user.id !== team.leaderId);

    // Randomly select 1-4 additional members
    const numMembers = faker.number.int({ min: 1, max: 4 });
    const selectedUsers = faker.helpers.arrayElements(availableUsers, numMembers);

    // Create team memberships
    await Promise.all(
      selectedUsers.map((user) =>
        prisma.teamMember.create({
          data: {
            userId: user.id,
            teamId: team.id,
            role: 'MEMBER',
            joinedAt: faker.date.past(),
          },
        })
      )
    );
  }

  // Create event participants (ensuring no duplicates)
  for (const event of events) {
    // Randomly select 3-8 participants
    const numParticipants = faker.number.int({ min: 3, max: 8 });
    const selectedUsers = faker.helpers.arrayElements(users, numParticipants);

    await Promise.all(
      selectedUsers.map((user) =>
        prisma.eventParticipant.create({
          data: {
            userId: user.id,
            eventId: event.id,
            status: faker.helpers.arrayElement(['REGISTERED', 'INTERESTED', 'UNPAID']),
          },
        })
      )
    );
  }

  await Promise.all(
    events.flatMap((event) =>
      Array.from({ length: faker.number.int({ min: 5, max: 15 }) }, async () => {
        const user = faker.helpers.arrayElement(users);
        const team = faker.helpers.arrayElement(teams);
        return prisma.submission.create({
          data: {
            name: faker.word.words(3),
            value: faker.number.int({ min: 100, max: 10000 }).toString(),
            proofUrl: faker.image.url(),
            status: faker.helpers.arrayElement(['PENDING', 'APPROVED', 'REJECTED']),
            userId: user.id,
            eventId: event.id,
            teamId: team.id,
          },
        });
      })
    )
  );

  logger.info('Database seeded successfully!');
}

main()
  .catch((e) => {
    logger.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
