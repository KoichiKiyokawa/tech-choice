import { FastifyInstance } from 'fastify'
import { FrameworkController } from './framework/framework.controller'

export function setupRouter(app: FastifyInstance) {
  app.get('/', async () => 'ok')
  app.get('/frameworks/scores', FrameworkController.getScores)
  app.get('/frameworks/similarities', FrameworkController.getSimilarities)
}
