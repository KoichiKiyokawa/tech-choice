import dayjs from 'dayjs'
import fetch from 'node-fetch'
import { chunk, delay, toRange } from 'rhodash'
import { fixedLastCalculatedAt } from '../constants/date'
import { DateISOstring } from '../types/date'

/**
 * ある日付における、あるパッケージのダウンロード数を取得する
 * @example https://api.npmjs.org/downloads/point/2020-7-7/react
 */
const ENDPOINT = 'https://api.npmjs.org/downloads/point'

type Download = {
  downloadedAt: DateISOstring
  count: number
}

/**
 * あるフレームワークの、直近1年間のダウンロード数を取得する
 * @param name フレームワークのnpmで公開している名前
 * @returns 新しい順にダウンロード数を格納した配列
 */
export async function fetchDownloadsV2({ name }: { name: string }): Promise<Download[]> {
  const today = dayjs(fixedLastCalculatedAt)
  const oneYearAgo = today.subtract(1, 'year')
  const oneYearAgoDiffDays = today.diff(oneYearAgo, 'days') // 一年前の日付が何日前かを取得 365 or 366

  const result: Download[] = []
  // 100日ごとに並行リクエストを送る
  for (const dayAgoList of chunk(toRange(0, oneYearAgoDiffDays), 100)) {
    const thisChunkResult = await Promise.all(
      dayAgoList.map((dayAgo) => fetchSpecificDayAgo({ name, dayAgo })),
    )
    result.push(...thisChunkResult)
  }
  return result
  // API制限にかかりやすくなるため、一年まるごと並行リクエストはしない
  // return await Promise.all(
  //   toRange(0, oneYearAgoDiffDays).map((dayAgo) => fetchSpecificDayAgo({ name, dayAgo })),
  // )
}

/**
 * あるフレームワークの、{dayAgo}日前のダウンロード数を取得する
 * @param name フレームワークの名前
 * @param dayAgo 何日前のデータか。当日は0日前とする
 * @private
 */
async function fetchSpecificDayAgo(
  {
    name,
    dayAgo,
  }: {
    name: string
    dayAgo: number
  },
  retryCount: number = 0,
): Promise<Download> {
  const dayAgoInstance = dayjs().subtract(dayAgo, 'days')
  try {
    const res = await fetch(`${ENDPOINT}/${dayAgoInstance.format('YYYY-MM-DD')}/${name}`)
    if (res.status === 429) throw Error() // Too many requests

    const result: { downloads: number } = await res.json()
    return { count: result.downloads, downloadedAt: dayAgoInstance.startOf('date').toISOString() }
  } catch (err) {
    console.error(err)
    // API制限によってエラーが出る可能性がある。そのためのリトライ処理
    if (retryCount >= 20) throw err

    await delay(3000)
    console.log(`retry ${name} ${dayAgo}`)

    return fetchSpecificDayAgo({ name, dayAgo }, retryCount + 1)
  }
}

// fetchDownloadsV2({ name: 'solid-js' }).then((res) =>
//   fs.writeFileSync('log.log', JSON.stringify(res, null, 2)),
// )
