import { prisma } from '../modules/prisma'

export const FrameworkController = {
  async getScores() {
    return prisma.framework.findMany({ include: { score: true } })
  },
  async getSimilarities() {
    return prisma.similarity.findMany()
  },
}
