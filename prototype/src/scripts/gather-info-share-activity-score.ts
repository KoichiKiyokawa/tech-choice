import { PrismaClient } from '@prisma/client'
import {
  GetIssueAndComments,
  GetIssueAndCommentsQuery,
  GetIssueAndCommentsQueryVariables,
} from '../generated/graphql'
import { urql } from '../modules/urql'
import dayjs from 'dayjs'
import { Decimal } from 'decimal.js'
import { FRAMEWORK_WITH_OWNER_LIST } from '../constants/framework-list'

const prisma = new PrismaClient()

/**
 * 情報共有の活発さ(infoShareActivity)を計算
 * 与えられたフレームワークの、直近100件のissueを収集する。
 * それぞれのissueの、コメントについて、「コメントの文字数 ÷ 経過日数」を計算し、足し上げる。
 */
async function main() {
  for (const { name, owner } of FRAMEWORK_WITH_OWNER_LIST) {
    const result = await urql
      .query<GetIssueAndCommentsQuery, GetIssueAndCommentsQueryVariables>(GetIssueAndComments, {
        name,
        owner,
      })
      .toPromise()

    let infoShareActivityScore = new Decimal(0)
    result.data?.repository?.issues.edges?.forEach((edge) => {
      const issue = edge?.node
      issue?.comments.nodes?.forEach((comment) => {
        const eachCommentBodyLength = comment?.body.length ?? 0 // それぞれのコメントの文字数 TODO: issueテンプレートは省いたほうが良い？
        const eachCommentElapsedDate = dayjs().diff(comment?.createdAt, 'day') // それぞれのコメントの経過日数
        infoShareActivityScore = infoShareActivityScore.plus(
          new Decimal(eachCommentBodyLength).dividedBy(new Decimal(eachCommentElapsedDate || 1)), // 0で割るのを防ぐ
        )
      })
    })

    console.log(`${name}: ${infoShareActivityScore}`)
    // 2021/06/10 result
    // svelte: 8548.6102472683853181
    // react: 16413.883272641191847
    // vue: 2390.5059551806196314
  }
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
