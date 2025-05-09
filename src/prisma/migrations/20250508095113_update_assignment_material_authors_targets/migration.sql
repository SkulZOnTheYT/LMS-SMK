/*
  Warnings:

  - Added the required column `authorId` to the `Assignment` table without a default value. This is not possible if the table is not empty.
  - Made the column `dueDate` on table `Assignment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `authorId` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "targetKelas" "UserRole",
ALTER COLUMN "dueDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "targetKelas" "UserRole";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
