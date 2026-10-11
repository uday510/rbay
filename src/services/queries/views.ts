import { itemsByViewsKey, itemsKey } from "$services/keys";
import { client } from "$services/redis";

export const incrementView = async (itemId: string, userId: string) => {

  await client
    .multi()
    .hIncrBy(itemsKey(itemId), 'views', 1)
    .zIncrBy(itemsByViewsKey(), 1, itemId)
    .execAsPipeline();
};
