/*
  Warnings:

  - The primary key for the `Config` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Config" (
    "guild_id" TEXT NOT NULL,
    "setting_type" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    PRIMARY KEY ("guild_id", "setting_type")
);
INSERT INTO "new_Config" ("guild_id", "setting_type", "value") SELECT "guild_id", "setting_type", "value" FROM "Config";
DROP TABLE "Config";
ALTER TABLE "new_Config" RENAME TO "Config";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
