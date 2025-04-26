/*
  Warnings:

  - Added the required column `isPublic` to the `stream_options` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stream_options" ADD COLUMN     "isPublic" BOOLEAN NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "thumbnail" DROP NOT NULL;
