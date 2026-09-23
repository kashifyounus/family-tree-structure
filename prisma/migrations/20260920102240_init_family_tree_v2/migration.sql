-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('BIOLOGICAL', 'ADOPTED', 'STEP');

-- CreateEnum
CREATE TYPE "PrivacyLevel" AS ENUM ('PUBLIC', 'MEMBERS_ONLY', 'PRIVATE');

-- CreateTable
CREATE TABLE "persons" (
    "id" UUID NOT NULL,
    "family_code" VARCHAR(20) NOT NULL,
    "title" VARCHAR(50),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "nickname" VARCHAR(100),
    "urdu_first_name" VARCHAR(100),
    "urdu_last_name" VARCHAR(100),
    "gender" "Gender" NOT NULL,
    "birth_date" DATE,
    "death_date" DATE,
    "photo_url" TEXT,
    "bio" TEXT,
    "occupation" VARCHAR(100),
    "mother_tongue" VARCHAR(50),
    "privacy_level" "PrivacyLevel" NOT NULL DEFAULT 'MEMBERS_ONLY',
    "birth_place" VARCHAR(150),
    "current_city" VARCHAR(150),
    "permanent_city" VARCHAR(150),
    "home_town" VARCHAR(150),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unions" (
    "id" UUID NOT NULL,
    "partner_1_id" UUID NOT NULL,
    "partner_2_id" UUID NOT NULL,
    "marriage_date" DATE,
    "divorce_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "unions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children" (
    "id" UUID NOT NULL,
    "union_id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "relationship_type" "RelationshipType" NOT NULL DEFAULT 'BIOLOGICAL',

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "persons_family_code_key" ON "persons"("family_code");

-- CreateIndex
CREATE INDEX "persons_family_code_idx" ON "persons"("family_code");

-- CreateIndex
CREATE INDEX "persons_gender_idx" ON "persons"("gender");

-- CreateIndex
CREATE INDEX "persons_current_city_idx" ON "persons"("current_city");

-- CreateIndex
CREATE INDEX "persons_home_town_idx" ON "persons"("home_town");

-- CreateIndex
CREATE INDEX "persons_urdu_first_name_idx" ON "persons"("urdu_first_name");

-- CreateIndex
CREATE INDEX "persons_urdu_last_name_idx" ON "persons"("urdu_last_name");

-- CreateIndex
CREATE INDEX "unions_partner_1_id_idx" ON "unions"("partner_1_id");

-- CreateIndex
CREATE INDEX "unions_partner_2_id_idx" ON "unions"("partner_2_id");

-- CreateIndex
CREATE UNIQUE INDEX "unions_partner_1_id_partner_2_id_key" ON "unions"("partner_1_id", "partner_2_id");

-- CreateIndex
CREATE INDEX "children_union_id_idx" ON "children"("union_id");

-- CreateIndex
CREATE INDEX "children_child_id_idx" ON "children"("child_id");

-- CreateIndex
CREATE UNIQUE INDEX "children_union_id_child_id_key" ON "children"("union_id", "child_id");

-- AddForeignKey
ALTER TABLE "unions" ADD CONSTRAINT "unions_partner_1_id_fkey" FOREIGN KEY ("partner_1_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unions" ADD CONSTRAINT "unions_partner_2_id_fkey" FOREIGN KEY ("partner_2_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_union_id_fkey" FOREIGN KEY ("union_id") REFERENCES "unions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
