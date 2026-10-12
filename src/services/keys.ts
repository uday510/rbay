export const pageCacheKey = (id: string) => {
  return cacheKey("pagecache#", id);
}

export const cacheKey = (prefix: string, id: string) => {
  return `${prefix}${id}`;
}

export const usersKey = (userId: string) => {
  return cacheKey("users#", userId);
}

export const sessionsKey = (sessionId: string) => {
  return cacheKey("sessions#", sessionId);
}

export const itemsKey = (itemId: string) => {
  return cacheKey("items#", itemId);
}

export const usernamesUniqueKey = () => {
  return "usernames:unique";
}

export const userLikesKey = (userId: string) => {
  return `users:likes#${userId}`;
}

export const usernamesKey = () => {
  return "usernames";
}

export const itemsByViewsKey = () => {
  return "items:views";
}

export const itemsByEndingAtKey = () => {
  return "items:endingAt:"
}

export const itemsViewsKey = (itemId: string) => {
  return `items:views#${itemId}`;
}

export const bidHistoryKey = (itemId: string) => {
  return `history#${itemId}`;
}

export const itemsByPriceKey = () => {
  return 'items:price';
}
