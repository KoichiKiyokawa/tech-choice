import dayjs from 'dayjs'
import fs from 'fs'

/**
 * results/ ディレクトリに結果を書き込む
 * @param result 結果
 * @param processName プロセス名 e.g. fetch-issue-and-comment
 * @param extension 拡張子
 */
export const saveResultToFile = (result: string, processName: string, extension: string = 'md') => {
  if (!fs.existsSync(`results/${processName}`)) {
    fs.mkdirSync(`results/${processName}`)
  }

  const path = `results/${processName}/${dayjs().format('YYYY-MM-DDTHH-mm')}.${extension}`
  fs.writeFileSync(path, result)
}
