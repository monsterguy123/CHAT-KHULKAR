/*
  Warnings:

  - The primary key for the `Group` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `adminId` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `groupDescription` on the `Group` table. All the data in the column will be lost.
  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `messageType` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GroupMembers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "_GroupMembers" DROP CONSTRAINT "_GroupMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroupMembers" DROP CONSTRAINT "_GroupMembers_B_fkey";

-- AlterTable
ALTER TABLE "Group" DROP CONSTRAINT "Group_pkey",
DROP COLUMN "adminId",
DROP COLUMN "groupDescription",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Group_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Group_id_seq";

-- AlterTable
ALTER TABLE "Message" DROP CONSTRAINT "Message_pkey",
DROP COLUMN "messageType",
DROP COLUMN "senderId",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "groupId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Message_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Message_id_seq";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "_GroupMembers";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
