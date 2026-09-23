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
      title: "Al-Haj",
      firstName: "Muhammad",
      lastName: "Khan",
      urduFirstName: "محمد",
      urduLastName: "خان",
      gender: Gender.MALE,
      birthDate: new Date("1945-03-12"),
      birthPlace: "Lahore",
      currentCity: "Karachi",
      homeTown: "Lahore",
      motherTongue: "Urdu",
      occupation: "Patriarch",
      bio: "Founder of the extended Khan lineage.",
    },
  });

  const wife1 = await prisma.person.create({
    data: {
      familyCode: "FAM-10002",
      firstName: "Fatima",
      lastName: "Khan",
      urduFirstName: "فاطمہ",
      urduLastName: "خان",
      gender: Gender.FEMALE,
      birthDate: new Date("1948-07-22"),
      currentCity: "Karachi",
      homeTown: "Multan",
    },
  });

  const wife2 = await prisma.person.create({
    data: {
      familyCode: "FAM-10003",
      firstName: "Ayesha",
      lastName: "Khan",
      urduFirstName: "عائشہ",
      urduLastName: "خان",
      gender: Gender.FEMALE,
      birthDate: new Date("1952-11-05"),
      currentCity: "Karachi",
      homeTown: "Hyderabad",
    },
  });

  const unionFatima = await prisma.union.create({
    data: {
      partner1Id: patriarch.id,
      partner2Id: wife1.id,
      marriageDate: new Date("1970-06-15"),
      isActive: true,
    },
  });

  const unionAyesha = await prisma.union.create({
    data: {
      partner1Id: patriarch.id,
      partner2Id: wife2.id,
      marriageDate: new Date("1980-01-20"),
      isActive: true,
    },
  });

  const hassan = await prisma.person.create({
    data: {
      familyCode: "FAM-10004",
      firstName: "Hassan",
      lastName: "Khan",
      nickname: "Hassu",
      urduFirstName: "حسن",
      urduLastName: "خان",
      gender: Gender.MALE,
      birthDate: new Date("1975-04-10"),
      currentCity: "Karachi",
      homeTown: "Lahore",
    },
  });

  const zainab = await prisma.person.create({
    data: {
      familyCode: "FAM-10005",
      firstName: "Zainab",
      lastName: "Khan",
      urduFirstName: "زینب",
      urduLastName: "خان",
      gender: Gender.FEMALE,
      birthDate: new Date("1978-09-03"),
      currentCity: "Lahore",
    },
  });

  const bilal = await prisma.person.create({
    data: {
      familyCode: "FAM-10006",
      firstName: "Bilal",
      lastName: "Khan",
      urduFirstName: "بلال",
      urduLastName: "خان",
      gender: Gender.MALE,
      birthDate: new Date("1985-12-18"),
      currentCity: "Islamabad",
    },
  });

  await prisma.childship.createMany({
    data: [
      {
        unionId: unionFatima.id,
        childId: hassan.id,
        relationshipType: RelationshipType.BIOLOGICAL,
      },
      {
        unionId: unionFatima.id,
        childId: zainab.id,
        relationshipType: RelationshipType.BIOLOGICAL,
      },
      {
        unionId: unionAyesha.id,
        childId: bilal.id,
        relationshipType: RelationshipType.BIOLOGICAL,
      },
    ],
  });

  const grandfather = await prisma.person.create({
    data: {
      familyCode: "FAM-10007",
      firstName: "Yusuf",
      lastName: "Khan",
      urduFirstName: "یوسف",
      urduLastName: "خان",
      gender: Gender.MALE,
      birthDate: new Date("1920-01-01"),
      deathDate: new Date("1998-05-05"),
      birthPlace: "Amritsar",
      homeTown: "Lahore",
    },
  });

  const grandmother = await prisma.person.create({
    data: {
      familyCode: "FAM-10008",
      firstName: "Khadija",
      lastName: "Khan",
      urduFirstName: "خدیجہ",
      urduLastName: "خان",
      gender: Gender.FEMALE,
      birthDate: new Date("1925-08-14"),
      deathDate: new Date("2005-02-02"),
      homeTown: "Lahore",
    },
  });

  const parentUnion = await prisma.union.create({
    data: {
      partner1Id: grandfather.id,
      partner2Id: grandmother.id,
      marriageDate: new Date("1942-03-01"),
      isActive: false,
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
      firstName: "Imran",
      lastName: "Khan",
      urduFirstName: "عمران",
      urduLastName: "خان",
      gender: Gender.MALE,
      birthDate: new Date("1948-02-02"),
      currentCity: "Lahore",
      bio: "Paternal uncle to Hassan.",
    },
  });

  await prisma.childship.create({
    data: {
      unionId: parentUnion.id,
      childId: paternalUncle.id,
      relationshipType: RelationshipType.BIOLOGICAL,
    },
  });

  console.log("Seed complete. Focal demo: FAM-10004 (Hassan Khan)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
