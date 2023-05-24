const WORKFLOW_EVENTS_NAMESPACE = process.env.WORKFLOW_EVENTS_NAMESPACE
const envs = {
  FLOWBUILD_SERVER_URL:
    process.env.FLOWBUILD_SERVER_URL || 'http://localhost:3000',
  FS_TOKEN_EXPIRE: parseInt(process.env.FS_TOKEN_TTL || '300', 10),
  STREAM_INTERFACE: process.env.STREAM_INTERFACE || 'kafka',
  STREAM_CONFIG: JSON.parse(
    process.env.STREAM_CONFIG ||
      `
    {
      "topics": {
        "${
          WORKFLOW_EVENTS_NAMESPACE ? `${WORKFLOW_EVENTS_NAMESPACE}.` : ''
        }wem.process.start": {
          "consumesFrom": ["kafka"]
        },
        "${
          WORKFLOW_EVENTS_NAMESPACE ? `${WORKFLOW_EVENTS_NAMESPACE}.` : ''
        }wem.workflow.target.create": {
          "consumesFrom": ["kafka"]
        },
        "${
          WORKFLOW_EVENTS_NAMESPACE ? `${WORKFLOW_EVENTS_NAMESPACE}.` : ''
        }wem.process.target.create": {
          "consumesFrom": ["kafka"]
        }
      }
    }
  `
  ),
  BROKER_HOST: process.env.BROKER_HOST || 'localhost',
  BROKER_PORT: process.env.BROKER_PORT || '9092',
  BROKER_KAFKA_MECHANISM: process.env.BROKER_KAFKA_MECHANISM || 'plain',
  BROKER_KAFKA_USERNAME: process.env.BROKER_KAFKA_USERNAME || '',
  BROKER_KAFKA_SECRET: process.env.BROKER_KAFKA_SECRET || '',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || '6379',
  REDIS_WEM_EVENTS_DB: process.env.REDIS_WEM_EVENTS_DB || '7',
  SERVER_HOST: process.env.SERVER_HOST || 'locahost',
  SERVER_PORT: parseInt(process.env.SERVER_PORT || '3333', 10),
  INITIALIZING_RETRIES_AMOUNT: parseInt(
    process.env.INITIALIZING_RETRIES_AMOUNT || '100',
    10
  ),
  INITIALIZING_RETRIES_DELAY_SECONDS: parseInt(
    process.env.INITIALIZING_RETRIES_DELAY_SECONDS || '5',
    10
  ),
}
export { envs }
