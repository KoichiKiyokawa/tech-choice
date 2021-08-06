import { Controller, Get } from '@nestjs/common'
import { FrameworkService } from './framework.service'

@Controller('frameworks')
export class FrameworkController {
  constructor(private readonly frameworkService: FrameworkService) {}

  @Get()
  getAllFramework() {
    return this.frameworkService.getAllFrameworks()
  }

  @Get('/scores')
  getAllFrameworkScores() {
    return this.frameworkService.getAllFrameworkScores()
  }

  @Get('/similarities')
  getAllFrameworkSimilarities() {
    return this.frameworkService.getAllFrameworkSimilarities()
  }
}
