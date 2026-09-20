-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('BIOLOGICAL', 'ADOPTED', 'STEP');

-- CreateEnum
CREATE TYPE "PrivacyLevel" AS ENUM ('PUBLIC', 'TREE', 'IMMEDIATE_FAMILY', 'PRIVATE');

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "familyCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'UNKNOWN',
    "birthDate" TIMESTAMP(3),
    "deathDate" TIMESTAMP(3),
    "photoUrl" TEXT,
    "bio" TEXT,
    "isLiving" BOOLEAN NOT NULL DEFAULT true,
    "privacyLevel" "PrivacyLevel" NOT NULL DEFAULT 'TREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Union" (
    "id" TEXT NOT NULL,
    "partner1Id" TEXT NOT NULL,
    "partner2Id" TEXT NOT NULL,
    "marriageDate" TIMESTAMP(3),
    "divorceDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sequenceOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Union_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Childship" (
    "id" TEXT NOT NULL,
    "unionId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "relationshipType" "RelationshipType" NOT NULL DEFAULT 'BIOLOGICAL',

    CONSTRAINT "Childship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Person_familyCode_key" ON "Person"("familyCode");

-- CreateIndex
CREATE INDEX "Person_familyCode_idx" ON "Person"("familyCode");

-- CreateIndex
CREATE INDEX "Person_lastName_firstName_idx" ON "Person"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "Union_partner1Id_idx" ON "Union"("partner1Id");

-- CreateIndex
CREATE INDEX "Union_partner2Id_idx" ON "Union"("partner2Id");

-- CreateIndex
CREATE INDEX "Childship_childId_idx" ON "Childship"("childId");

-- CreateIndex
CREATE INDEX "Childship_unionId_idx" ON "Childship"("unionId");

-- CreateIndex
CREATE UNIQUE INDEX "Childship_unionId_childId_key" ON "Childship"("unionId", "childId");

-- AddForeignKey
ALTER TABLE "Union" ADD CONSTRAINT "Union_partner1Id_fkey" FOREIGN KEY ("partner1Id") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Union" ADD CONSTRAINT "Union_partner2Id_fkey" FOREIGN KEY ("partner2Id") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Childship" ADD CONSTRAINT "Childship_unionId_fkey" FOREIGN KEY ("unionId") REFERENCES "Union"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Childship" ADD CONSTRAINT "Childship_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
