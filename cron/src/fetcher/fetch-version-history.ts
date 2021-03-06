import dayjs from 'dayjs'
import fetch from 'node-fetch'
import { fixedLastCalculatedAt } from '../constants/date'
import { DateISOstring } from '../types/date'

const packageMetadataEndpoint = 'https://registry.npmjs.org'

type Version = string
type PackageMetadataResponse = {
  time: Record<'created' | 'modified' | Version, DateISOstring>
}

/**
 * これまでに公開されたバージョンの公開日時を返す。ただし、beta版などの実験的バージョンは含まない。
 * また対象期間に入っているもののみを返却する。@see isInDateScope
 * @param {string} npmPackageName npmでのパッケージ名
 * @returns 該当パッケージのダウンロード数
 */
export async function fetchVersionHistory(npmPackageName: string): Promise<DateISOstring[]> {
  const res: PackageMetadataResponse = await fetch(
    `${packageMetadataEndpoint}/${npmPackageName}`,
  ).then((r) => r.json())

  // レスポンスのtimeプロパティには、バージョンを表す文字列だけでなく、レジストリの作成日時(created)と最終更新日時(modified)
  // も含まれてしまっているので除外する
  return Object.entries(res.time)
    .filter(
      ([version, date]) =>
        version !== 'created' &&
        version !== 'modified' &&
        !isExperimentalVersion(version) &&
        isInDateScope(date),
    )
    .map(([, date]) => date)
}

/**
 * ベータ版やexperimentalバージョンなどを除外する
 */
function isExperimentalVersion(version: string): boolean {
  if (version.includes('-')) return true // e.g. 1.0.0-0など。rcと変わらない
  if (version.includes('exp')) return true
  if (version.includes('beta')) return true
  if (version.includes('dev')) return true
  if (version.includes('alpha')) return true
  if (version.includes('rc')) return true
  // if (version.startsWith('0')) return true

  return false
}

/** 研究対象となる期間に入っているか */
function isInDateScope(date: DateISOstring) {
  return dayjs(date).isBefore(fixedLastCalculatedAt)
}
