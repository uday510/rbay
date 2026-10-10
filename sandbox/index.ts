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

  await client.hSet('user:2', {
    name: 'uday',
    age: 28,
    email: 'u@x.com',
    address: '',
    service: "undefined"
  });

  await client.hSet('user:3', {
    name: 'uday',
    age: 28,
    email: 'u@x.com',
    address: '',
    service: "undefined"
  });

//   const commands = [1, 2, 3].map((id) => {
//     return client.hGetAll('user:' + id);
//   });
//
//   const res = await Promise.all(commands);
//
//   console.log(res);

  const res = await client
    .multi()
    .hGetAll('user:1')
    .hGetAll('user:2')
    .hGetAll('user:3')
    .execAsPipeline();
};



run();
