import { createClient, RedisClientType } from "redis";
import { REDIS } from "../constants";

export const redisClient: RedisClientType = createClient({
  socket: {
    path: REDIS.SOCKET_PATH,
    tls: REDIS.TLS,
  },
});

redisClient.connect().catch(console.error);


