// // src/common/errorTracking.service.ts

// import { Injectable } from '@nestjs/common';
// import { PrismaService } from './prisma.service';

// @Injectable()
// export class ErrorTrackingService {
//   constructor(private prisma: PrismaService) {}

//   async trackError(error: any): Promise<void> {
//     // Assuming a 'errors' table in the database schema
//     const errorRecord = {
//       message: error.message,
//       locations: JSON.stringify(error.locations),
//       path: JSON.stringify(error.path),
//       errorCode: error.extensions?.code,
//     };

//     // try {
//     //   // Assuming the Prisma model for the 'errors' table is named 'error'
//     //   await this.prisma.error.create({ data: errorRecord });
//     //   console.log('Error recorded successfully.');
//     // } catch (dbError) {
//     //   console.error('Failed to record error:', dbError);
//     // }
//   }
// }
