import {
  ObjectIdScalar,
  NoteScalar,
  LinkScalar,
  LookupScalar,
  ImageScalar,
} from 'nuudel-main';
import { ObjectId, Binary, Timestamp } from 'mongodb';
import { Note, Image, Link, Lookup } from 'nuudel-main';
import { TypegooseMiddleware } from './typegoose-middleware';
import type { IContext } from 'nuudel-main';
import { buildSchema, AuthChecker } from 'type-graphql';
import path from 'path';
import { PubSub } from 'graphql-subscriptions';
//import Redis from 'ioredis';
//import { RedisPubSub } from 'graphql-redis-subscriptions';

const authChecker: AuthChecker<IContext> = (
  { root, args, context, info },
  roles,
) => {
  if (!context.user) {
    // and if no user, restrict access
    return false;
  }

  if (roles.length === 0) {
    // if `@Authorized()`, check only if user exists
    return typeof context.user !== 'undefined';
  }
  // there are some roles defined now

  if (roles.includes(context.user.type)) {
    // grant access if the type overlap
    return true;
  }

  if (context.user.roles.some(role => roles.includes(role))) {
    // grant access if the roles overlap
    return true;
  }

  // no roles matched, restrict access
  return false;
};

const makeSchema = async (HOST: string = '127.0.0.1', PORT: number = 8080) => {
  /* //configure Redis connection options
  const options: Redis.RedisOptions = {
    host: HOST,
    port: PORT,
    retryStrategy: times => Math.max(times * 100, 3000),
  };

  // create Redis-based pub-sub
  const pubSub = new RedisPubSub({
    publisher: new Redis(options),
    subscriber: new Redis(options),
  }); // */

  const pubSub = new PubSub();

  return await buildSchema({
    resolvers: [__dirname + '/**/*.resolver.ts'],
    emitSchemaFile: path.resolve(__dirname, 'schema.gql'),
    globalMiddlewares: [TypegooseMiddleware],
    authChecker,
    //authMode: 'null',
    pubSub: pubSub,
    scalarsMap: [
      { type: ObjectId, scalar: ObjectIdScalar },
      { type: Note, scalar: NoteScalar },
      { type: Link, scalar: LinkScalar },
      { type: Lookup, scalar: LookupScalar },
      { type: Image, scalar: ImageScalar },
    ],
  });
};

export default makeSchema;
