import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class FrameworkService {
  constructor(private readonly prisma: PrismaService) {}

  getAllFrameworks() {
    return this.prisma.framework.findMany()
  }

  async getAllFrameworkInfo() {
    // TODO:
    return ''
  }
}
