import { QueueItem } from "../types";
import { DEFAULTS } from "../constants";

export const makeAsyncQueue = <T>(maxSize = DEFAULTS.QUEUE_MAX_SIZE) => {
  let items: Array<QueueItem<T>> = [];
  let resolvers: Array<(value: QueueItem<T>) => void> = [];

  const put = async (item: QueueItem<T>): Promise<void> => {
    if (items.length >= maxSize) throw new Error("Queue is full");
    
    if (resolvers.length > 0) {
      const resolve = resolvers.shift()!;
      resolve(item);

      return;
    }

    items.push(item);
  };

  const get = async (): Promise<QueueItem<T>> => {
    const item = items.shift();
    if (item !== undefined) return item;
    return new Promise((resolve) => resolvers.push(resolve));
  };

  const size = (): number => items.length;

  return { put, get, size };
};


