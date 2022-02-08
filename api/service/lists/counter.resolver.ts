import { prop as Property, getModelForClass } from '@typegoose/typegoose';
import {
  Field,
  ObjectType,
  InputType,
  ArgsType,
  Int,
  Float,
  Resolver,
  Query,
  Mutation,
  Arg,
  Args,
  Authorized,
  Ctx,
} from 'type-graphql';
import {
  CoreArgs,
  BaseArgs,
  CoreType,
  BaseResolver,
  PaginatedResponse,
} from './core.model';
import { ObjectId } from 'mongodb';
import { IContext } from 'nuudel-main';
import { AuthenticationError } from 'apollo-server-fastify';

@ObjectType()
export class Counter extends CoreType {
  @Field(type => String)
  @Property({ required: true, unique: true })
  listname: string;

  @Field(type => Float, { defaultValue: 0 })
  @Property({ required: true })
  sequence: number;
}

@InputType()
@ArgsType()
export class CounterInput implements Partial<Counter> {
  @Field(type => String)
  listname: string;

  @Field(type => Float, { defaultValue: 0 })
  sequence: number;
}

@ArgsType()
export class CounterArg extends CounterInput {}

// we need to create a temporary class for the abstract, generic class "instance"
@ObjectType()
export class CounterResponse extends PaginatedResponse(Counter) {
  // you can add more fields here if you need
}

const CounterBaseResolver = BaseResolver<Counter, CounterResponse>(
  Counter,
  CounterResponse,
);

@Resolver(of => Counter)
export class CounterResolver extends CounterBaseResolver {
  @Authorized('Admin')
  @Mutation(returns => Counter, { name: `update${Counter.name}` })
  async updateItem(
    @Arg('_id', type => ObjectId) _id: string,
    @Args() obj: CounterArg,
    @Ctx() ctx: IContext,
  ): Promise<Counter> {
    return this.editItem(_id, obj, ctx);
  }

  @Authorized('Admin')
  @Mutation(returns => Counter, { name: `add${Counter.name}` })
  async addItem(
    @Arg(`input${Counter.name}`, { nullable: true }) data: CounterInput,
    @Ctx() ctx: IContext,
  ) {
    return this.newItem(data as Counter, ctx);
  }
}
