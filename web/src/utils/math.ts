/**
 * 与えられた数字を、指定された桁数で四捨五入する
 * @param num 対象の数字
 * @param digits 桁数(少数第何位まで残すか)
 * @returns 四捨五入した結果
 */
export function roundByTheDigits(num: number, digits: number): number {
  if (digits <= 0) digits = 2
  return Math.round(num * 10 ** digits) / 10 ** digits
}
