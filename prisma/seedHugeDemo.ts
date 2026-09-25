import "dotenv/config";
import { randomUUID } from "node:crypto";
import { Gender, PrismaClient, RelationshipType } from "@prisma/client";
import { buildHugeDemoDataset } from "../shared/demoDataset/buildHugeDemoDataset";

const prisma = new PrismaClient();

function mapGender(g: string): Gender {
  if (g === "FEMALE") return Gender.FEMALE;
  if (g === "OTHER") return Gender.OTHER;
  return Gender.MALE;
}

function mapRel(r: string): RelationshipType {
  if (r === "ADOPTED") return RelationshipType.ADOPTED;
  if (r === "STEP") return RelationshipType.STEP;
  return RelationshipType.BIOLOGICAL;
}

async function main() {
  const target = Number(process.env.DEMO_TARGET_PERSONS ?? "2500");
  console.log(`Building demo dataset (${target} people target)…`);
  const dataset = buildHugeDemoDataset({ targetPersons: target, seed: 42026 });

  const personIdMap = new Map<string, string>();
  for (const p of dataset.persons) {
    personIdMap.set(p.id, randomUUID());
  }
  const unionIdMap = new Map<string, string>();
  for (const u of dataset.unions) {
    unionIdMap.set(u.id, randomUUID());
  }
  const remapPerson = (id: string) => personIdMap.get(id) ?? randomUUID();
  const remapUnion = (id: string) => unionIdMap.get(id) ?? randomUUID();

  console.log("Clearing existing persons…");
  await prisma.childship.deleteMany();
  await prisma.union.deleteMany();
  await prisma.person.deleteMany();

  let familyCodeSeq = 10_000;
  const nextCode = () => {
    familyCodeSeq += 1;
    return `FAM-${familyCodeSeq}`;
  };

  console.log(`Importing ${dataset.persons.length} people…`);
  const batchSize = 200;
  for (let i = 0; i < dataset.persons.length; i += batchSize) {
    const slice = dataset.persons.slice(i, i + batchSize);
    await prisma.person.createMany({
      data: slice.map((p) => ({
        id: remapPerson(p.id),
        familyCode: nextCode(),
        firstName: p.firstName,
        lastName: p.lastName,
        gender: mapGender(p.gender),
        birthDate: new Date(p.birthDate),
        deathDate: p.deathDate ? new Date(p.deathDate) : null,
        currentCity: p.currentCity,
      })),
    });
    process.stdout.write(
      `  persons ${Math.min(i + batchSize, dataset.persons.length)}/${dataset.persons.length}\n`,
    );
  }

  console.log(`Importing ${dataset.unions.length} unions…`);
  for (let i = 0; i < dataset.unions.length; i += batchSize) {
    const slice = dataset.unions.slice(i, i + batchSize);
    await prisma.union.createMany({
      data: slice.map((u) => ({
        id: remapUnion(u.id),
        partner1Id: remapPerson(u.partner1Id),
        partner2Id: remapPerson(u.partner2Id),
        marriageDate: new Date(u.marriageDate),
        divorceDate: u.divorceDate ? new Date(u.divorceDate) : null,
        isActive: u.isActive,
      })),
    });
  }

  console.log(`Importing ${dataset.children.length} child links…`);
  for (let i = 0; i < dataset.children.length; i += batchSize) {
    const slice = dataset.children.slice(i, i + batchSize);
    await prisma.childship.createMany({
      data: slice.map((c) => ({
        id: randomUUID(),
        unionId: remapUnion(c.unionId),
        childId: remapPerson(c.childId),
        relationshipType: mapRel(c.relationshipType),
      })),
    });
  }

  const focal = dataset.persons.find((p) => p.id === dataset.focalPersonId);
  console.log(
    `Huge demo seed complete. Focal: ${focal?.firstName ?? "?"} ${focal?.lastName ?? ""}`,
  );
  console.log(JSON.stringify(dataset.stats, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
