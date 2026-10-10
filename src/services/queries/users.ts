import { usernamesKey, usernamesUniqueKey, usersKey } from '$services/keys';
import { client } from '$services/redis';
import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';

export const getUserByUsername = async (username: string) => {
  const decimalId = await client.zScore(usernamesKey(), username);
  if (!decimalId) {
    throw new Error("User does not exists");
  }

  const id = decimalId.toString(16);

  const user = await client.hGetAll(usersKey(id));

  return deserialize(id, user);
};

export const getUserById = async (id: string) => {
  const user = await client.hGetAll(usersKey(id));

  return deserialize(id, user);
};

export const createUser = async (attrs: CreateUserAttrs) => {
  const added = await client.sAdd(usernamesUniqueKey(), attrs.username);
  if (added === 0) {
    throw new Error('username is taken');
  }

  const id = genId();
  try {
    await client
      .multi()
      .hSet(usersKey(id), serialize(attrs))
      .zAdd(usernamesKey(), { value: attrs.username, score: parseInt(id, 16) })
      .exec();
  } catch (err) {
    await client.sRem(usernamesUniqueKey(), attrs.username);
    throw err;
  }

  return id;
};
const serialize = (user: CreateUserAttrs) => {
  return {
    username: user.username,
    password: user.password,
  }
}

const deserialize = (id: string, user: { [key: string]: string }) => {
  return {
    id,
    username: user.username,
    password: user.password
  }
}
