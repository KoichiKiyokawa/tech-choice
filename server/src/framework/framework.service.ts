import { Injectable } from '@nestjs/common'
import { Similarity } from '@prisma/client'
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

  async getAllFrameworkSimilarities(): Promise<Similarity[]> {
    return this.prisma.similarity.findMany()
  }
}
