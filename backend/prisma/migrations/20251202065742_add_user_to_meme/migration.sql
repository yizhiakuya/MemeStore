-- AlterTable
ALTER TABLE "Meme" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "Meme_userId_idx" ON "Meme"("userId");

-- AddForeignKey
ALTER TABLE "Meme" ADD CONSTRAINT "Meme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
