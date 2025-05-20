-- CreateTable
CREATE TABLE "banned_users_per_streamer" (
    "id" SERIAL NOT NULL,
    "streamer_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "reason" TEXT NOT NULL DEFAULT 'Unknown reason',
    "banned_by" INTEGER NOT NULL,
    "banned_since" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "banned_until" TIMESTAMP(3),
    "is_permanent" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "banned_users_per_streamer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "banned_users_per_streamer" ADD CONSTRAINT "banned_users_per_streamer_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "streamers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banned_users_per_streamer" ADD CONSTRAINT "banned_users_per_streamer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
