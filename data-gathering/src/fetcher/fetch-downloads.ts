import fetch from 'node-fetch'

const NPM_ENDPOINT = 'https://api.npms.io/v2/package/'

type DateISO = string & { __type: 'DateISO' }
type DownloadHistory = [
  { from: DateISO; to: DateISO; count: number }, // daily download count. e.g. {from: "2021-07-01T00:00:00.000Z", to: "2021-07-02T00:00:00.000Z", count: 2088582}
  { from: DateISO; to: DateISO; count: number }, // weekly                e.g. {from: "2021-06-25T00:00:00.000Z", to: "2021-07-02T00:00:00.000Z", count: 10889040}
  { from: DateISO; to: DateISO; count: number }, // monthly               e.g. {from: "2021-06-02T00:00:00.000Z", to: "2021-07-02T00:00:00.000Z", count: 47778531}
  { from: DateISO; to: DateISO; count: number }, // quarterly             e.g. {from: "2021-04-03T00:00:00.000Z", to: "2021-07-02T00:00:00.000Z", count: 135635276}
  { from: DateISO; to: DateISO; count: number }, // half a year.          e.g. {from: "2021-01-03T00:00:00.000Z", to: "2021-07-02T00:00:00.000Z", count: 263589074}
  { from: DateISO; to: DateISO; count: number }, // year                  e.g. {from: "2020-07-02T00:00:00.000Z", to: "2021-07-02T00:00:00.000Z", count: 476087944}
]

/**
 * ダウンロード数に関するスコア
 * TODO: fetch以外のロジックを切り出す
 * @param name フレームワーク・ライブラリの名前
 * @returns 当日、週間、月間、四半期、半年、一年間のダウンロード数をこの順番で配列に格納して返却する。
 */
export async function fetchDownloads(name: string): Promise<DownloadHistory> {
  const data = await fetch(NPM_ENDPOINT + name).then((res) => res.json())
  const downloadHistory: DownloadHistory = data.collected.npm.downloads
  return downloadHistory
}
