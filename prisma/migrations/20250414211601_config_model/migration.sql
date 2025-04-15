-- CreateTable
CREATE TABLE "Config" (
    "guild_id" TEXT NOT NULL PRIMARY KEY,
    "setting_type" TEXT NOT NULL,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Config_guild_id_setting_type_idx" ON "Config"("guild_id", "setting_type");
