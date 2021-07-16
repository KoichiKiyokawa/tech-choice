import { Controller, Get } from '@nestjs/common'
import { FrameworkService } from './framework.service'

@Controller('frameworks')
export class FrameworkController {
  constructor(private readonly frameworkService: FrameworkService) {}

  @Get()
  getAllFramework() {
    return this.frameworkService.getAllFrameworks()
  }

  @Get('/all_info')
  getAllFrameworkInfo(): Promise<string> {
    return this.frameworkService.getAllFrameworkInfo()
  }
}
