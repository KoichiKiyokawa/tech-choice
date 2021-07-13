import fetch from 'node-fetch'
import dayjs from 'dayjs'
import { toRange } from 'rhodash'
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
 * @param name フレームワークの名前
 * @returns 新しい順にダウンロード数を格納した配列
 */
export async function fetchDownloadsV2({ name }: { name: string }): Promise<Download[]> {
  const today = dayjs()
  const oneYearAgo = today.subtract(1, 'year')
  const oneYearAgoDiffDays = today.diff(oneYearAgo, 'days') // 一年前の日付が何日前かを取得 365 or 366

  return await Promise.all(
    toRange(0, oneYearAgoDiffDays).map((dayAgo) => fetchSpecificDayAgo({ name, dayAgo })),
  )
}

/**
 * あるフレームワークの、{dayAgo}日前のダウンロード数を取得する
 * @param name フレームワークの名前
 * @param dayAgo 何日前のデータか。当日は0日前とする
 * @private
 */
function fetchSpecificDayAgo({
  name,
  dayAgo,
}: {
  name: string
  dayAgo: number
}): Promise<Download> {
  const oneYearAgoYYYYMMDD = dayjs().subtract(dayAgo, 'days').format('YYYY-MM-DD')
  return fetch(`${ENDPOINT}/${oneYearAgoYYYYMMDD}/${name}`).then((r) => r.json())
}

// fetchDownloadsV2({ name: 'svelte' }).then(console.log)
