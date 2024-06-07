/*
  Warnings:

  - You are about to drop the column `timestamp` on the `OneVOneMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OneVOneMessage" DROP COLUMN "timestamp",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
