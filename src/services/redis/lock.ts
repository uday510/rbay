import { randomBytes } from 'node:crypto';
import { client } from './client';

type Client = typeof client;

const RELEASE_LOCK = `
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
end
return 0
`;

export interface Lock {
  key: string;
  token: string;
  signal: AbortSignal;
}

export const withLock = async <T>(
  key: string,
  cb: (client: Client, lock: Lock) => Promise<T>,
  { ttlMs = 2000, retries = 20, retryDelayMs = 100, safetyMs = 200 } = {}
): Promise<T> => {
  const token = randomBytes(6).toString('hex');
  const lockKey = `lock:${key}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const startedAt = Date.now(); // before SET: the deadline errs on the safe side
    const acquired = await client.set(lockKey, token, { NX: true, PX: ttlMs });

    if (acquired) {
      const controller = new AbortController();
      const remaining = ttlMs - safetyMs - (Date.now() - startedAt);
      const timer = setTimeout(() => controller.abort(), Math.max(remaining, 0));

      try {
        const lock = { key: lockKey, token, signal: controller.signal };
        return await cb(buildClientProxy(controller.signal), lock);
      } finally {
        clearTimeout(timer);
        await client.eval(RELEASE_LOCK, { keys: [lockKey], arguments: [token] });
      }
    }

    await pause(retryDelayMs + Math.random() * retryDelayMs);
  }

  throw new Error(`Could not acquire lock for ${key}`);
};

const buildClientProxy = (signal: AbortSignal): Client => {

  const handler: ProxyHandler<Client> = {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function') return value;

      return (...args: unknown[]) => {
        if (signal.aborted) {
          throw new Error('LOCK_LOST:Lock expired');
        }
        return value.apply(target, args);
      };
    },
  };

  return new Proxy(client, handler);
};

const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
