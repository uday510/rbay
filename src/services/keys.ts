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
