import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../prisma.service'
import { FrameworkController } from './framework.controller'
import { FrameworkService } from './framework.service'

describe('FrameworkController', () => {
  let controller: FrameworkController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FrameworkController],
      providers: [FrameworkService, PrismaService],
    }).compile()

    controller = module.get<FrameworkController>(FrameworkController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
