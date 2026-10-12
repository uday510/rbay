import { client, withLock } from '$services/redis';
import type { CreateBidAttrs, Bid } from '$services/types';
import { DateTime } from 'luxon';
import { bidHistoryKey, itemsByPriceKey, itemsKey } from '$services/keys';

const CREATE_BID = `
local itemKey, historyKey, byPriceKey = KEYS[1], KEYS[2], KEYS[3]
local userId, amount, createdAt, entry, itemId =
  ARGV[1], tonumber(ARGV[2]), tonumber(ARGV[3]), ARGV[4], ARGV[5]

if not amount or amount <= 0 then
  return redis.error_reply('INVALID_AMOUNT:Bid amount must be a positive number')
end

if redis.call('EXISTS', itemKey) == 0 then
  return redis.error_reply('ITEM_NOT_FOUND:This item does not exist')
end

local endingAt = tonumber(redis.call('HGET', itemKey, 'endingAt'))
local price    = tonumber(redis.call('HGET', itemKey, 'price')) or 0

if not endingAt or createdAt >= endingAt then
  return redis.error_reply('AUCTION_CLOSED:Bidding on this item has ended')
end
if amount <= price then
  local highest = redis.call('HGET', itemKey, 'highestBidUserId')

  if highest == userId then
    return redis.error_reply('BID_TOO_LOW:You are already the highest bidder at ' .. price .. '. Bid more than ' .. price .. ' to raise it')
  elseif not highest or highest == '' then
    return redis.error_reply('BID_TOO_LOW:Starting price is ' .. price .. '. Bid more than ' .. price)
  else
    return redis.error_reply('BID_TOO_LOW:Current highest bid is ' .. price .. '. Bid more than ' .. price)
  end
end

redis.call('RPUSH', historyKey, entry)
redis.call('HSET', itemKey, 'price', amount, 'highestBidUserId', userId)
redis.call('HINCRBY', itemKey, 'bids', 1)
redis.call('ZADD', byPriceKey, amount, itemId)
return 1
`;

export const createBid = async (attrs: CreateBidAttrs) => {
  return withLock(attrs.itemId, async (lockedClient, lock) => {
    const createdAt = attrs.createdAt.toMillis();

    return lockedClient.eval(CREATE_BID, {
      keys: [itemsKey(attrs.itemId), bidHistoryKey(attrs.itemId), itemsByPriceKey(), lock.key],
      arguments: [
        attrs.userId, String(attrs.amount), String(createdAt),
        serializeHistory(attrs.amount, createdAt), attrs.itemId, lock.token,
      ],
    });
  });

  /**
   * const createdAt = attrs.createdAt.toMillis();

   return client.eval(CREATE_BID, {
     keys: [
       itemsKey(attrs.itemId),
       bidHistoryKey(attrs.itemId),
       itemsByPriceKey(),
     ],
     arguments: [
       attrs.userId,
       String(attrs.amount),
       String(createdAt),
       serializeHistory(attrs.amount, createdAt),
       attrs.itemId,
     ],
   });
   */

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
