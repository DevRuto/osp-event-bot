-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EventParticipant" (
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "rsn" TEXT,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',

    PRIMARY KEY ("userId", "eventId"),
    CONSTRAINT "EventParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "DiscordUser" ("discordId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EventParticipant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EventParticipant" ("eventId", "note", "rsn", "status", "userId") SELECT "eventId", "note", "rsn", "status", "userId" FROM "EventParticipant";
DROP TABLE "EventParticipant";
ALTER TABLE "new_EventParticipant" RENAME TO "EventParticipant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
