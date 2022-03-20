import { prisma } from '../modules/prisma'

export const MetaController = {
  async touch() {
    await prisma.meta.upsert({
      create: {
        touchedAt: new Date(),
      },
      update: {
        touchedAt: new Date(),
      },
      where: {
        id: 1,
      },
    })

    return 'meta data is updated!'
  },
}
