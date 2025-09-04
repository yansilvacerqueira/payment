import { createClient, RedisClientType } from "redis";

export const redisClient: RedisClientType = createClient({
  socket: {
    path: "/var/run/redis/redis.sock",
    tls: false,
  },
});

redisClient.connect().catch(console.error);


