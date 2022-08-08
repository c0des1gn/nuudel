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
import { Note, Image, Link } from 'nuudel-main';
import { ImageObj, ImageInput } from './image.resolver';
import { Country, Currency } from '../enums';
import { ObjectId } from 'mongodb';
import type { IContext } from 'nuudel-main';
import { Min } from 'class-validator';

@ObjectType()
export class Test extends CoreType {
  @Field(type => String, { defaultValue: '' })
  @Property({ required: true })
  test: string;

  @Min(0)
  @Field(type => Float, { defaultValue: 0 })
  @Property({ required: false })
  extrafee: number;

  //* test list
  @Field(type => Image, { nullable: true })
  @Property({ required: false })
  image: object;

  @Field(type => Note, { defaultValue: '' })
  @Property({ required: false })
  note: string;

  @Field(type => Date, { defaultValue: new Date() })
  @Property({ required: false })
  date: Date;

  @Field(type => Country, { defaultValue: Country.USA })
  @Property({ required: true })
  condition: Country;

  @Field(type => [Currency], { defaultValue: Currency.MNT })
  @Property({ required: true })
  money: Currency[];

  @Field(type => Boolean, { defaultValue: false })
  @Property({ required: false })
  bool: boolean;

  @Field(type => Link, { defaultValue: '' })
  @Property({ required: false })
  link: string; // */
}

@InputType()
@ArgsType()
export class TestInput implements Partial<Test> {
  @Field(type => String, { defaultValue: '' })
  test: string;

  @Min(0)
  @Field(type => Float, { defaultValue: 0 })
  extrafee: number;
  //*
  @Field(type => ImageInput, { nullable: true })
  image: object;

  @Field(type => Note, { defaultValue: '' })
  note: string;

  @Field(type => Date, { defaultValue: new Date() })
  date: Date;

  @Field(type => Country, { defaultValue: Country.USA })
  condition: Country;

  @Field(type => [Currency], { defaultValue: Currency.MNT })
  money: Currency[];

  @Field(type => Boolean, { defaultValue: false })
  bool: boolean;

  @Field(type => Link, { defaultValue: '' })
  link: string; // */
}

@ArgsType()
export class TestArg extends TestInput {}

// we need to create a temporary class for the abstract, generic class "instance"
@ObjectType()
export class TestResponse extends PaginatedResponse(Test) {
  // you can add more fields here if you need
}

const TestBaseResolver = BaseResolver<Test, TestResponse>(Test, TestResponse);

@Resolver(of => Test)
export class TestResolver extends TestBaseResolver {
  @Authorized()
  @Mutation(returns => Test, { name: `update${Test.name}` })
  async updateItem(
    @Arg('_id', type => ObjectId) _id: string,
    @Args() obj: TestArg,
    @Ctx() ctx: IContext,
  ): Promise<Test> {
    return this.editItem(_id, obj, ctx);
  }

  @Authorized()
  @Mutation(returns => Test, { name: `add${Test.name}` })
  async addItem(
    @Arg(`input${Test.name}`, { nullable: true }) data: TestInput,
    @Ctx() ctx: IContext,
  ) {
    return this.newItem(data as Test, ctx);
  }
}
