import { Consumer, Kafka, KafkaConfig, Producer, SASLOptions } from 'kafkajs'
import { v4 as uuid } from 'uuid'
import { envs } from '@configs/env'

let client: Kafka
let producer: Producer
let consumer: Consumer

const setClient = () => {
  let sasl
  const mechanism = envs.BROKER_KAFKA_MECHANISM
  const username = envs.BROKER_KAFKA_USERNAME
  const pswd = envs.BROKER_KAFKA_SECRET

  const connectionConfig = {
    clientId: `wem-${uuid()}`,
    brokers: [`${envs.BROKER_HOST}:${envs.BROKER_PORT}`],
  } as KafkaConfig

  if (mechanism && username && pswd) {
    sasl = {
      mechanism,
      username,
      password: pswd,
    } as SASLOptions

    connectionConfig.sasl = sasl
    connectionConfig.ssl = !!sasl
  }

  client = new Kafka(connectionConfig)

  producer = client.producer()
  consumer = client.consumer({
    groupId: 'flowbuild-wem-consumer-group',
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
