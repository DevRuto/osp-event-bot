/*
  Warnings:

  - You are about to drop the column `discordId` on the `DiscordUser` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DiscordUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "discriminator" TEXT,
    "avatar" TEXT,
    "roles" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_DiscordUser" ("avatar", "createdAt", "discriminator", "id", "joinedAt", "lastSeen", "roles", "updatedAt", "username") SELECT "avatar", "createdAt", "discriminator", "id", "joinedAt", "lastSeen", "roles", "updatedAt", "username" FROM "DiscordUser";
DROP TABLE "DiscordUser";
ALTER TABLE "new_DiscordUser" RENAME TO "DiscordUser";
CREATE TABLE "new_EventParticipant" (
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "rsn" TEXT,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',

    PRIMARY KEY ("userId", "eventId"),
    CONSTRAINT "EventParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "DiscordUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EventParticipant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EventParticipant" ("eventId", "note", "rsn", "status", "userId") SELECT "eventId", "note", "rsn", "status", "userId" FROM "EventParticipant";
DROP TABLE "EventParticipant";
ALTER TABLE "new_EventParticipant" RENAME TO "EventParticipant";
CREATE TABLE "new_Submission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "proofUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "approverId" TEXT,
    CONSTRAINT "Submission_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "DiscordUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "DiscordUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Submission_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Submission_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Submission" ("createdAt", "eventId", "id", "name", "proofUrl", "status", "teamId", "updatedAt", "userId", "value") SELECT "createdAt", "eventId", "id", "name", "proofUrl", "status", "teamId", "updatedAt", "userId", "value" FROM "Submission";
DROP TABLE "Submission";
ALTER TABLE "new_Submission" RENAME TO "Submission";
CREATE INDEX "Submission_userId_idx" ON "Submission"("userId");
CREATE INDEX "Submission_eventId_idx" ON "Submission"("eventId");
CREATE INDEX "Submission_teamId_idx" ON "Submission"("teamId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
