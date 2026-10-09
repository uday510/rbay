import 'dotenv/config';
import { client } from '../src/services/redis';

const run = async () => {
  await client.hSet('user:1', {
    name: 'uday',
    age: 28,
    email: 'u@x.com',
    address: '',
    service: "undefined"
  });

  console.log(await client.hGetAll('user:1'));

  console.log(await client.hGetAll('user:2'));

};

run();
