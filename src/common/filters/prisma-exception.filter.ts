import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    console.log(exception);

    switch (exception.code) {
      case 'P2001':
        throw new NotFoundException(exception.meta?.cause || 'Item not found');
      case 'P2002':
        const target = exception.meta?.target;

        const targetDescription = Array.isArray(target)
          ? target.join(', ')
          : 'Value';

        throw new BadRequestException(`${targetDescription} already exists`);
      case 'P2025':
        throw new NotFoundException('Record to update not found');
      default:
        throw new InternalServerErrorException('Internal server error');
    }
  }
}
