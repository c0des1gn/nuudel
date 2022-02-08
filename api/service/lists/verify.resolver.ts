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
export class Verify extends CoreType {
  @Field(type => String, { defaultValue: '' })
  @Property({ required: false })
  userId: string;

  @Field(type => String)
  @Property({ required: true })
  mail: string;

  @Field(type => String)
  @Property({ required: true })
  code: string;

  @Field(type => Date)
  @Property({ required: true, index: true, expires: 86400 })
  expire: Date;
}

@InputType()
@ArgsType()
export class VerifyInput implements Partial<Verify> {
  @Field(type => String, { defaultValue: '' })
  userId: string;

  @Field(type => String)
  mail: string;

  @Field(type => String)
  code: string;

  @Field(type => Date)
  expire: Date;
}

@ArgsType()
export class VerifyArg extends VerifyInput {}

// we need to create a temporary class for the abstract, generic class "instance"
@ObjectType()
export class VerifyResponse extends PaginatedResponse(Verify) {
  // you can add more fields here if you need
}

const VerifyBaseResolver = BaseResolver<Verify, VerifyResponse>(
  Verify,
  VerifyResponse,
);

@Resolver(of => Verify)
export class VerifyResolver extends VerifyBaseResolver {
  @Authorized('Admin')
  @Mutation(returns => Verify, { name: `update${Verify.name}` })
  async updateItem(
    @Arg('_id', type => ObjectId) _id: string,
    @Args() obj: VerifyArg,
    @Ctx() ctx: IContext,
  ): Promise<Verify> {
    if (ctx?.user?.type !== 'Admin') {
      throw new AuthenticationError("Don't have permission to update an item");
    }
    return this.editItem(_id, obj, ctx);
  }

  @Authorized('Admin')
  @Mutation(returns => Verify, { name: `add${Verify.name}` })
  async addItem(
    @Arg(`input${Verify.name}`, { nullable: true }) data: VerifyInput,
    @Ctx() ctx: IContext,
  ) {
    if (ctx?.user?.type !== 'Admin') {
      throw new AuthenticationError("Don't have permission to add an item");
    }
    return this.newItem(data as Verify, ctx);
  }
}
