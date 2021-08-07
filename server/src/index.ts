import fastify from 'fastify'
import cors from 'fastify-cors'
import { setupRouter } from './router'

const isProd = process.env.NODE_ENV === 'production'
const app = fastify({ logger: { prettyPrint: !isProd } })
app.register(cors)
setupRouter(app)

app.listen(process.env.PORT ?? 3000)
