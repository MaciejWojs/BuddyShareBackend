-- AlterTable
ALTER TABLE "chat_messages" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "is_deleted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "isRead" SET DEFAULT false;

-- AlterTable
ALTER TABLE "stream_options" ALTER COLUMN "title" SET DEFAULT 'Sample Title',
ALTER COLUMN "description" SET DEFAULT 'Sample Description',
ALTER COLUMN "isDeleted" SET DEFAULT false,
ALTER COLUMN "isLive" SET DEFAULT true,
ALTER COLUMN "isPublic" SET DEFAULT false;
