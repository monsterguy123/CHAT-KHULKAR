/*
  Warnings:

  - You are about to drop the column `content` on the `OneVOneMessage` table. All the data in the column will be lost.
  - Added the required column `message` to the `OneVOneMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OneVOneMessage" DROP COLUMN "content",
ADD COLUMN     "message" TEXT NOT NULL;
