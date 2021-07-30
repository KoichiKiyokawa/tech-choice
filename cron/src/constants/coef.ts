// 係数類をまとめる

/**
 * 1/(経過日数) だと1日前と2日前の差が大きくなりすぎる。
 * そこで、1/(経過日数+AGING_COEF)とすることで、差を縮める
 */
export const AGING_COEF = 30