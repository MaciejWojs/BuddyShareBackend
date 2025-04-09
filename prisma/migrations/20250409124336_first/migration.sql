-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "user_info_id" INTEGER NOT NULL,
    "user_settings_id" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_info" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "profile_picture" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userRole" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "users_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" SERIAL NOT NULL,
    "notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
    "darkMode" BOOLEAN NOT NULL DEFAULT true,
    "password_hash" TEXT NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streamers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "access_token" TEXT NOT NULL,

    CONSTRAINT "streamers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderators" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "moderators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stream_moderators" (
    "id" SERIAL NOT NULL,
    "streamer_id" INTEGER NOT NULL,
    "moderator_id" INTEGER NOT NULL,

    CONSTRAINT "stream_moderators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streams" (
    "id" SERIAL NOT NULL,
    "streamer_id" INTEGER NOT NULL,
    "options_id" INTEGER NOT NULL,

    CONSTRAINT "streams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" SERIAL NOT NULL,
    "stream_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stream_options" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL,
    "isLive" BOOLEAN NOT NULL,
    "path" TEXT,

    CONSTRAINT "stream_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streams_tags" (
    "id" SERIAL NOT NULL,
    "stream_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "streams_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streams_categories" (
    "id" SERIAL NOT NULL,
    "stream_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "streams_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "stream_id" INTEGER,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "isRead" BOOLEAN NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscribers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "streamer_id" INTEGER NOT NULL,

    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "followers" (
    "id" SERIAL NOT NULL,
    "follower_user_id" INTEGER NOT NULL,
    "followed_user_id" INTEGER NOT NULL,

    CONSTRAINT "followers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_user_info_id_key" ON "users"("user_info_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_settings_id_key" ON "users"("user_settings_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_info_username_key" ON "users_info"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_info_email_key" ON "users_info"("email");

-- CreateIndex
CREATE UNIQUE INDEX "streamers_user_id_key" ON "streamers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "moderators_user_id_key" ON "moderators"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "streams_options_id_key" ON "streams"("options_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "followers_follower_user_id_followed_user_id_key" ON "followers"("follower_user_id", "followed_user_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_user_info_id_fkey" FOREIGN KEY ("user_info_id") REFERENCES "users_info"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_user_settings_id_fkey" FOREIGN KEY ("user_settings_id") REFERENCES "user_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streamers" ADD CONSTRAINT "streamers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderators" ADD CONSTRAINT "moderators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stream_moderators" ADD CONSTRAINT "stream_moderators_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "streamers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stream_moderators" ADD CONSTRAINT "stream_moderators_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "moderators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streams" ADD CONSTRAINT "streams_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "streamers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streams" ADD CONSTRAINT "streams_options_id_fkey" FOREIGN KEY ("options_id") REFERENCES "stream_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "streams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streams_tags" ADD CONSTRAINT "streams_tags_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "streams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streams_tags" ADD CONSTRAINT "streams_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streams_categories" ADD CONSTRAINT "streams_categories_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "streams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streams_categories" ADD CONSTRAINT "streams_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "streams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "streamers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_user_id_fkey" FOREIGN KEY ("follower_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_followed_user_id_fkey" FOREIGN KEY ("followed_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
