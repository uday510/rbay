import { itemsKey } from '$services/keys';
import { client } from '$services/redis';
import type { CreateItemAttrs } from '$services/types';
import { genId } from '$services/utils';
import { deserialize } from './deserialize';
import { serialize } from './serialize';

export const getItem = async (id: string) => {
  const item = await client.hGetAll(itemsKey(id));

  return Object.keys(item).length == 0 ? null : deserialize(id, item)
};

export const getItems = async (ids: string[]) => {
  const pipeline = client.multi();
  ids.forEach(id => pipeline.hGetAll(itemsKey(id)));
  const results = await pipeline.execAsPipeline();

  return results.map((result, i) => {
    const r = result as unknown as Record<string, string>;
    if (Object.keys(r).length === 0) {
      return null;
    }
    return deserialize(ids[i], r);
  });
};

export const createItem = async (attrs: CreateItemAttrs, userId: string) => {
  const id = genId();

  const serialized = serialize(attrs);

  await client.hSet(itemsKey(id), serialized);

  return id;
};
