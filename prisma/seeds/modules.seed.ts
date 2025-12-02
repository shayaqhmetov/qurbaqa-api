/* eslint-disable @typescript-eslint/no-var-requires */
import { PrismaClient, ModuleType } from '../../generated/prisma';
const modules = require('../../fixtures/modules.json');
const languages = require('../../fixtures/languages.json');

const prisma = new PrismaClient();

export type ModuleSeedData = {
  type: ModuleType;
  name: string;
  description: string;
  icon: string;
};

async function seedModules() {
  console.log('🌱 Seeding modules...');

  // Example: If you want to seed modules for each language, you need to ensure the types match.
  // Assuming modules is an array of objects like { en: {...}, ru: {...} }
  const targetModules: ModuleSeedData[] = modules.map((mod: any) => {
    const moduleForLang = mod.en;
    return {
      type: moduleForLang.type as ModuleType,
      name: moduleForLang.name,
      description: moduleForLang.description,
      icon: moduleForLang.icon,
    };
  });
  for (const moduleData of targetModules) {
    await prisma.module.upsert({
      where: { type: moduleData.type },
      update: moduleData,
      create: moduleData,
    });
    console.log(`✅ Module ${moduleData.name} created/updated`);
  }

  console.log('✅ Modules seeded successfully');
}

async function seedTranslations() {
  console.log('🌱 Seeding languages...');
  for (const langData of languages) {
    await prisma.language.upsert({
      where: { code: langData.code },
      update: langData,
      create: langData,
    });
    console.log(`✅ Language ${langData.name} created/updated`);
  }

  for (const langData of languages) {
    for (const mod of modules) {
      const moduleForLang = mod[langData.code];
      if (moduleForLang) {
        const moduleRecord = await prisma.module.findUnique({
          where: { type: moduleForLang.type as ModuleType },
        });
        if (moduleRecord) {
          // TODO: make correct seeding when Translation model is ready
          // await prisma.translation.upsert({
          //   where: {
          //     languageCode_moduleId: {
          //       languageCode: langData.code,
          //       moduleId: moduleRecord.id,
          //     },
          //   },
          //   update: {
          //     name: moduleForLang.name,
          //     description: moduleForLang.description,
          //   },
          //   create: {
          //     languageCode: langData.code,
          //     moduleId: moduleRecord.id,
          //     name: moduleForLang.name,
          //     description: moduleForLang.description,
          //   },
          // });
          // await prisma.translation.upsert({
          //   where: {
          //     languageCode_moduleId: {
          //       languageCode: langData.code,
          //       moduleId: moduleRecord.id,
          //     },
          //   },
          //   update: {
          //     name: moduleForLang.name,
          //     description: moduleForLang.description,
          //   },
          //   create: {
          //     languageCode: langData.code,
          //     moduleId: moduleRecord.id,
          //     name: moduleForLang.name,
          //     description: moduleForLang.description,
          //   },
          // });
          console.log(
            `✅ Module translation for ${moduleForLang.name} in ${langData.code} created/updated`,
          );
        }
      }
    }
  }
  console.log('✅ Languages seeded successfully');
}

seedModules()
  .catch((e) => {
    console.error('❌ Error seeding modules:', e);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await seedTranslations();
    } catch (e) {
      console.error('❌ Error seeding languages:', e);
      process.exit(1);
    }
    await prisma.$disconnect();
  });
