// StackOverflowでの質問に関するデータを収集、保存する
import { PrismaClient, Question } from '@prisma/client'
import fetch from 'node-fetch'

const prisma = new PrismaClient()

async function main() {
  const frameworkList = await prisma.framework.findMany()
  await Promise.all(frameworkList.map(fetchAndSaveQuestionDataForSpecificFramework))
}

type ApiResult = {
  items: ApiResultItem[]
  has_more: boolean
  quota_max: number
  quota_remaining: number
}

type ApiResultItem = {
  tags: string[] // e.g. ['components', 'svelte']
  owner: {
    account_id: number
    reputation: number
    user_id: number
    user_type: string
    profile_image: string
    display_name: string
    link: string
  }
  is_answered: boolean
  view_count: number
  answer_count: number
  score: number
  last_activity_date: number
  creation_date: number
  question_id: number
  content_license: string
  link: string
  title: string
}

/**
 * 特定のフレームワークに対して、StackOverflowでの質問情報を取得する
 * @param {number} id フレームワークの DB における ID
 * @param {string} name フレームワークの名前
 */
async function fetchAndSaveQuestionDataForSpecificFramework({
  id,
  name,
}: {
  id: number
  name: string
}): Promise<void> {
  const result: Question[] = []
  let page = 1
  while (true) {
    const fetchQuestionURL = `https://api.stackexchange.com/2.3/questions?page=${page++}&pagesize=100&order=desc&sort=activity&tagged=${name}&site=stackoverflow`
    const res: ApiResult = await fetch(fetchQuestionURL).then((r) => r.json())
    result.push(
      ...res.items.map((item) => ({
        id: item.question_id,
        frameworkId: id,
        // creation_date は unix epoch time(経過秒数)である。cf) https://api.stackexchange.com/docs/dates
        // jsのDateは経過ミリ秒で扱うため変換する必要がある
        askedAt: new Date(item.creation_date * 1000),
        answerCount: item.answer_count,
      })),
    )

    if (!res.has_more) break
  }

  await prisma.question.createMany({ data: result, skipDuplicates: true })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
