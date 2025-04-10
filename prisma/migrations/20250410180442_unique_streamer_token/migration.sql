/*
  Warnings:

  - A unique constraint covering the columns `[access_token]` on the table `streamers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "streamers_access_token_key" ON "streamers"("access_token");
