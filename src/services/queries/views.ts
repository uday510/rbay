import { itemsByViewsKey, itemsViewsKey, itemsKey } from "$services/keys";
import { client } from "$services/redis";

// export const incrementView = async (itemId: string, userId: string) => {
//   const ok = await client.pfAdd(itemsViewsKey(itemId), userId);
//   if (!ok) return;
//
//   await client
//     .multi()
//     .hIncrBy(itemsKey(itemId), 'views', 1)
//     .zIncrBy(itemsByViewsKey(), 1, itemId)
//     .execAsPipeline();
// };

const INCREMENT_VIEW = `
if redis.call('EXISTS', KEYS[2]) == 0 then
  return 0
end
if redis.call('PFADD', KEYS[1], ARGV[1]) == 1 then
  redis.call('HINCRBY', KEYS[2], 'views', 1)
  redis.call('ZINCRBY', KEYS[3], 1, ARGV[2])
  return 1
end
return 0
`;

export const incrementView = (itemId: string, userId: string) =>
  client.eval(INCREMENT_VIEW, {
    keys: [itemsViewsKey(itemId), itemsKey(itemId), itemsByViewsKey()],
    arguments: [userId, itemId],
});
