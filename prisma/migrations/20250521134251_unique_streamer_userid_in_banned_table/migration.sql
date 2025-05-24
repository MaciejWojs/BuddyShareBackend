/*
  Warnings:

  - A unique constraint covering the columns `[streamer_id,user_id]` on the table `banned_users_per_streamer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "banned_users_per_streamer_streamer_id_user_id_key" ON "banned_users_per_streamer"("streamer_id", "user_id");
