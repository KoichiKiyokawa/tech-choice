import fastify, { FastifyRequest } from 'fastify'
import httpError from 'http-errors'

const isProd = process.env.NODE_ENV === 'production'
const app = fastify({ logger: { prettyPrint: !isProd } })

app.addHook('onRequest', async (request) => {
  validateCronRequest(request)
})

app.get('/questions', async (req) => {
  return 'ok'
})

app.listen(process.env.PORT ?? 3000, '0.0.0.0')

/**
 * App Engine Cronからのリクエストかを検証する。cf) https://cloud.google.com/appengine/docs/standard/go/scheduling-jobs-with-cron-yaml?hl=ja#validating_cron_requests
 */
function validateCronRequest(req: FastifyRequest): void {
  if (!isProd) return // ローカルでは検証をスキップする
  // req.ipだと127.0.0.1になってしまうことに注意。また、ヘッダーは小文字になることに注意
  if (
    req.headers['x-appengine-user-ip'] === '0.1.0.2' &&
    req.headers['x-appengine-cron'] === 'true' // MEMO: クライアントがx-appengine-cronヘッダーを付けたときはApp Engine側で削除してくれる。よって、このヘッダーだけをチェックすれば良い。
  )
    return

  throw new httpError.Forbidden()
}
