-- DropIndex
DROP INDEX "Friends_userId_key";

-- CreateTable
CREATE TABLE "OneVOneChat" (
    "id" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OneVOneChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OneVOneMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,

    CONSTRAINT "OneVOneMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OneVOneMessage" ADD CONSTRAINT "OneVOneMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OneVOneMessage" ADD CONSTRAINT "OneVOneMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
