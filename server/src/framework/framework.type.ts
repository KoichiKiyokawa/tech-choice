import { Framework, Score } from '@prisma/client'

export type FrameworkWithScore = Framework & { score: Score | null }
