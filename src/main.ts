import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

const prisma = new PrismaClient();

async function seedDatabase() {
  const roleData = [{ name: 'Admin' }, { name: 'User' }];

  for (const role of roleData) {
    const existingRole = await prisma.role.findUnique({
      where: { name: role.name },
    });

    if (!existingRole) {
      await prisma.role.create({ data: role });
    }
  }
}

async function bootstrap() {
  try {
    await seedDatabase();
    console.log('Database seeding completed.');

    const app = await NestFactory.create(AppModule);

    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors({
      origin: 'http://localhost:7777',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
    app.use(helmet({ contentSecurityPolicy: false }));

    await app.listen(3000);
    console.log(`Application is running on: ${await app.getUrl()}`);
  } catch (error) {
    console.error('Error during seeding or app initialization:', error);
    process.exit(1);
  }
}
bootstrap();
