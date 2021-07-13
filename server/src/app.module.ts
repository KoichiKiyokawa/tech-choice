import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { FrameworkModule } from './framework/framework.module'

@Module({
  imports: [FrameworkModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
