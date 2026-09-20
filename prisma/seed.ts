import "dotenv/config";
import { PrismaClient, Gender, RelationshipType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.childship.deleteMany();
  await prisma.union.deleteMany();
  await prisma.person.deleteMany();

  const patriarch = await prisma.person.create({
    data: {
      familyCode: "FAM-10001",
      firstName: "Abraham",
      lastName: "Mensah",
      gender: Gender.MALE,
      birthDate: new Date("1945-03-12"),
      isLiving: true,
      bio: "Patriarch of the extended Mensah lineage.",
    },
  });

  const wife1 = await prisma.person.create({
    data: {
      familyCode: "FAM-10002",
      firstName: "Ama",
      lastName: "Mensah",
      gender: Gender.FEMALE,
      birthDate: new Date("1948-07-22"),
      isLiving: true,
    },
  });

  const wife2 = await prisma.person.create({
    data: {
      familyCode: "FAM-10003",
      firstName: "Efua",
      lastName: "Mensah",
      gender: Gender.FEMALE,
      birthDate: new Date("1952-11-05"),
      isLiving: true,
    },
  });

  const unionAma = await prisma.union.create({
    data: {
      partner1Id: patriarch.id,
      partner2Id: wife1.id,
      marriageDate: new Date("1970-06-15"),
      isActive: true,
      sequenceOrder: 0,
    },
  });

  const unionEfua = await prisma.union.create({
    data: {
      partner1Id: patriarch.id,
      partner2Id: wife2.id,
      marriageDate: new Date("1980-01-20"),
      isActive: true,
      sequenceOrder: 1,
    },
  });

  const kwame = await prisma.person.create({
    data: {
      familyCode: "FAM-10004",
      firstName: "Kwame",
      lastName: "Mensah",
      gender: Gender.MALE,
      birthDate: new Date("1975-04-10"),
      isLiving: true,
    },
  });

  const akosua = await prisma.person.create({
    data: {
      familyCode: "FAM-10005",
      firstName: "Akosua",
      lastName: "Mensah",
      gender: Gender.FEMALE,
      birthDate: new Date("1978-09-03"),
      isLiving: true,
    },
  });

  const kofi = await prisma.person.create({
    data: {
      familyCode: "FAM-10006",
      firstName: "Kofi",
      lastName: "Mensah",
      gender: Gender.MALE,
      birthDate: new Date("1985-12-18"),
      isLiving: true,
    },
  });

  await prisma.childship.createMany({
    data: [
      {
        unionId: unionAma.id,
        childId: kwame.id,
        relationshipType: RelationshipType.BIOLOGICAL,
      },
      {
        unionId: unionAma.id,
        childId: akosua.id,
        relationshipType: RelationshipType.BIOLOGICAL,
      },
      {
        unionId: unionEfua.id,
        childId: kofi.id,
        relationshipType: RelationshipType.BIOLOGICAL,
      },
    ],
  });

  const grandfather = await prisma.person.create({
    data: {
      familyCode: "FAM-10007",
      firstName: "Yaw",
      lastName: "Mensah",
      gender: Gender.MALE,
      birthDate: new Date("1920-01-01"),
      deathDate: new Date("1998-05-05"),
      isLiving: false,
    },
  });

  const grandmother = await prisma.person.create({
    data: {
      familyCode: "FAM-10008",
      firstName: "Adwoa",
      lastName: "Mensah",
      gender: Gender.FEMALE,
      birthDate: new Date("1925-08-14"),
      deathDate: new Date("2005-02-02"),
      isLiving: false,
    },
  });

  const parentUnion = await prisma.union.create({
    data: {
      partner1Id: grandfather.id,
      partner2Id: grandmother.id,
      marriageDate: new Date("1942-03-01"),
      isActive: false,
      sequenceOrder: 0,
    },
  });

  await prisma.childship.create({
    data: {
      unionId: parentUnion.id,
      childId: patriarch.id,
      relationshipType: RelationshipType.BIOLOGICAL,
    },
  });

  const paternalUncle = await prisma.person.create({
    data: {
      familyCode: "FAM-10009",
      firstName: "Kojo",
      lastName: "Mensah",
      gender: Gender.MALE,
      birthDate: new Date("1948-02-02"),
      isLiving: true,
      bio: "Full paternal uncle to Kwame (patriarch's brother).",
    },
  });

  await prisma.childship.create({
    data: {
      unionId: parentUnion.id,
      childId: paternalUncle.id,
      relationshipType: RelationshipType.BIOLOGICAL,
    },
  });

  console.log("Seed complete. Focal demo: FAM-10004 (Kwame Mensah)");
  console.log(
    JSON.stringify(
      {
        patriarch: patriarch.familyCode,
        kwame: kwame.familyCode,
        wives: [wife1.familyCode, wife2.familyCode],
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
