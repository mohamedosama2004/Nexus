-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "projectId" TEXT;

-- CreateIndex
CREATE INDEX "Invitation_projectId_idx" ON "Invitation"("projectId");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
