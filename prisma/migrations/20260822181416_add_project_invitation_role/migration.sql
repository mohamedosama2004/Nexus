-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "projectRole" "ProjectRole",
ALTER COLUMN "role" DROP NOT NULL;
