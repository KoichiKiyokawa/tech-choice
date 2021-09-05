// StackOverflowでの質問に関するデータを収集、保存する
import { PrismaClient } from '@prisma/client'
import dayjs from 'dayjs'
import fetch from 'node-fetch'

const prisma = new PrismaClient()

async function main() {
  const frameworkList = await prisma.framework.findMany()
  // 並行処理をするとIP制限に引っかかるため、一つづつ処理する。
  for (const framework of frameworkList) {
    const lastFetchedQuestion = await prisma.question.findFirst({
      where: { frameworkId: framework.id },
      orderBy: { askedAt: 'desc' },
    })
    const lastFetchedAt = lastFetchedQuestion?.askedAt
    await fetchAndSaveQuestionDataForSpecificFramework({
      id: framework.id,
      name: framework.name,
      fromDate: lastFetchedAt,
      // FIXME: 一時的なもの
      toDate: new Date(2021, 9 - 1, 1),
    })
  }
}

type ApiResult = {
  items: ApiResultItem[]
  has_more: boolean
  quota_max: number
  quota_remaining: number
  error_name?: 'throttle_violation'
  error_message?: string
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
 * 特定のフレームワークに対して、StackOverflowでの質問情報を取得する。
 * APIの制限が1日1万件と厳しいため、「そのフレームワークの取得済みデータの最後の日付(fromDate)」から処理を再開できるようにする
 * @param {number} id フレームワークの DB における ID
 * @param {string} name フレームワークの名前
 */
async function fetchAndSaveQuestionDataForSpecificFramework({
  id,
  name,
  fromDate = dayjs().add(-1, 'year').toDate(),
  toDate = new Date(),
}: {
  id: number
  name: string
  fromDate?: Date
  toDate?: Date
}): Promise<void> {
  let page = 1
  while (true) {
    const query = new URLSearchParams({
      page: String(page++),
      pagesize: '100',
      order: 'asc',
      sort: 'creation',
      tagged: name,
      fromdate: String((fromDate.getTime() / 1000).toFixed(0)), // jsのDateは経過ミリ秒で扱うため経過秒数に変換する必要がある
      todate: String((toDate.getTime() / 1000).toFixed(0)),
      site: 'stackoverflow',
    })
    const fetchQuestionURL = `https://api.stackexchange.com/2.3/questions?${query}`
    console.log(fetchQuestionURL)

    const res: ApiResult = await fetch(fetchQuestionURL).then((r) => r.json())
    console.log(res)
    // API制限に引っかかると次のレスポンスが返ってくる。 { error_id: 502, error_message: 'too many requests from this IP, more requests available in 84907 seconds', error_name: 'throttle_violation' }
    if (res.error_name === 'throttle_violation') {
      console.log(res.error_message)
      break
    }

    await prisma.question.createMany({
      data: res.items.map((item) => ({
        id: item.question_id,
        frameworkId: id,
        // creation_date は unix epoch time(経過秒数)である。cf) https://api.stackexchange.com/docs/dates
        // jsのDateは経過ミリ秒で扱うため変換する必要がある
        askedAt: new Date(item.creation_date * 1000),
        answerCount: item.answer_count,
      })),
      skipDuplicates: true,
    })

    if (res.quota_remaining <= 0) {
      console.log('no quota remain')
      break
    }
    if (!res.has_more) break
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
