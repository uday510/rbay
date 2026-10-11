import { bidHistoryKey } from '$services/keys';
import { client } from '$services/redis';
import type { CreateBidAttrs, Bid } from '$services/types';
import { DateTime } from 'luxon';

export const createBid = async (attrs: CreateBidAttrs) => {
  const serialized = serializeHistory(
    attrs.amount,
    attrs.createdAt.toMillis()
  );

  return client.rPush(bidHistoryKey(attrs.itemId), serialized);
};

export const getBidHistory = async (itemId: string, offset = 0, count = 10): Promise<Bid[]> => {
  const st = -1 * offset - count;
  const en = -1 - offset;

  const data = await client.lRange(bidHistoryKey(itemId), st, en);

  return data.map((bid) => deserializeHistory(bid));
};


const serializeHistory = (amount: number, createdAt: number) => {
  return `${amount}:${createdAt}`;
}

const deserializeHistory = (stored: string) => {
  const [amount, createdAt] = stored.split(":");

  return {
    amount: parseFloat(amount),
    createdAt: DateTime.fromMillis(parseInt(createdAt))
  }

}
