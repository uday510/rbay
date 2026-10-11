import { itemsByEndingAtKey, itemsKey } from "$services/keys";
import { client } from "$services/redis";
import { deserialize } from ".";

export const itemsByEndingTime = async (
  order: 'DESC' | 'ASC' = 'DESC',
  offset = 0,
  count = 10
) => {
  const now = Date.now();
  const rev = order === 'DESC';

  const ids = await client.zRange(
    itemsByEndingAtKey(),
    rev ? '+inf' : now,
    rev ? now : '+inf',
    {
      BY: 'SCORE',
      REV: rev || undefined,
      LIMIT: { offset, count },
    }
  );

  if (ids.length === 0) return [];

  const pipeline = client.multi();
  ids.forEach(id => pipeline.hGetAll(itemsKey(id)));
  const results = await pipeline.execAsPipeline();

  return results.map((result, i) =>
    deserialize(ids[i], result as unknown as Record<string, string>)
  );
};
