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
export class Pushnotification extends CoreType {
  @Field(type => ObjectId, { nullable: true, defaultValue: null })
  @Property({ required: true, index: true, expires: 259200 }) //ref: User
  _userId: ObjectId;

  @Field(type => String)
  @Property({ required: true, unique: true, index: true })
  registerToken: string;

  @Field(type => String)
  @Property({ required: false })
  fingerprint: string;

  @Field(type => Date)
  @Property({ required: false })
  subscribedOn?: Date;

  @Field(type => Detail, { nullable: true })
  @Property({ required: true })
  details: object;
}

@InputType()
@ArgsType()
export class PushnotificationInput implements Partial<Pushnotification> {
  @Field(type => ObjectId, { nullable: true, defaultValue: null })
  _userId: ObjectId;

  @Field(type => String)
  registerToken: string;

  @Field(type => String)
  fingerprint: string;

  @Field(type => Date)
  subscribedOn?: Date;

  @Field(type => DetailInput, { nullable: true })
  details: object;
}

@ObjectType()
export class Detail {
  @Field(type => String)
  @Property({ required: false })
  device: string;

  @Field(type => String)
  @Property({ required: false })
  brand: string;

  @Field(type => String)
  @Property({ required: false })
  os: string;

  @Field(type => String)
  @Property({ required: false })
  osVersion: string;

  @Field(type => String, { nullable: true })
  @Property({ required: false })
  browser?: string;
}

@ArgsType()
@InputType()
export class DetailInput implements Partial<Detail> {
  @Field(type => String)
  device: string;

  @Field(type => String)
  brand: string;

  @Field(type => String)
  os: string;

  @Field(type => String)
  osVersion: string;

  @Field(type => String, { nullable: true })
  browser?: string;
}

@ArgsType()
export class PushnotificationArg extends PushnotificationInput {}

// we need to create a temporary class for the abstract, generic class "instance"
@ObjectType()
export class PushnotificationResponse extends PaginatedResponse(
  Pushnotification,
) {
  // you can add more fields here if you need
}

const PushnotificationBaseResolver = BaseResolver<
  Pushnotification,
  PushnotificationResponse
>(Pushnotification, PushnotificationResponse);

@Resolver(of => Pushnotification)
export class PushnotificationResolver extends PushnotificationBaseResolver {
  @Authorized('Admin')
  @Mutation(returns => Pushnotification, {
    name: `update${Pushnotification.name}`,
  })
  async updateItem(
    @Arg('_id', type => ObjectId) _id: string,
    @Args() obj: PushnotificationArg,
    @Ctx() ctx: IContext,
  ): Promise<Pushnotification> {
    return this.editItem(_id, obj, ctx);
  }

  @Authorized('Admin')
  @Mutation(returns => Pushnotification, {
    name: `add${Pushnotification.name}`,
  })
  async addItem(
    @Arg(`input${Pushnotification.name}`, { nullable: true })
    data: PushnotificationInput,
    @Ctx() ctx: IContext,
  ) {
    const result = await this.Model.findOneAndUpdate(
      { registerToken: data.registerToken },
      {
        $set: { ...data, subscribedOn: new Date() },
      },
      { new: true },
    );
    if (result) {
      return result;
    }
    return this.newItem(data as Pushnotification, ctx);
  }
}
