-- CreateEnum
CREATE TYPE "FileCategory" AS ENUM ('AVATAR', 'ATTACHMENT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarFileId" TEXT;

-- CreateTable
CREATE TABLE "FileRecord" (
    "id" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "category" "FileCategory" NOT NULL DEFAULT 'ATTACHMENT',
    "uploadedById" TEXT NOT NULL,
    "taskId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileRecord_storageKey_key" ON "FileRecord"("storageKey");

-- CreateIndex
CREATE INDEX "FileRecord_uploadedById_idx" ON "FileRecord"("uploadedById");

-- CreateIndex
CREATE INDEX "FileRecord_taskId_idx" ON "FileRecord"("taskId");

-- CreateIndex
CREATE INDEX "FileRecord_category_idx" ON "FileRecord"("category");

-- CreateIndex
CREATE UNIQUE INDEX "User_avatarFileId_key" ON "User"("avatarFileId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatarFileId_fkey" FOREIGN KEY ("avatarFileId") REFERENCES "FileRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileRecord" ADD CONSTRAINT "FileRecord_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileRecord" ADD CONSTRAINT "FileRecord_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;