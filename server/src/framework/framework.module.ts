import { Module } from '@nestjs/common'
import { FrameworkService } from './framework.service'
import { FrameworkController } from './framework.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
  providers: [FrameworkService, PrismaService],
  controllers: [FrameworkController],
})
export class FrameworkModule {}
