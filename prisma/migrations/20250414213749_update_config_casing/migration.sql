/*
  Warnings:

  - The primary key for the `Config` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `guild_id` on the `Config` table. All the data in the column will be lost.
  - You are about to drop the column `setting_type` on the `Config` table. All the data in the column will be lost.
  - Added the required column `guildId` to the `Config` table without a default value. This is not possible if the table is not empty.
  - Added the required column `settingType` to the `Config` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Config" (
    "guildId" TEXT NOT NULL,
    "settingType" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    PRIMARY KEY ("guildId", "settingType")
);
INSERT INTO "new_Config" ("value") SELECT "value" FROM "Config";
DROP TABLE "Config";
ALTER TABLE "new_Config" RENAME TO "Config";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
