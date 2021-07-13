import { Module } from '@nestjs/common'
import { FrameworkService } from './framework.service'
import { FrameworkController } from './framework.controller'

@Module({
  providers: [FrameworkService],
  controllers: [FrameworkController],
})
export class FrameworkModule {}
