/*
  Warnings:

  - The primary key for the `Submission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Submission` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
