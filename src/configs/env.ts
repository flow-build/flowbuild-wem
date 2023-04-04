const envs = {
  FLOWBUILD_SERVER_URL:
    process.env.FLOWBUILD_SERVER_URL || 'http://localhost:3000',
  FS_TOKEN_EXPIRE: parseInt(process.env.FS_TOKEN_TTL || '300', 10),
  STREAM_CONFIG: JSON.parse(
    process.env.STREAM_CONFIG ||
      `
    {
      "topics": {
        "wem-start-process": {
          "consumesFrom": ["kafka"]
        }
      }
    }
  `
  ),
  BROKER_HOST: process.env.BROKER_HOST || 'localhost',
  BROKER_PORT: process.env.BROKER_PORT || '9092',
  BROKER_KAFKA_MECHANISM: process.env.BROKER_KAFKA_MECHANISM,
  BROKER_KAFKA_USERNAME: process.env.BROKER_KAFKA_USERNAME,
  BROKER_KAFKA_SECRET: process.env.BROKER_KAFKA_SECRET,
  REDIS_PASSWORD:
    process.env.REDIS_PASSWORD || 'eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81',
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || '6379',
}
export { envs }
