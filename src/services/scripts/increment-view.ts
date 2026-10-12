import { defineScript } from 'redis';

export const incrementViewScript = defineScript({
  NUMBER_OF_KEYS: 3,
  SCRIPT: `
    local itemsViewsKey   = KEYS[1]
    local itemsKey        = KEYS[2]
    local itemsByViewsKey = KEYS[3]
    local itemId          = ARGV[1]
    local userId          = ARGV[2]

    if redis.call('EXISTS', itemsKey) == 0 then
      return 0
    end

    if redis.call('PFADD', itemsViewsKey, userId) == 1 then
      redis.call('HINCRBY', itemsKey, 'views', 1)
      redis.call('ZINCRBY', itemsByViewsKey, 1, itemId)
      return 1
    end

    return 0
  `,
  transformArguments(
    itemsViewsKey: string, itemsKey: string, itemsByViewsKey: string,
    itemId: string, userId: string
  ) {
    return [itemsViewsKey, itemsKey, itemsByViewsKey, itemId, userId];
  },
  transformReply(reply: number): boolean {
    return reply === 1;
  },
});
