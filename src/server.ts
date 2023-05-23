import { app } from '@/app'
import { envs } from '@configs/env'
import { runWorker } from './workerRunner'

const runServer = async () => {
  await runWorker()

  const server = await app({
    logger: true,
  })

  server.listen({ port: envs.SERVER_PORT, host: '0.0.0.0' }, (err, address) => {
    if (err) throw err
    console.info(`Server is running on ${address}`)
  })

  await server.ready()
  server.swagger()
}

runServer()
