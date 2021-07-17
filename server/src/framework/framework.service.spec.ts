import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../prisma.service'
import { FrameworkService } from './framework.service'

describe('FrameworkService', () => {
  let service: FrameworkService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FrameworkService, PrismaService],
    }).compile()

    service = module.get<FrameworkService>(FrameworkService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
