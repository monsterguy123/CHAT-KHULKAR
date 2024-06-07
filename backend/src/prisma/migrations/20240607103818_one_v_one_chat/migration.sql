/*
  Warnings:

  - Added the required column `ChatId` to the `OneVOneMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OneVOneMessage" ADD COLUMN     "ChatId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "OneVOneMessage" ADD CONSTRAINT "OneVOneMessage_ChatId_fkey" FOREIGN KEY ("ChatId") REFERENCES "OneVOneChat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
