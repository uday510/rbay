import { itemsByPriceKey, itemsByViewsKey, itemsKey } from "$services/keys";
import { client } from "$services/redis";
import { deserialize } from ".";

export const itemsByPrice = async (
  order: 'DESC' | 'ASC' = 'DESC',
  offset = 0,
  count = 10
) => {
  const fields = ['name', 'views', 'endingAt', 'imageUrl', 'price'] as const;

  const res = (await client.sort(itemsByPriceKey(), {
    GET: ['#', ...fields.map(f => `${itemsKey('*')}->${f}`)],
    BY: 'NOSORT',
    DIRECTION: order,
    LIMIT: { offset, count },
  })) as string[];

  const step = fields.length + 1;
  const items = [];
  for (let i = 0; i < res.length; i += step) {
    const [id, ...values] = res.slice(i, i + step);
    const attrs = Object.fromEntries(fields.map((f, j) => [f, values[j]]));
    items.push(deserialize(id, attrs));
  }

  return items;
};
