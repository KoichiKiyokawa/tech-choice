import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { FrameworkWithScore } from './framework.type'

@Injectable()
export class FrameworkService {
  constructor(private readonly prisma: PrismaService) {}

  getAllFrameworks() {
    return this.prisma.framework.findMany()
  }

  async getAllFrameworkScores(): Promise<FrameworkWithScore[]> {
    return this.prisma.framework.findMany({ include: { score: true } })
  }
}
