import dayjs from 'dayjs'

/**
 * 現在時刻から1年以内かを判定する。1年より1秒でも短ければ true を返す
 */
export const withinOneYear = (dateStr: string) => dayjs().diff(dateStr, 'year') < 1
