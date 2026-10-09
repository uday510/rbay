export const pageCacheKey = (id: string) => {
  return cacheKey("pagecache#", id);
}

export const cacheKey = (prefix: string, id: string) => {
  return `{prefix}${id}`;
}
