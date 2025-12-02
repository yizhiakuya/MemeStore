-- AlterTable
ALTER TABLE "Meme" ADD COLUMN     "textContent" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'image',
ALTER COLUMN "originalUrl" DROP NOT NULL,
ALTER COLUMN "thumbnailUrl" DROP NOT NULL,
ALTER COLUMN "filename" DROP NOT NULL,
ALTER COLUMN "fileSize" DROP NOT NULL,
ALTER COLUMN "mimeType" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Meme_type_idx" ON "Meme"("type");
