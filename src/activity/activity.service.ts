import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable({})
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  getActivities() {
    return this.prisma.activity.findMany();
  }
}
