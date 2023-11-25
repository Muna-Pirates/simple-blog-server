import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const roleData = [{ name: 'Admin' }, { name: 'User' }];

async function main() {
  for (const role of roleData) {
    await prisma.role.create({
      data: role,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
