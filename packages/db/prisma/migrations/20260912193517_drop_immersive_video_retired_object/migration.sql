/*
  Warnings:

  - You are about to drop the `ImmersiveVideoRetiredObject` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ImmersiveVideoRetiredObject" DROP CONSTRAINT "ImmersiveVideoRetiredObject_videoId_fkey";

-- DropTable
DROP TABLE "ImmersiveVideoRetiredObject";
