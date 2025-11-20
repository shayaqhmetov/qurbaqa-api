import { PrismaClient, ModuleType } from '../../generated/prisma';

const prisma = new PrismaClient();

async function seedModules() {
  console.log('🌱 Seeding modules...');

  const modules: {
    type: ModuleType;
    name: string;
    description: string;
    icon: string;
  }[] = [
    {
      type: 'FINANCE',
      name: 'Finance Management',
      description:
        'Manage your accounts, transactions, budgets, and financial goals',
      icon: 'cash-outline',
    },
    {
      type: 'FOOD',
      name: 'Food & Nutrition',
      description: 'Log meals, track calories, and manage nutrition',
      icon: 'restaurant-outline',
    },
  ];

  for (const moduleData of modules) {
    await prisma.module.upsert({
      where: { type: moduleData.type },
      update: moduleData,
      create: moduleData,
    });
    console.log(`✅ Module ${moduleData.name} created/updated`);
  }

  console.log('✅ Modules seeded successfully');
}

seedModules()
  .catch((e) => {
    console.error('❌ Error seeding modules:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
