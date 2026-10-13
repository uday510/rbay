import { client } from '$services/redis';
import { deserialize } from './deserialize';
import { itemsIndexKey } from '$services/keys';

export const searchItems = async (term: string, size: number = 5) => {

  const str = term
    .replaceAll(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(t => `%${t}%`)
    .join(' ');

  if (str === '') return [];

  const query = `(@name:(${str}) => { $weight: 5.0 }) | (@description:(${str}))`

  const res = await client.ft.search(
    itemsIndexKey(),
    query, {
    LIMIT: {
      from: 0,
      size: size
    }
  }
  );

  return res.documents.map(({ id, value }) => deserialize(id, value as any))

};
