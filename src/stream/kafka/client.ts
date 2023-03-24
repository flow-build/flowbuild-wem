import { Consumer, Kafka, Producer } from 'kafkajs'
import { v4 as uuid } from 'uuid'
import { envs } from '@configs/env'

let client: Kafka
let producer: Producer
let consumer: Consumer

const setClient = () => {
  client = new Kafka({
    clientId: `wem-${uuid()}`,
    brokers: [`${envs.BROKER_HOST}:${envs.BROKER_PORT}`],
  })

  producer = client.producer()
  consumer = client.consumer({
    groupId: 'wem-consumer-group',
  })
}

const connectKafka = async ({
  consumesFrom,
  producesTo,
}: {
  consumesFrom: Array<string>
  producesTo: Array<string>
}) => {
  if (consumesFrom) {
    await consumer.connect()
    for (const topic of consumesFrom)
      await consumer.subscribe({
        topic: topic,
        fromBeginning: true,
      })
  }
  if (producesTo) {
    await producer.connect()
  }

  return { producer, consumer }
}

export { client, setClient, connectKafka }
