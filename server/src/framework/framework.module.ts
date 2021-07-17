import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { FrameworkController } from './framework.controller'
import { FrameworkService } from './framework.service'

@Module({
  providers: [FrameworkService, PrismaService],
  controllers: [FrameworkController],
})
export class FrameworkModule {}
