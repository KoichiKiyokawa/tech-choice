import { Controller, Get } from '@nestjs/common'
import { FrameworkService } from './framework.service'

@Controller('framework')
export class FrameworkController {
  constructor(private readonly frameworkService: FrameworkService) {}

  @Get()
  getAllFrameworkInfo(): Promise<string> {
    return this.frameworkService.getAllFrameworkInfo()
  }
}
